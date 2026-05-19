import express from 'express';
import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import Recording from '../models/Recording.js';
import { publicRecording } from '../utils/publicRecording.js';
import { fetchZoomFile } from '../services/zoomClient.js';

const router = express.Router();

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 24;
  return Math.max(1, Math.min(parsed, 60));
}

function buildFilter(query) {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = parseLimit(req.query.limit);
    const filter = buildFilter(req.query);

    const [items, total] = await Promise.all([
      Recording.find(filter)
        .sort({ startTime: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Recording.countDocuments(filter)
    ]);

    res.json({
      items: items.map(publicRecording),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const items = await Recording.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ]);

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    res.json(publicRecording(recording));
  } catch (error) {
    next(error);
  }
});

router.get('/:id/thumbnail', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    const recording = await Recording.findById(req.params.id);

    if (!recording?.thumbnailDownloadUrl) {
      return res.status(404).json({ message: 'Thumbnail not found.' });
    }

    const zoomResponse = await fetchZoomFile(recording.thumbnailDownloadUrl);

    if (!zoomResponse.ok) {
      return res.status(zoomResponse.status).json({ message: 'Unable to load thumbnail from Zoom.' });
    }

    res.status(zoomResponse.status);
    res.setHeader('Content-Type', zoomResponse.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300');

    Readable.fromWeb(zoomResponse.body).pipe(res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stream', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Recording not found.' });
    }

    const recording = await Recording.findById(req.params.id);

    if (!recording?.downloadUrl) {
      return res.status(404).json({ message: 'Recording video is not available.' });
    }

    const zoomResponse = await fetchZoomFile(recording.downloadUrl, {
      range: req.headers.range
    });

    if (!zoomResponse.ok && zoomResponse.status !== 206) {
      return res.status(zoomResponse.status).json({ message: 'Unable to stream recording from Zoom.' });
    }

    res.status(zoomResponse.status === 206 ? 206 : 200);

    const passthroughHeaders = [
      'accept-ranges',
      'content-length',
      'content-range',
      'last-modified'
    ];

    passthroughHeaders.forEach((header) => {
      const value = zoomResponse.headers.get(header);
      if (value) res.setHeader(header, value);
    });

    const zoomContentType = zoomResponse.headers.get('content-type');
    const contentType = recording.fileType === 'MP4' ? 'video/mp4' : zoomContentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    res.setHeader('Cache-Control', 'private, max-age=300');
    Readable.fromWeb(zoomResponse.body).pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;

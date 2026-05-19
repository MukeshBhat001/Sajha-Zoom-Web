import { env, getZoomUserIds, hasZoomConfig } from '../config/env.js';
import Recording from '../models/Recording.js';
import { resolveCategory } from '../utils/category.js';
import { listUserRecordings } from './zoomClient.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseZoomDate(value) {
  return value ? new Date(value) : undefined;
}

function buildDateWindows(fromDate, toDate) {
  const windows = [];
  let cursor = new Date(fromDate);

  while (cursor <= toDate) {
    const windowEnd = new Date(Math.min(cursor.getTime() + 29 * DAY_MS, toDate.getTime()));
    windows.push({
      from: formatDate(cursor),
      to: formatDate(windowEnd)
    });
    cursor = new Date(windowEnd.getTime() + DAY_MS);
  }

  return windows;
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - (env.ZOOM_SYNC_LOOKBACK_DAYS - 1) * DAY_MS);

  return { from, to };
}

function isVideoFile(file) {
  return file?.file_type === 'MP4' && file?.status === 'completed' && file?.id && file?.download_url;
}

function isThumbnailFile(file) {
  return (
    file?.recording_type === 'thumbnail' ||
    file?.file_extension === 'JPG' ||
    file?.file_type === 'JPG'
  ) && file?.download_url;
}

function friendlyRecordingType(type) {
  if (!type) return '';
  return type.replace(/\(CC\)/g, '').replace(/_/g, ' ');
}

function buildTitle(meeting, videoFiles, file) {
  const baseTitle = meeting.topic || 'Untitled Zoom class';

  if (videoFiles.length <= 1) {
    return baseTitle;
  }

  const type = friendlyRecordingType(file.recording_type);
  return type ? `${baseTitle} - ${type}` : baseTitle;
}

function durationMinutes(meeting, file) {
  if (meeting.duration) return Number(meeting.duration);

  const start = parseZoomDate(file.recording_start);
  const end = parseZoomDate(file.recording_end);

  if (!start || !end) return undefined;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000));
}

async function syncMeeting(meeting) {
  const files = Array.isArray(meeting.recording_files) ? meeting.recording_files : [];
  const videoFiles = files.filter(isVideoFile);
  const thumbnailFile = files.find(isThumbnailFile);
  const results = [];

  for (const file of videoFiles) {
    const title = buildTitle(meeting, videoFiles, file);
    const update = {
      zoomFileId: file.id,
      zoomMeetingId: String(meeting.id ?? file.meeting_id ?? ''),
      zoomMeetingUuid: meeting.uuid,
      hostId: meeting.host_id,
      title,
      category: resolveCategory(title),
      startTime: parseZoomDate(meeting.start_time ?? file.recording_start),
      recordingStart: parseZoomDate(file.recording_start),
      recordingEnd: parseZoomDate(file.recording_end),
      durationMinutes: durationMinutes(meeting, file),
      fileType: file.file_type,
      recordingType: file.recording_type,
      fileSize: file.file_size,
      playUrl: file.play_url,
      downloadUrl: file.download_url,
      thumbnailDownloadUrl: thumbnailFile?.download_url,
      shareUrl: meeting.share_url,
      passcode: meeting.recording_play_passcode ?? meeting.password,
      source: 'zoom',
      syncedAt: new Date(),
      raw: {
        meeting,
        file,
        thumbnailFile
      }
    };

    const result = await Recording.updateOne(
      { zoomFileId: file.id },
      { $set: update },
      { upsert: true }
    );

    results.push(result);
  }

  return {
    videoFiles: videoFiles.length,
    upserted: results.reduce((sum, result) => sum + (result.upsertedCount ?? 0), 0),
    modified: results.reduce((sum, result) => sum + (result.modifiedCount ?? 0), 0)
  };
}

export async function syncZoomRecordings({ from, to } = {}) {
  if (!hasZoomConfig()) {
    throw new Error('Zoom credentials are not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, and ZOOM_USER_ID or ZOOM_USER_IDS.');
  }

  const defaultRange = getDefaultDateRange();
  const fromDate = from ? new Date(from) : defaultRange.from;
  const toDate = to ? new Date(to) : defaultRange.to;
  const windows = buildDateWindows(fromDate, toDate);
  const userIds = getZoomUserIds();

  const summary = {
    users: userIds.length,
    windows: windows.length,
    meetingsFetched: 0,
    videoFilesSeen: 0,
    created: 0,
    updated: 0,
    startedAt: new Date(),
    finishedAt: null
  };

  for (const userId of userIds) {
    for (const window of windows) {
      let nextPageToken = '';

      do {
        const response = await listUserRecordings({
          userId,
          from: window.from,
          to: window.to,
          nextPageToken
        });

        const meetings = Array.isArray(response.meetings) ? response.meetings : [];
        summary.meetingsFetched += meetings.length;

        for (const meeting of meetings) {
          const result = await syncMeeting(meeting);
          summary.videoFilesSeen += result.videoFiles;
          summary.created += result.upserted;
          summary.updated += result.modified;
        }

        nextPageToken = response.next_page_token ?? '';
      } while (nextPageToken);
    }
  }

  summary.finishedAt = new Date();
  return summary;
}

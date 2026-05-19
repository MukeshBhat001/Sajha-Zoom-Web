# Zoom Recorded Class Website

A public recorded-class gallery built with React, Node.js, Express, MongoDB, Tailwind CSS, and the Zoom Cloud Recording API.

## Features

- Public gallery with no login or authentication
- Automatic Zoom cloud recording sync using Server-to-Server OAuth
- Recording metadata stored in MongoDB
- Thumbnail, title, date, and category display
- In-site video playback through the Express API
- Responsive Tailwind UI
- Environment-variable based admin configuration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Fill in MongoDB and Zoom values in `.env`.

Create a Zoom Server-to-Server OAuth app and add recording read scopes. For this app, you usually need cloud recording read access such as `recording:read:admin` or the granular cloud recording read scopes available to your Zoom account.

Set `ZOOM_USER_ID` to one Zoom host user ID or email. To sync multiple teachers, set `ZOOM_USER_IDS` to a comma-separated list.

4. Start MongoDB locally or point `MONGO_URI` to MongoDB Atlas.

If Atlas SRV lookups fail on a local network, `MONGODB_DNS_SERVERS` lets Node retry DNS through explicit resolvers.

5. Run the app:

```bash
npm run dev
```

The React app runs at `http://localhost:5173` and the Express API runs at `http://localhost:5000`.

## Zoom Sync

Recordings sync on server start and then every `SYNC_INTERVAL_MINUTES`.

You can also trigger sync manually:

```bash
npm run sync
```

Or call the public endpoint when enabled:

```bash
curl -X POST http://localhost:5000/api/sync/zoom
```

## Categories

Categories are assigned from recording titles using `CATEGORY_RULES`.

```env
CATEGORY_RULES={"Math":["algebra","geometry"],"Science":["physics","chemistry"]}
DEFAULT_CATEGORY=General
```

## Logo

Place the Sajha Entrance logo at:

```text
client/public/sajha-logo.png
```

PNG is recommended. JPG, SVG, and WebP also work if named `sajha-logo.jpg`, `sajha-logo.svg`, or `sajha-logo.webp`.

Refresh the production site after adding the logo. Run `npm run build` too if you are deploying the `dist` folder somewhere else.

Shorthand also works:

```env
CATEGORY_RULES=Math:algebra|geometry;Science:physics|chemistry
```

## Production

Build the React client:

```bash
npm run build
```

Start the Express server:

```bash
NODE_ENV=production npm start
```

In production, Express serves the built client from `dist/client`.

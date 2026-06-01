import { CalendarDays, Clock3, Play, Video } from 'lucide-react';
import { recordingThumbnailUrl } from '../utils/api.js';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

function formatDuration(minutes) {
  if (!minutes) return 'Class recording';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

const thumbnailPalettes = [
  {
    background:
      'radial-gradient(circle at 18% 8%, rgba(255,255,255,0.09), transparent 30%), radial-gradient(circle at 72% 86%, rgba(255,255,255,0.12), transparent 34%), linear-gradient(135deg, #1f1f1f 0%, #2b2b2b 52%, #3b3b3b 100%)'
  },
  {
    background:
      'radial-gradient(circle at 24% 16%, rgba(255,255,255,0.08), transparent 32%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.1), transparent 36%), linear-gradient(135deg, #242424 0%, #303030 55%, #424242 100%)'
  },
  {
    background:
      'radial-gradient(circle at 14% 14%, rgba(255,255,255,0.07), transparent 34%), radial-gradient(circle at 70% 76%, rgba(255,255,255,0.12), transparent 34%), linear-gradient(135deg, #191919 0%, #2c2c2c 48%, #454545 100%)'
  }
];

function paletteFor(recording) {
  const seed = String(recording.id ?? recording.title ?? '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return thumbnailPalettes[seed % thumbnailPalettes.length];
}

export default function RecordingCard({ recording, onOpen }) {
  const date = recording.startTime ? dateFormatter.format(new Date(recording.startTime)) : 'Undated';
  const palette = paletteFor(recording);

  return (
    <button
      type="button"
      onClick={() => onOpen(recording)}
      className="group overflow-hidden rounded-lg border border-zinc-200 bg-white text-left shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-[#ff7422]/50 hover:shadow-[0_10px_24px_rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-[#ff7422] focus:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        {recording.hasThumbnail ? (
          <img
            src={recordingThumbnailUrl(recording.id)}
            alt=""
            className="h-full w-full object-cover grayscale transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full" style={{ background: palette.background }} />
        )}
        <span className="absolute inset-0 bg-zinc-950/25 transition group-hover:bg-zinc-950/35" />
        <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/20 text-white shadow-lg backdrop-blur-sm transition group-hover:border-white group-hover:bg-white group-hover:text-[#ff5a00]">
          <Video className="h-8 w-8 transition group-hover:opacity-0" aria-hidden="true" />
          <Play className="absolute ml-1 h-8 w-8 fill-current opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
        </span>
        <span className="absolute bottom-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-950/90 px-2.5 text-sm font-bold text-white shadow">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {formatDuration(recording.durationMinutes)}
        </span>
      </div>

      <div className="px-4 pb-4 pt-4">
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-[#071b3a] transition group-hover:text-[#ff5a00]">
          {recording.title}
        </h3>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {date}
        </p>
      </div>
    </button>
  );
}

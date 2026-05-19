import { CalendarDays, Clock3, GraduationCap, Play } from 'lucide-react';
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
    background: 'linear-gradient(135deg, #ff7422 0%, #0f766e 52%, #1d4ed8 100%)',
    glow: 'bg-orange-200/40',
    badge: 'bg-white/18 text-white'
  },
  {
    background: 'linear-gradient(135deg, #ff7422 0%, #7c3aed 48%, #0891b2 100%)',
    glow: 'bg-amber-200/40',
    badge: 'bg-white/18 text-white'
  },
  {
    background: 'linear-gradient(135deg, #be123c 0%, #ff7422 45%, #0d9488 100%)',
    glow: 'bg-orange-100/40',
    badge: 'bg-white/18 text-white'
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
      className="group overflow-hidden rounded-lg border border-orange-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#ff7422]/50 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-[#ff7422] focus:ring-offset-2"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        {recording.hasThumbnail ? (
          <img
            src={recordingThumbnailUrl(recording.id)}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col justify-between p-5 text-white" style={{ background: palette.background }}>
            <span className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${palette.glow}`} />
            <span className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-white/15" />
            <span className="relative inline-flex w-fit items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {recording.category}
            </span>
            <div className="relative max-w-[85%]">
              <p className="line-clamp-3 text-xl font-bold leading-7 text-white">{recording.title}</p>
              <p className="mt-2 text-sm font-medium text-white/75">{date}</p>
            </div>
          </div>
        )}
        <span className="absolute inset-0 bg-zinc-950/15 transition group-hover:bg-zinc-950/25" />
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-lg transition group-hover:scale-105">
          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <span className="inline-flex rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-[#c64f11]">
            {recording.category}
          </span>
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-zinc-950">
            {recording.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {formatDuration(recording.durationMinutes)}
          </span>
        </div>
      </div>
    </button>
  );
}

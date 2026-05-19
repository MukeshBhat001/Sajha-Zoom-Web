import { CalendarDays, ExternalLink, X } from 'lucide-react';
import { recordingStreamUrl } from '../utils/api.js';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

export default function RecordingPlayer({ recording, onClose }) {
  if (!recording) return null;

  const date = recording.startTime ? dateFormatter.format(new Date(recording.startTime)) : 'Undated';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/75 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-md bg-orange-100 px-2 py-1 font-semibold text-[#c64f11]">{recording.category}</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {date}
              </span>
            </div>
            <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-zinc-950 sm:text-xl">
              {recording.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
            aria-label="Close player"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-zinc-950">
          <video
            key={recording.id}
            src={recordingStreamUrl(recording.id)}
            className="h-full w-full"
            controls
            playsInline
            autoPlay
          />
        </div>

        {recording.playUrl ? (
          <div className="flex items-center justify-end border-t border-zinc-200 px-4 py-3 sm:px-5">
            <a
              href={recording.playUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open Zoom page
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

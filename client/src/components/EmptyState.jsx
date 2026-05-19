import { GraduationCap, RefreshCw } from 'lucide-react';

export default function EmptyState({ onSync, syncing }) {
  return (
    <div className="rounded-lg border border-dashed border-orange-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-[#ff7422]">
        <GraduationCap className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-zinc-950">No recordings yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        Once Zoom credentials and MongoDB are configured, synced cloud recordings will appear here automatically.
      </p>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#ff7422] px-4 text-sm font-semibold text-white transition hover:bg-[#e96317] disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
        Sync Zoom
      </button>
    </div>
  );
}

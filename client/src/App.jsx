import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Search, X } from 'lucide-react';
import CategoryFilter from './components/CategoryFilter.jsx';
import EmptyState from './components/EmptyState.jsx';
import RecordingCard from './components/RecordingCard.jsx';
import RecordingPlayer from './components/RecordingPlayer.jsx';
import { apiRequest, endpoints } from './utils/api.js';

const MUKESH_BHAT_FACEBOOK_URL = 'https://www.facebook.com/mukesh.bhat.343354'; // Replace with your Facebook URL.

export default function App() {
  const [recordings, setRecordings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [syncNotice, setSyncNotice] = useState(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (search.trim()) params.set('search', search.trim());
    return params.toString();
  }, [selectedCategory, search]);

  async function loadRecordings() {
    setError('');
    const [recordingData, categoryData] = await Promise.all([
      apiRequest(endpoints.recordings(queryString)),
      apiRequest(endpoints.recordingCategories)
    ]);

    setRecordings(recordingData.items);
    setCategories(categoryData.items);
  }

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setLoading(true);
      try {
        await loadRecordings();
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [queryString]);

  useEffect(() => {
    if (!syncNotice || syncNotice.persist) return undefined;

    const timer = window.setTimeout(() => {
      setSyncNotice(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [syncNotice]);

  async function handleSync() {
    setSyncing(true);
    setError('');
    setSyncNotice({
      message: 'Updating the latest videos...',
      tone: 'updating',
      persist: true
    });

    try {
      const syncResponse = await apiRequest(endpoints.syncZoom, { method: 'POST' });
      const syncResult = syncResponse?.result ?? syncResponse;
      const hasLibraryChanges = (syncResult?.created ?? 0) > 0 || (syncResult?.deleted ?? 0) > 0;

      await loadRecordings();

      setSyncNotice({
        message: hasLibraryChanges ? 'Updating the latest videos...' : 'Video library is up to date.',
        tone: hasLibraryChanges ? 'updating' : 'success',
        persist: false
      });
    } catch (err) {
      setError(err.message);
      setSyncNotice({
        message: err.message,
        tone: 'error',
        persist: false
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fff7f2] text-zinc-950">
      <section className="border-b border-orange-100 bg-white">
        <div className="flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search recordings</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search classes"
              className="h-11 w-full rounded-lg border border-orange-100 bg-white pl-10 pr-3 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-[#ff7422] focus:ring-2 focus:ring-[#ff7422]/20"
            />
          </label>

          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff7422] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e96317] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            Sync
          </button>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </section>

      <section className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="aspect-video animate-pulse bg-zinc-200" />
                <div className="space-y-4 px-4 pb-4 pt-4">
                  <div className="h-6 w-full animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        ) : recordings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} onOpen={setSelectedRecording} />
            ))}
          </div>
        ) : (
          <EmptyState onSync={handleSync} syncing={syncing} />
        )}
      </section>

      <footer className="border-t border-orange-100 bg-white px-4 py-3 text-center">
        <p className="text-base font-semibold text-[#ff5a00] sm:text-lg">
          Hand Crafted with <span aria-label="coffee" role="img">☕</span> and{' '}
          <span aria-label="love" role="img">❤️</span> by{' '}
          <a
            href={MUKESH_BHAT_FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-zinc-950 transition hover:text-[#ff5a00] hover:underline"
          >
            Mukesh Bhat
          </a>
        </p>
        <p className="mt-1 text-base text-zinc-950 sm:text-lg">Copyright 2026 | All Rights Reserved</p>
      </footer>

      {syncNotice ? (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm" role="status" aria-live="polite">
          <div
            className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-semibold shadow-[0_12px_32px_rgba(15,23,42,0.18)] ${
              syncNotice.tone === 'error'
                ? 'border-red-200 text-red-700'
                : syncNotice.tone === 'success'
                  ? 'border-emerald-200 text-emerald-700'
                  : 'border-orange-200 text-[#c64f11]'
            }`}
          >
            {syncNotice.tone === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : syncNotice.tone === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <RefreshCw className={`h-5 w-5 shrink-0 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
            )}
            <p className="flex-1">{syncNotice.message}</p>
            <button
              type="button"
              onClick={() => setSyncNotice(null)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#ff7422]/30"
            >
              <span className="sr-only">Dismiss sync message</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <RecordingPlayer recording={selectedRecording} onClose={() => setSelectedRecording(null)} />
    </main>
  );
}

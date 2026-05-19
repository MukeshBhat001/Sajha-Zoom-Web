import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, RefreshCw, Search } from 'lucide-react';
import CategoryFilter from './components/CategoryFilter.jsx';
import EmptyState from './components/EmptyState.jsx';
import RecordingCard from './components/RecordingCard.jsx';
import RecordingPlayer from './components/RecordingPlayer.jsx';
import { apiRequest, endpoints } from './utils/api.js';

const LOGO_SOURCES = ['/sajha-logo.png', '/sajha-logo.jpg', '/sajha-logo.svg', '/sajha-logo.webp'];

export default function App() {
  const [recordings, setRecordings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [logoIndex, setLogoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

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

  async function handleSync() {
    setSyncing(true);
    setError('');

    try {
      await apiRequest(endpoints.syncZoom, { method: 'POST' });
      await loadRecordings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f2] text-zinc-950">
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-white text-[#ff7422] shadow-sm">
                {logoIndex < LOGO_SOURCES.length ? (
                  <img
                    src={LOGO_SOURCES[logoIndex]}
                    alt="Sajha Entrance"
                    className="h-12 w-12 object-contain"
                    onError={() => setLogoIndex((currentIndex) => currentIndex + 1)}
                  />
                ) : (
                  <BookOpenCheck className="h-8 w-8" aria-hidden="true" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ff7422]">Recorded classes</p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-zinc-950 sm:text-4xl">
                  Video Library
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block min-w-0 sm:w-80">
                <span className="sr-only">Search recordings</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search classes"
                  className="h-11 w-full rounded-lg border border-orange-100 bg-white pl-10 pr-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-[#ff7422] focus:ring-2 focus:ring-[#ff7422]/20"
                />
              </label>

              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff7422] px-4 text-sm font-semibold text-white transition hover:bg-[#e96317] disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                Sync
              </button>
            </div>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="aspect-video animate-pulse bg-zinc-200" />
                <div className="space-y-4 p-4">
                  <div className="h-5 w-24 animate-pulse rounded bg-zinc-200" />
                  <div className="h-6 w-full animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        ) : recordings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} onOpen={setSelectedRecording} />
            ))}
          </div>
        ) : (
          <EmptyState onSync={handleSync} syncing={syncing} />
        )}
      </section>

      <RecordingPlayer recording={selectedRecording} onClose={() => setSelectedRecording(null)} />
    </main>
  );
}

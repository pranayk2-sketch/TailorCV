import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  ExternalLink,
  Loader2,
  SlidersHorizontal,
  Zap,
  List,
  X,
} from 'lucide-react';

import { PageLayout } from '../components/PageLayout';
import {
  getInternships,
  getInternshipsForBatch,
  saveInternship,
  unsaveInternship,
  getSavedInternships,
} from '@/api/internships';
import type { Internship, InternshipFilters } from '@/types/internship';

// ─── Constants ───────────────────────────────────────────────────────────────

const BATCH_COUNT_OPTIONS = [5, 10, 15, 20, 25, 50];
const BROWSE_PAGE_SIZE = 10;

const LOCATION_CHIPS = [
  'Remote',
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Atlanta, GA',
  'Denver, CO',
];

const TERM_CHIPS = ['Summer 2026', 'Fall 2025', 'Spring 2026', 'Winter 2025'];

const COMPANY_COLORS = [
  '#4285f4', '#635bff', '#ff7b54', '#ffd93d', '#00a4ef',
  '#e50914', '#ff5a5f', '#1db954', '#00a1e0', '#0077b5',
  '#ff6900', '#a855f7', '#06b6d4', '#f59e0b', '#10b981',
];

function colorForCompany(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChipToggle({
  label,
  active,
  onToggle,
  color = 'default',
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  color?: 'default' | 'yellow' | 'orange';
}) {
  const activeStyles =
    color === 'yellow'
      ? 'bg-black text-[#ffd93d] border-black'
      : color === 'orange'
        ? 'bg-black text-[#ff7b54] border-black'
        : 'bg-black text-white border-black';

  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-xs border-2 transition-colors whitespace-nowrap ${
        active ? activeStyles : 'bg-white text-black border-black hover:bg-gray-100'
      }`}
      style={{ fontWeight: 700 }}
    >
      {label}
    </button>
  );
}

function InternshipCard({
  internship,
  index,
  isSaved,
  onSave,
  onUnsave,
  mode,
}: {
  internship: Internship;
  index: number;
  isSaved: boolean;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  mode: 'batch' | 'browse';
}) {
  const navigate = useNavigate();
  const [savePending, setSavePending] = useState(false);
  const bgColor = colorForCompany(internship.company_name);

  const handleSaveToggle = async () => {
    setSavePending(true);
    if (isSaved) {
      await onUnsave(internship.id);
    } else {
      await onSave(internship.id);
    }
    setSavePending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-white rounded-2xl p-5 border-2 border-black shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Company icon */}
        <div
          className="w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <Building2 className="w-6 h-6 text-white" strokeWidth={3} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg uppercase truncate" style={{ fontWeight: 900 }}>
                {internship.company_name}
              </h3>
              <p className="text-sm mb-2 truncate" style={{ fontWeight: 700 }}>
                {internship.title}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={handleSaveToggle}
                disabled={savePending}
                title={isSaved ? 'Unsave' : 'Save'}
                className={`p-2 rounded-xl border-2 border-black transition-colors ${
                  isSaved
                    ? 'bg-[#ffd93d] text-black hover:bg-[#ffc020]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {savePending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <Bookmark className="w-4 h-4" strokeWidth={3} />
                )}
              </button>

              <button
                onClick={() => navigate(`/internships/${internship.id}`)}
                className="bg-black text-white px-3 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black text-xs"
                style={{ fontWeight: 800 }}
              >
                Details
              </button>

              <a
                href={internship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ff7b54] text-black px-3 py-2 rounded-xl hover:bg-[#ff6040] transition-colors border-2 border-black text-xs flex items-center gap-1"
                style={{ fontWeight: 800 }}
              >
                Apply
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => navigate(`/resumes?internship=${internship.id}`)}
                className="bg-[#ffd93d] text-black px-3 py-2 rounded-xl hover:bg-[#ffc020] transition-colors border-2 border-black text-xs flex items-center gap-1"
                style={{ fontWeight: 800 }}
              >
                <Sparkles className="w-3 h-3" />
                Resume
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {internship.locations.slice(0, 3).map((loc) => (
              <span
                key={loc}
                className="flex items-center gap-1 bg-gray-100 border border-black rounded-md px-2 py-0.5 text-xs"
                style={{ fontWeight: 600 }}
              >
                <MapPin className="w-3 h-3" />
                {loc}
              </span>
            ))}
            {internship.locations.length > 3 && (
              <span
                className="bg-gray-100 border border-black rounded-md px-2 py-0.5 text-xs"
                style={{ fontWeight: 600 }}
              >
                +{internship.locations.length - 3} more
              </span>
            )}
            {internship.terms.map((term) => (
              <span
                key={term}
                className="bg-[#f5f1e8] border border-black rounded-md px-2 py-0.5 text-xs"
                style={{ fontWeight: 700 }}
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InternshipsPage() {
  // ── Tab
  const [mode, setMode] = useState<'batch' | 'browse'>('batch');

  // ── Filters
  const [query, setQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);

  // ── Batch mode
  const [batchCount, setBatchCount] = useState(10);
  const [batchResults, setBatchResults] = useState<Internship[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Browse mode
  const [browsePage, setBrowsePage] = useState(1);
  const [browseResults, setBrowseResults] = useState<Internship[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);

  // ── Saved state
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // ── Build filters object from UI state
  const activeFilters: InternshipFilters = {
    query: query || undefined,
    locations: selectedLocations.length > 0 ? selectedLocations : undefined,
    terms: selectedTerms.length > 0 ? selectedTerms : undefined,
    remoteOnly: remoteOnly || undefined,
  };

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedLocations.length +
    selectedTerms.length +
    (remoteOnly ? 1 : 0);

  // ── Load saved internships on mount
  useEffect(() => {
    getSavedInternships().then(({ data }) => {
      setSavedIds(new Set(data.map((s) => s.internship_id)));
    });
  }, []);

  // ── Load browse results when page/filters change in browse mode
  useEffect(() => {
    if (mode !== 'browse') return;
    setBrowseLoading(true);
    setBrowseError(null);
    getInternships({ filters: activeFilters, page: browsePage, pageSize: BROWSE_PAGE_SIZE }).then(
      ({ data, count, error }) => {
        setBrowseLoading(false);
        if (error) {
          setBrowseError(error);
        } else {
          setBrowseResults(data);
          setBrowseTotal(count);
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, browsePage]);

  // Reset browse page when switching to browse mode
  useEffect(() => {
    if (mode === 'browse') setBrowsePage(1);
  }, [mode]);

  // ── Handlers
  const handleBatchSelect = useCallback(async () => {
    setBatchLoading(true);
    setBatchError(null);
    setBatchResults([]);

    const { data, error } = await getInternshipsForBatch({
      filters: activeFilters,
      count: batchCount,
    });

    setBatchLoading(false);
    setHasSearched(true);

    if (error) {
      setBatchError(error);
    } else {
      setBatchResults(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, batchCount]);

  const handleBrowseSearch = useCallback(async () => {
    setBrowsePage(1);
    setBrowseLoading(true);
    setBrowseError(null);

    const { data, count, error } = await getInternships({
      filters: activeFilters,
      page: 1,
      pageSize: BROWSE_PAGE_SIZE,
    });

    setBrowseLoading(false);

    if (error) {
      setBrowseError(error);
    } else {
      setBrowseResults(data);
      setBrowseTotal(count);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  const toggleTerm = (term: string) => {
    setSelectedTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term],
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedLocations([]);
    setSelectedTerms([]);
    setRemoteOnly(false);
  };

  const handleSave = async (id: string) => {
    const { error } = await saveInternship(id);
    if (!error) setSavedIds((prev) => new Set([...prev, id]));
  };

  const handleUnsave = async (id: string) => {
    const { error } = await unsaveInternship(id);
    if (!error) setSavedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const totalBrowsePages = Math.ceil(browseTotal / BROWSE_PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageLayout title="Internship Explorer">
      <div className="max-w-[1100px] mx-auto p-4 md:p-8 space-y-6">

        {/* ── Filter Panel ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5f1e8] rounded-3xl p-6 border-4 border-black shadow-xl"
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" strokeWidth={3} />
              <span className="text-base uppercase" style={{ fontWeight: 900 }}>
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 800 }}>
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-black hover:underline"
                style={{ fontWeight: 700 }}
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" strokeWidth={3} />
            <input
              type="text"
              placeholder="Search company or role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (mode === 'browse') handleBrowseSearch();
                }
              }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-black text-sm bg-white"
              style={{ fontWeight: 600 }}
            />
          </div>

          {/* Remote toggle */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setRemoteOnly((v) => !v)}
              className={`px-4 py-2 rounded-xl border-2 border-black text-sm transition-colors ${
                remoteOnly ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              style={{ fontWeight: 800 }}
            >
              🌐 Remote Only
            </button>
          </div>

          {/* Location chips */}
          <div className="mb-3">
            <p className="text-xs uppercase mb-2 opacity-60" style={{ fontWeight: 800 }}>Locations</p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_CHIPS.map((loc) => (
                <ChipToggle
                  key={loc}
                  label={loc}
                  active={selectedLocations.includes(loc)}
                  onToggle={() => toggleLocation(loc)}
                />
              ))}
            </div>
          </div>

          {/* Term chips */}
          <div>
            <p className="text-xs uppercase mb-2 opacity-60" style={{ fontWeight: 800 }}>Terms</p>
            <div className="flex flex-wrap gap-2">
              {TERM_CHIPS.map((term) => (
                <ChipToggle
                  key={term}
                  label={term}
                  active={selectedTerms.includes(term)}
                  onToggle={() => toggleTerm(term)}
                  color="yellow"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Mode Tabs ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-3"
        >
          <button
            onClick={() => setMode('batch')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-4 border-black text-sm transition-colors ${
              mode === 'batch' ? 'bg-[#ff7b54] text-black shadow-lg' : 'bg-white text-black hover:bg-gray-100'
            }`}
            style={{ fontWeight: 800 }}
          >
            <Zap className="w-4 h-4" strokeWidth={3} />
            Smart Pick
          </button>
          <button
            onClick={() => setMode('browse')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-4 border-black text-sm transition-colors ${
              mode === 'browse' ? 'bg-[#ff7b54] text-black shadow-lg' : 'bg-white text-black hover:bg-gray-100'
            }`}
            style={{ fontWeight: 800 }}
          >
            <List className="w-4 h-4" strokeWidth={3} />
            Browse All
          </button>
        </motion.div>

        {/* ── Smart Pick Panel ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {mode === 'batch' && (
            <motion.div
              key="batch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#ffd93d] rounded-3xl p-6 border-4 border-black shadow-xl"
            >
              <h2 className="text-2xl uppercase mb-1" style={{ fontWeight: 900 }}>
                Pick exactly N internships
              </h2>
              <p className="text-sm mb-4 opacity-70" style={{ fontWeight: 700 }}>
                We'll find the best matching internships from the Simplify database.
              </p>

              {/* Count selector */}
              <div className="mb-5">
                <p className="text-xs uppercase mb-2 opacity-60" style={{ fontWeight: 800 }}>
                  How many?
                </p>
                <div className="flex flex-wrap gap-2">
                  {BATCH_COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => setBatchCount(n)}
                      className={`w-14 h-10 rounded-xl border-2 border-black text-sm transition-colors ${
                        batchCount === n
                          ? 'bg-black text-[#ffd93d]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      style={{ fontWeight: 900 }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleBatchSelect}
                disabled={batchLoading}
                className="w-full bg-black text-white py-4 px-6 rounded-2xl border-2 border-black text-base flex items-center justify-center gap-3 hover:bg-[#222] transition-colors disabled:opacity-60"
                style={{ fontWeight: 900 }}
              >
                {batchLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding internships…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" strokeWidth={3} />
                    Select {batchCount} Internships
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ── Browse Panel ─────────────────────────────────────────────── */}
          {mode === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#f5f1e8] rounded-3xl p-5 border-4 border-black shadow-xl flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm opacity-70" style={{ fontWeight: 700 }}>
                  {browseLoading
                    ? 'Loading…'
                    : browseTotal > 0
                      ? `${browseTotal.toLocaleString()} internships found`
                      : 'Run a search to see results'}
                </p>
              </div>
              <button
                onClick={handleBrowseSearch}
                disabled={browseLoading}
                className="bg-black text-white px-5 py-3 rounded-2xl border-2 border-black text-sm flex items-center gap-2 hover:bg-[#222] transition-colors disabled:opacity-60"
                style={{ fontWeight: 800 }}
              >
                {browseLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" strokeWidth={3} />
                )}
                Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(mode === 'batch' ? (batchLoading || hasSearched) : (browseLoading || browseResults.length > 0 || !!browseError)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] rounded-3xl p-4 border-4 border-black shadow-xl"
            >
              {/* Results header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#ffd93d] rounded-full border-2 border-white" />
                  <span className="text-white text-sm" style={{ fontWeight: 800 }}>
                    {mode === 'batch'
                      ? batchLoading
                        ? 'Searching…'
                        : `${batchResults.length} internship${batchResults.length !== 1 ? 's' : ''} selected`
                      : browseLoading
                        ? 'Loading…'
                        : `Showing ${browseResults.length} of ${browseTotal.toLocaleString()}`}
                  </span>
                </div>

                {mode === 'batch' && batchResults.length > 0 && (
                  <button
                    onClick={handleBatchSelect}
                    className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    style={{ fontWeight: 700 }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                )}
              </div>

              {/* Loading skeleton */}
              {(mode === 'batch' ? batchLoading : browseLoading) && (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white/10 rounded-2xl h-24 animate-pulse" />
                  ))}
                </div>
              )}

              {/* Error */}
              {(mode === 'batch' ? batchError : browseError) && (
                <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-4 text-center">
                  <p className="text-red-800 text-sm" style={{ fontWeight: 700 }}>
                    {mode === 'batch' ? batchError : browseError}
                  </p>
                  <p className="text-red-600 text-xs mt-1" style={{ fontWeight: 600 }}>
                    Make sure you've run the SQL migration and synced data via the Edge Function.
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!batchLoading && !browseLoading && !(mode === 'batch' ? batchError : browseError) && (
                (mode === 'batch' ? batchResults : browseResults).length === 0 && hasSearched && (
                  <div className="text-center py-12">
                    <p className="text-white text-4xl mb-3">🔍</p>
                    <p className="text-white text-lg uppercase" style={{ fontWeight: 900 }}>
                      No internships found
                    </p>
                    <p className="text-white/60 text-sm mt-1" style={{ fontWeight: 600 }}>
                      Try broadening your filters, or sync the database first.
                    </p>
                  </div>
                )
              )}

              {/* Card list */}
              {!(mode === 'batch' ? batchLoading : browseLoading) && (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {(mode === 'batch' ? batchResults : browseResults).map((internship, index) => (
                      <InternshipCard
                        key={internship.id}
                        internship={internship}
                        index={index}
                        isSaved={savedIds.has(internship.id)}
                        onSave={handleSave}
                        onUnsave={handleUnsave}
                        mode={mode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Browse pagination */}
              {mode === 'browse' && !browseLoading && totalBrowsePages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setBrowsePage((p) => Math.max(1, p - 1))}
                    disabled={browsePage === 1}
                    className="p-2 rounded-xl border-2 border-white/30 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={3} />
                  </button>

                  {Array.from({ length: Math.min(totalBrowsePages, 7) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setBrowsePage(page)}
                        className={`w-9 h-9 rounded-xl border-2 text-sm transition-colors ${
                          browsePage === page
                            ? 'bg-[#ffd93d] text-black border-[#ffd93d]'
                            : 'border-white/30 text-white hover:bg-white/10'
                        }`}
                        style={{ fontWeight: 900 }}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setBrowsePage((p) => Math.min(totalBrowsePages, p + 1))}
                    disabled={browsePage === totalBrowsePages}
                    className="p-2 rounded-xl border-2 border-white/30 text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── First-time empty state (no search yet in batch mode) ──────── */}
        {mode === 'batch' && !hasSearched && !batchLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-8 text-white/30"
          >
            <p className="text-5xl mb-3">⚡</p>
            <p className="text-white text-base uppercase" style={{ fontWeight: 900, color: '#888' }}>
              Set your filters, then hit "Select N Internships"
            </p>
          </motion.div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f5f1e8;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e1d8; }
      `}</style>
    </PageLayout>
  );
}

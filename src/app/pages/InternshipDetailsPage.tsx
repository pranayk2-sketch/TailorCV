import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import {
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  Target,
  Loader2,
  FileText,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { getInternship } from '@/api/internships';
import { getDescription, fetchDescription } from '@/api/description';
import { mapInternshipToVariant, getInternshipVariant } from '@/api/variants';
import { toast } from 'sonner';
import type { Internship } from '@/types/internship';
import type { ResumeVariant } from '@/types/variant';

export function InternshipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [description, setDescription] = useState<{ preview: string; fetchedAt: string } | null>(null);
  const [variant, setVariant] = useState<ResumeVariant | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<{ matched: string[]; missing: string[] } | null>(null);
  const [fetchDescLoading, setFetchDescLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getInternship(id).then(({ data, error: err }) => {
      if (err || !data) {
        setError(err || 'Not found');
        setLoading(false);
        return;
      }
      setInternship(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getDescription(id).then(({ data }) => {
      if (data) setDescription({ preview: data.preview, fetchedAt: data.fetchedAt });
    });
    getInternshipVariant(id).then(({ data }) => {
      if (data?.variant) setVariant(data.variant);
    });
  }, [id]);

  const handleFetchDescription = async () => {
    if (!id) return;
    setFetchDescLoading(true);
    const { data, error: err } = await fetchDescription(id);
    setFetchDescLoading(false);
    if (err) {
      toast.error(err);
      return;
    }
    if (data) {
      setDescription({ preview: data.cleanedPreview, fetchedAt: data.fetchedAt });
      toast.success('Description fetched');
    }
  };

  const handleMapToVariant = async () => {
    if (!id) return;
    setMapLoading(true);
    const { data, error: err } = await mapInternshipToVariant(id);
    setMapLoading(false);
    if (err) {
      toast.error(err);
      return;
    }
    if (data) {
      setVariant({
        id: data.variantId,
        user_id: '',
        role_family: data.roleFamily,
        fingerprint: data.fingerprint,
        keywords: data.keywords,
        plan_json: {},
        created_at: '',
        updated_at: '',
      });
      setScore(data.score);
      setKeywords({
        matched: [...data.breakdown.matchedSkills, ...data.breakdown.matchedFromBullets],
        missing: data.breakdown.missingKeywords,
      });
      toast.success(`Mapped to ${data.roleFamily} variant. Score: ${data.score}%`);
    }
  };

  if (loading || !internship) {
    return (
      <PageLayout title="Internship">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8">
          {error ? (
            <p className="text-red-600" style={{ fontWeight: 600 }}>{error}</p>
          ) : (
            <div className="animate-pulse bg-[#f5f1e8] rounded-3xl h-64 border-4 border-black" />
          )}
        </div>
      </PageLayout>
    );
  }

  const matchingKeywords = keywords?.matched || [];
  const missingKeywords = keywords?.missing || [];

  return (
    <PageLayout title={internship.company_name}>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
        {/* Company Header */}
        <div className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[#4285f4] rounded-2xl border-4 border-black flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl mb-2 uppercase" style={{ fontWeight: 900 }}>
                  {internship.company_name}
                </h1>
                <h2 className="text-2xl mb-3" style={{ fontWeight: 700 }}>
                  {internship.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  {internship.locations?.slice(0, 3).map((loc) => (
                    <div key={loc} className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" strokeWidth={3} />
                      <span style={{ fontWeight: 600 }}>{loc}</span>
                    </div>
                  ))}
                  {internship.terms?.slice(0, 2).map((term) => (
                    <div key={term} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" strokeWidth={3} />
                      <span style={{ fontWeight: 600 }}>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <a
              href={internship.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff7b54] text-black px-6 py-3 rounded-2xl border-4 border-black hover:bg-[#ff6040] flex items-center gap-2"
              style={{ fontWeight: 900 }}
            >
              Apply <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description + Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFetchDescription}
                disabled={fetchDescLoading}
                className="bg-[#95e1d3] text-black px-4 py-2 rounded-xl border-2 border-black hover:bg-[#85d1c3] flex items-center gap-2 disabled:opacity-60"
                style={{ fontWeight: 800 }}
              >
                {fetchDescLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                Fetch Description
              </button>
              <button
                onClick={handleMapToVariant}
                disabled={mapLoading || !description}
                title={!description ? 'Fetch description first' : ''}
                className="bg-[#ffd93d] text-black px-4 py-2 rounded-xl border-2 border-black hover:bg-[#ffc020] flex items-center gap-2 disabled:opacity-60"
                style={{ fontWeight: 800 }}
              >
                {mapLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                Map to Variant
              </button>
            </div>

            {/* Description */}
            <div className="bg-[#f9dc5c] rounded-3xl p-8 border-4 border-black shadow-xl">
              <h3 className="text-3xl uppercase mb-4" style={{ fontWeight: 900 }}>
                Job Description
              </h3>
              {description ? (
                <div className="space-y-4 text-base whitespace-pre-wrap" style={{ fontWeight: 600 }}>
                  {description.preview ? (
                    <>
                      <p>{description.preview}</p>
                      {description.preview.length >= 1200 && (
                        <p className="text-sm opacity-75">… (truncated)</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm opacity-75">
                      Fetched but content was empty. The job page may load content via JavaScript and could not be extracted.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
                  No description yet. Click "Fetch Description" to extract from the job posting URL.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Score + Variant */}
          <div className="space-y-6">
            {score !== null && (
              <div className="bg-gradient-to-br from-[#ff6b6b] via-[#ff8c42] to-[#ffd93d] rounded-3xl p-8 border-4 border-black shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6" strokeWidth={3} />
                  <h3 className="text-2xl uppercase" style={{ fontWeight: 900 }}>
                    Relevance Score
                  </h3>
                </div>
                <div className="bg-black/90 rounded-2xl p-6 mb-4 border-2 border-black">
                  <div className="text-6xl text-white" style={{ fontWeight: 900 }}>
                    {score}%
                  </div>
                </div>
                {matchingKeywords.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>
                      Matched
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchingKeywords.map((k) => (
                        <span
                          key={k}
                          className="bg-white text-black px-2 py-1 rounded text-xs"
                          style={{ fontWeight: 700 }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>
                      Missing
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {missingKeywords.map((k) => (
                        <span
                          key={k}
                          className="bg-black/70 text-white px-2 py-1 rounded text-xs"
                          style={{ fontWeight: 700 }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {variant && (
              <div className="bg-[#95e1d3] rounded-3xl p-6 border-4 border-black shadow-xl">
                <h4 className="text-lg uppercase mb-2" style={{ fontWeight: 900 }}>
                  Mapped Variant
                </h4>
                <p className="text-sm mb-2" style={{ fontWeight: 700 }}>
                  {variant.role_family} • {variant.fingerprint}
                </p>
                <button
                  onClick={() => navigate(`/variants/${variant.id}`)}
                  className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] flex items-center gap-2"
                  style={{ fontWeight: 800 }}
                >
                  View Variant <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => navigate(`/resumes?internship=${id}`)}
              className="w-full bg-[#6a4c93] text-white py-4 px-6 rounded-2xl hover:bg-[#5a3c83] border-4 border-black flex items-center justify-center gap-3"
              style={{ fontWeight: 900 }}
            >
              <Sparkles className="w-6 h-6" strokeWidth={3} />
              Generate Resume
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

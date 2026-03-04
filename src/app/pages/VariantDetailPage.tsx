import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import { ArrowLeft, Building2, Sparkles, ExternalLink } from 'lucide-react';
import { getVariant } from '@/api/variants';
import type { ResumeVariant } from '@/types/variant';

export function VariantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [variant, setVariant] = useState<ResumeVariant | null>(null);
  const [internships, setInternships] = useState<Array<{ id: string; company_name: string; title: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getVariant(id).then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err);
      else if (data) {
        setVariant(data.variant);
        setInternships(data.internships || []);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <PageLayout title="Variant">
        <div className="max-w-[800px] mx-auto p-4 md:p-8">
          <div className="animate-pulse bg-[#f5f1e8] rounded-3xl h-64 border-4 border-black" />
        </div>
      </PageLayout>
    );
  }

  if (error || !variant) {
    return (
      <PageLayout title="Variant">
        <div className="max-w-[800px] mx-auto p-4 md:p-8">
          <p className="text-red-600" style={{ fontWeight: 600 }}>{error || 'Variant not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 flex items-center gap-2 text-black hover:underline"
            style={{ fontWeight: 700 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </PageLayout>
    );
  }

  const keywords = (variant.keywords as string[]) || [];

  return (
    <PageLayout title="Resume Variant">
      <div className="max-w-[800px] mx-auto p-4 md:p-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black hover:underline"
          style={{ fontWeight: 700 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl">
          <h1 className="text-2xl uppercase mb-2" style={{ fontWeight: 900 }}>
            {variant.role_family} Variant
          </h1>
          <p className="text-sm opacity-75 mb-4 font-mono" style={{ fontWeight: 600 }}>
            {variant.fingerprint}
          </p>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.map((k) => (
                <span
                  key={k}
                  className="bg-black text-white px-2 py-1 rounded text-xs"
                  style={{ fontWeight: 700 }}
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate(`/resumes?variant=${variant.id}`)}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-[#333] border-2 border-black inline-flex items-center gap-2"
            style={{ fontWeight: 800 }}
          >
            <Sparkles className="w-4 h-4" />
            Generate Resume (coming soon)
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border-4 border-black shadow-xl">
          <h2 className="text-lg uppercase mb-4" style={{ fontWeight: 900 }}>
            Mapped Internships ({internships.length})
          </h2>
          {internships.length === 0 ? (
            <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
              No internships mapped yet. Use "Map to Variant" on an internship to add it.
            </p>
          ) : (
            <div className="space-y-3">
              {internships.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between p-3 bg-[#f5f1e8] rounded-xl border-2 border-black"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5" strokeWidth={3} />
                    <div>
                      <p className="font-bold">{i.company_name}</p>
                      <p className="text-sm opacity-75">{i.title}</p>
                    </div>
                  </div>
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1 hover:underline"
                    style={{ fontWeight: 700 }}
                  >
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => navigate(`/internships/${i.id}`)}
                    className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-[#333]"
                    style={{ fontWeight: 700 }}
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

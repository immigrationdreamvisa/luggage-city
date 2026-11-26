import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

export interface OfferCompany {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface OfferFile {
  url: string;
  originalName?: string;
  size?: number;
  format?: string;
}

export interface OfferData {
  _id?: string;
  reference: string;
  status: string;
  company?: OfferCompany;
  file?: OfferFile;
  notes?: string;
  createdAt?: string;
}

export interface OfferApiResponse {
  success: boolean;
  message: string;
  data?: OfferData;
  errors?: string[];
}

interface OfferLetterVerificationProps {
  defaultReference?: string;
  companyId?: string;
  className?: string;
}

const DEFAULT_COMPANY_ID = '6b07c98761b41eefbc686346';
const API_BASE_URL = 'https://offer-letter-app-one.vercel.app/api/v1/public/offers';

export function OfferLetterVerification({
  defaultReference = '',
  companyId = DEFAULT_COMPANY_ID,
  className = '',
}: OfferLetterVerificationProps) {
  const [reference, setReference] = useState(defaultReference.toUpperCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OfferData | null>(null);
  const [copied, setCopied] = useState(false);

  const isPdf = (file?: OfferFile) => {
    if (!file || !file.url) return false;
    const fmt = file.format?.toLowerCase();
    if (fmt === 'pdf') return true;
    const urlLower = file.url.toLowerCase();
    return urlLower.includes('.pdf') || urlLower.includes('/pdf/');
  };

  const isImage = (file?: OfferFile) => {
    if (!file || !file.url) return false;
    const fmt = file.format?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(fmt || '')) return true;
    const urlLower = file.url.toLowerCase();
    return (
      urlLower.endsWith('.jpg') ||
      urlLower.endsWith('.jpeg') ||
      urlLower.endsWith('.png') ||
      urlLower.endsWith('.webp') ||
      urlLower.endsWith('.svg')
    );
  };

  const getStatusColor = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved') || s.includes('verified') || s.includes('accepted')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('sent') || s.includes('pending') || s.includes('issued')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('revoked') || s.includes('rejected') || s.includes('cancelled')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const handleCopyReference = () => {
    if (!result?.reference) return;
    navigator.clipboard.writeText(result.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRef = reference.trim().toUpperCase();
    if (!cleanRef) {
      setError('Please enter a valid Offer Letter Reference Number.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}?companyId=${encodeURIComponent(companyId)}&reference=${encodeURIComponent(cleanRef)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const data: OfferApiResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        setError(data.message || 'Offer letter not found. Please double-check the reference number.');
        setResult(null);
        return;
      }

      setResult(data.data);
    } catch {
      setError(
        'Unable to connect to the verification service. Please check your internet connection and try again.'
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Header Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Candidate Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Offer Letter Verification & Document Lookup
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Enter your official Reference Number to verify authentication status, issuing company details, and view your encrypted document.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. OFF-2026-CZY9LD"
                className="w-full pl-10 pr-4 py-3 text-sm font-mono tracking-wider font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Verify Reference</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Standard format: OFF-YYYY-XXXXXX</span>
            {reference && !loading && (
              <button
                type="button"
                onClick={() => {
                  setReference('');
                  setResult(null);
                  setError(null);
                }}
                className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">Lookup Failed: </span>
              <span>{error}</span>
              <p className="mt-1 text-xs text-rose-600/90">
                Please verify that the reference code matches your official offer letter email or notification exactly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          {/* Card Header Strip */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Official Record Verified</span>
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                    result.status
                  )}`}
                >
                  {result.status || 'Active'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <h3 className="text-xl sm:text-2xl font-mono font-bold tracking-wide text-white">
                  {result.reference}
                </h3>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  title="Copy Reference"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs text-emerald-300 font-medium animate-fadeIn">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {result.file?.url && (
                <a
                  href={result.file.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              )}
            </div>
          </div>

          {/* Document Preview Section */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Official Document Preview</span>
              </h4>
              {result.file?.url && (
                <a
                  href={result.file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <span>Open Full Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {result.file?.url ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {isPdf(result.file) ? (
                  <iframe
                    src={result.file.url}
                    title={`Offer Letter - ${result.reference}`}
                    className="w-full h-[650px] bg-white border-0"
                  />
                ) : isImage(result.file) ? (
                  <div className="p-4 bg-slate-900/5 flex items-center justify-center">
                    <img
                      src={result.file.url}
                      alt={`Offer Document - ${result.reference}`}
                      className="max-h-[650px] w-auto object-contain mx-auto rounded-lg shadow-md border border-slate-200"
                    />
                  </div>
                ) : (
                  /* Fallback when not recognizable format */
                  <div className="p-12 text-center bg-white space-y-4">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <h5 className="text-base font-semibold text-slate-800">
                        {result.file.originalName || 'Offer Letter Document'}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Preview is available via direct download or browser viewer.
                      </p>
                    </div>
                    <a
                      href={result.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / View Document</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm">
                No attached document file associated with this reference record.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

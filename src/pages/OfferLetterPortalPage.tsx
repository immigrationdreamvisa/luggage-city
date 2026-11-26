import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileCheck2, HelpCircle, Lock, ShieldCheck } from 'lucide-react';
import { OfferLetterVerification } from '../components/OfferLetterVerification';

export function OfferLetterPortalPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0B172A]">
      {/* Header Banner */}
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1200px] mx-auto px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#162844] border border-[#B89352]/30 text-[#D4B882] text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-[#B89352]" />
            <span>Official Candidate Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold mb-3 tracking-tight">
            Offer Letter Verification & Document Lookup
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
            Verify the authenticity of your official offer letter, review issuing organization credentials, and access your embedded high-resolution document.
          </p>
        </div>
      </section>

      {/* Main Verification Section */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <OfferLetterVerification />

        {/* Informational Guidance Grid */}
        <div className="mt-16 pt-12 border-t border-[#E5DDD0] grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="bg-white border border-[#E5DDD0] rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5DDD0] flex items-center justify-center text-[#B89352] mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#0B172A] mb-2">
              Cryptographically Verified
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              Every issued offer letter is assigned an immutable reference identifier synchronized directly with the issuing organization's central registry.
            </p>
          </div>

          <div className="bg-white border border-[#E5DDD0] rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5DDD0] flex items-center justify-center text-[#B89352] mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#0B172A] mb-2">
              Embedded Previews & Downloads
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              Instantly view PDFs or high-resolution document images within the portal or download official files directly for your records.
            </p>
          </div>

          <div className="bg-white border border-[#E5DDD0] rounded-xl p-6 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5DDD0] flex items-center justify-center text-[#B89352] mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#0B172A] mb-2">
              Need Verification Assistance?
            </h3>
            <p className="text-xs text-[#5B6472] leading-relaxed">
              If your reference number is not recognized or you need status clarification, please contact our Human Resources and Recruitment team.
            </p>
            <Link
              to="/contact"
              className="mt-3 inline-block text-xs font-semibold text-[#0B172A] hover:text-[#B89352] underline"
            >
              Contact HR Support &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

function PolicyShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1100px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-2">
            {kicker}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl">{subtitle}</p>
        </div>
      </section>
      <div className="max-w-[1100px] mx-auto px-6 py-14">{children}</div>
    </div>
  );
}

export function ShippingDeliveryPage() {
  return (
    <PolicyShell
      kicker="Customer Support"
      title="Shipping & Delivery"
      subtitle="Reliable nationwide Canadian parcel delivery dispatched directly from our Woodbridge, Ontario fulfillment hub."
    >
      <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10 space-y-8 text-sm text-[#334155] leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            Complimentary Canadian Shipping Over $69 CAD
          </h2>
          <p>
            Orders of $69 CAD or more (before applicable provincial taxes) qualify for free standard shipping across most Canadian provinces. Orders under $69 CAD ship at a flat standard rate of $14.95 CAD.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-5 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm">
            <div className="text-xs font-semibold text-[#B89352] uppercase mb-1">
              Ontario & Quebec
            </div>
            <div className="text-lg font-semibold text-[#0B172A]">1–3 Business Days</div>
            <p className="text-xs text-[#5B6472] mt-1">
              Dispatched from Woodbridge, ON with full carrier tracking.
            </p>
          </div>
          <div className="p-5 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm">
            <div className="text-xs font-semibold text-[#B89352] uppercase mb-1">
              Western & Atlantic Canada
            </div>
            <div className="text-lg font-semibold text-[#0B172A]">3–6 Business Days</div>
            <p className="text-xs text-[#5B6472] mt-1">
              Insured ground delivery to major metropolitan and regional centres.
            </p>
          </div>
          <div className="p-5 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm">
            <div className="text-xs font-semibold text-[#B89352] uppercase mb-1">
              Order Processing
            </div>
            <div className="text-lg font-semibold text-[#0B172A]">1–2 Business Days</div>
            <p className="text-xs text-[#5B6472] mt-1">
              Every suitcase is inspected and protective-boxed prior to handoff.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            Tracking & Delivery Assistance
          </h2>
          <p>
            Once your order leaves our Woodbridge facility, tracking details are emailed to your registered address. For oversized luggage sets or remote postal codes, our Customer Care team can assist at{' '}
            <strong>sales@luggagecity.ca</strong> or <strong>1-833-662-7233</strong> (Mon–Fri, 10:00 AM – 6:00 PM ET).
          </p>
        </div>
      </div>
    </PolicyShell>
  );
}

export function ReturnsExchangesPage() {
  return (
    <PolicyShell
      kicker="Customer Support"
      title="Returns & Exchanges"
      subtitle="Clear, straightforward return procedures for online luggagecity.ca orders."
    >
      <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10 space-y-7 text-sm text-[#334155] leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            Online E-Commerce Return Policy
          </h2>
          <p>
            Unused items in original condition with all tags, manuals, and original cartons may be returned to our Returns Department. Please note that online e-commerce returns are processed by a dedicated department and{' '}
            <strong>cannot be returned or exchanged directly at our physical retail store locations</strong>.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            Return Shipping & Prepaid Labels
          </h2>
          <p>
            Customers are responsible for return shipping costs. Upon request, our Customer Care team can issue a convenient prepaid Canadian return label, with the carrier fee deducted from the final refund amount.
          </p>
        </div>

        <div className="p-6 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B89352] mb-2">
            Official Returns Department Address
          </div>
          <p className="font-medium text-[#0B172A]">
            Returns Department, Luggage City
            <br />
            201-200 Windflower Gate
            <br />
            Woodbridge, ON L4L 9L3, Canada
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            Inspection & Refund Timeline
          </h2>
          <p>
            Once your returned parcel arrives at our Woodbridge facility and passes condition inspection, refunds are issued back to your original payment method within{' '}
            <strong>7–10 business days</strong>. To initiate a return authorization, contact{' '}
            <strong>sales@luggagecity.ca</strong> or call{' '}
            <strong>+1 (905) 851-2001 ext. 29</strong>.
          </p>
        </div>
      </div>
    </PolicyShell>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Are all products sold at Luggage City authentic and covered by warranty?',
    a: 'Yes. Luggage City is an authorized Canadian dealer for every brand we carry—including Samsonite, Briggs & Riley, Verage, American Tourister, Pacsafe, Travelpro, JanSport, Secrid, and Heys—ensuring full manufacturer warranty coverage.',
  },
  {
    q: 'Can I bring my Samsonite or Briggs & Riley suitcase to Luggage City for repair?',
    a: 'Yes. Our Woodbridge Flagship (Unit 201, 200 Windflower Gate) operates as an official authorized repair centre for Samsonite, Briggs & Riley, American Tourister, Verage, and Travelpro. You can drop off or pick up luggage during regular store hours, and technicians are available Mon, Tue, Thu & Fri from 4:00 PM – 7:00 PM ET.',
  },
  {
    q: 'What qualifies for free shipping across Canada?',
    a: 'Online orders of $69 CAD or more before taxes qualify for complimentary standard shipping across most Canadian provinces.',
  },
  {
    q: 'Can I return an online order at the Woodbridge or Thornhill store?',
    a: 'Online e-commerce returns are managed by our dedicated Returns Department at 201-200 Windflower Gate, Woodbridge, ON L4L 9L3 and cannot be processed at retail store registers. Refunds are completed within 7–10 business days of receipt and inspection.',
  },
  {
    q: 'How do I check my job application status or download my Luggage City offer letter?',
    a: 'Candidates who applied through our Careers portal can visit the Check Your Offer Letter page, enter their unique Application ID and registered email address, and complete secure email OTP verification to view their status and download an officially issued offer letter PDF.',
  },
];

export function FaqsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <PolicyShell
      kicker="Help Centre"
      title="Frequently Asked Questions"
      subtitle="Answers regarding Canadian shipping, airline sizing, authorized repairs, returns, and recruitment."
    >
      <div className="bg-white border border-[#E5DDD0] rounded-sm divide-y divide-[#EFEAE1]">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.q} className="p-6">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <span className="text-base font-semibold text-[#0B172A]">
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#B89352] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0" />
                )}
              </button>
              {isOpen && (
                <p className="mt-3 text-sm text-[#475569] leading-relaxed pr-8">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-sm text-[#5B6472]">
        Need further assistance?{' '}
        <Link to="/contact" className="font-semibold text-[#0B172A] underline">
          Contact our Customer Care team
        </Link>{' '}
        or visit{' '}
        <Link to="/check-offer-letter" className="font-semibold text-[#0B172A] underline">
          Check Your Offer Letter
        </Link>
        .
      </div>
    </PolicyShell>
  );
}

export function PrivacyPolicyPage() {
  return (
    <PolicyShell
      kicker="Legal & Compliance"
      title="Privacy Policy"
      subtitle="How Luggage City (K. Jamson Group) collects, safeguards, and uses personal information under Canadian privacy standards (PIPEDA)."
    >
      <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10 space-y-6 text-sm text-[#334155] leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            1. Information We Collect
          </h2>
          <p>
            When you place an order, request a luggage repair, subscribe to our newsletter, or submit an employment application through Luggage City, we collect only the personal data necessary to fulfill that request—such as your name, email address, phone number, Canadian shipping address, or resume documentation.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            2. Confidential Recruitment & Offer Letter Records
          </h2>
          <p>
            Applicant resumes and officially issued offer letter PDFs are stored strictly in private, non-public server storage and are never exposed via public URLs. Access to candidate application statuses and offer letters is protected by server-side Application ID verification, email OTP authentication, and role-based HR access controls.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            3. Contacting Our Privacy Officer
          </h2>
          <p>
            You may request access to, correction of, or deletion of your personal records at any time by writing to <strong>sales@luggagecity.ca</strong> or Unit 201, 200 Windflower Gate, Woodbridge, ON L4L 9L3.
          </p>
        </div>
      </div>
    </PolicyShell>
  );
}

export function TermsConditionsPage() {
  return (
    <PolicyShell
      kicker="Legal & Compliance"
      title="Terms & Conditions"
      subtitle="Governing use of luggagecity.ca, Canadian product pricing, warranties, and recruitment portal access."
    >
      <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10 space-y-6 text-sm text-[#334155] leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            1. Pricing & Availability (CAD)
          </h2>
          <p>
            All retail prices displayed on Luggage City are listed in Canadian Dollars (CAD) and exclude applicable provincial sales taxes (GST, HST, PST, or QST) unless otherwise stated. Seasonal promotions apply while inventory lasts.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            2. Warranties & Repairs
          </h2>
          <p>
            Manufacturer warranties are provided directly by each respective brand and serviced locally by our Woodbridge authorized repair technicians where designated. Shipping costs for warranty repairs remain the customer's responsibility.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
            3. Careers & Offer Letter Portal
          </h2>
          <p>
            Submission of an employment application does not constitute an offer of employment. Official Luggage City offer letters are valid only when formally issued and published by authorized Human Resources personnel through our verified recruitment system.
          </p>
        </div>
      </div>
    </PolicyShell>
  );
}

import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone, ShieldCheck, Wrench } from 'lucide-react';
import { IMAGES } from '../data/catalog';
import { SafeImage } from '../components/SafeImage';

const AUTHORIZED_REPAIR_BRANDS = [
  'Briggs & Riley',
  'Samsonite',
  'American Tourister',
  'Verage',
  'Travelpro',
];

export function RepairsWarrantyPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    brand: 'Samsonite',
    itemType: 'Carry-On Spinner',
    issueDescription: '',
    preferredLocation: 'Woodbridge Flagship Repair Centre',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [referenceCode, setReferenceCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to submit your repair request.');
        return;
      }
      setReferenceCode(data.referenceCode);
      setForm({
        name: '',
        email: '',
        phone: '',
        brand: 'Samsonite',
        itemType: 'Carry-On Spinner',
        issueDescription: '',
        preferredLocation: 'Woodbridge Flagship Repair Centre',
      });
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0B172A] text-[#FAF9F6]">
        <div className="max-w-[1360px] mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-3">
              Official Authorized Repair Centre
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight mb-4">
              Repairs & Manufacturer Warranty Care
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed mb-6">
              Our Woodbridge service department is an official Canadian authorized repair centre for Samsonite, Briggs & Riley, American Tourister, Verage, and Travelpro. We restore wheels, handles, locks, zippers, and structural assemblies using factory parts.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-[#E5DDD0]">
              {AUTHORIZED_REPAIR_BRANDS.map((brand) => (
                <span key={brand} className="py-1 px-3 border border-white/20 rounded-sm">
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-sm overflow-hidden border border-white/15 aspect-[16/10]">
            <SafeImage
              src={IMAGES.repairWorkshop}
              alt="Luggage City certified luggage repair technician workbench"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Repair Details & Hours */}
      <section className="max-w-[1360px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5DDD0] rounded-sm p-7 space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
              Repair Department Details
            </h2>
            <div className="space-y-4 text-sm text-[#334155]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#0B172A]">
                    Woodbridge Flagship & Repair Centre
                  </div>
                  <div>Piazza Del Sole Plaza, Unit 201</div>
                  <div>200 Windflower Gate, Woodbridge, ON L4L 9L3</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#0B172A]">Technician Hours</div>
                  <div>Monday, Tuesday, Thursday & Friday: 4:00 PM – 7:00 PM ET</div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Luggage drop-off & pickup available during all regular store hours.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#0B172A]">Repair Desk Phone</div>
                  <div>+1 (905) 851-2001 ext. 30</div>
                  <div>Toll-Free: 1-833-662-7233</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#0B172A]">Repair Email</div>
                  <div>service@luggagecity.ca</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F1ECE4] border border-[#E5DDD0] rounded-sm p-7 space-y-3">
            <div className="flex items-center gap-2 text-[#0B172A] font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#B89352]" />
              <span>Important Warranty Information</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Manufacturer warranties cover manufacturing defects and—on qualifying collections such as Briggs & Riley Simple as That®—functional damage. Please bring proof of purchase when submitting warranty claims.
            </p>
            <p className="text-xs text-[#475569] leading-relaxed">
              Luggage City is not responsible for inbound or outbound shipping costs associated with warranty repairs or manufacturer replacements. Airline damage inspection certificates are available upon evaluation.
            </p>
          </div>
        </div>

        {/* Repair Request Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-sm p-7 sm:p-9">
          <div className="flex items-center gap-2.5 mb-2">
            <Wrench className="w-5 h-5 text-[#B89352]" />
            <h2 className="font-serif text-3xl font-semibold text-[#0B172A]">
              Request a Repair Assessment
            </h2>
          </div>
          <p className="text-sm text-[#5B6472] mb-7">
            Tell our certified repair technicians about your suitcase or bag and we will respond with parts availability and drop-off instructions.
          </p>

          {referenceCode ? (
            <div className="p-6 bg-[#FAF9F6] border border-[#B89352]/40 rounded-sm">
              <div className="flex items-center gap-2 text-[#1E5631] font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Repair Inquiry Logged</span>
              </div>
              <p className="text-sm text-[#334155] mb-3">
                Reference Code:{' '}
                <strong className="font-mono text-[#0B172A]">{referenceCode}</strong>
              </p>
              <p className="text-xs text-[#5B6472] mb-4">
                Our Woodbridge repair team will contact you during technician hours (Mon/Tue/Thu/Fri 4–7 PM ET) or via service@luggagecity.ca.
              </p>
              <button
                type="button"
                onClick={() => setReferenceCode('')}
                className="px-5 py-2 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Luggage Brand *
                  </label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  >
                    <option value="Samsonite">Samsonite</option>
                    <option value="Briggs & Riley">Briggs & Riley</option>
                    <option value="American Tourister">American Tourister</option>
                    <option value="Verage">Verage</option>
                    <option value="Travelpro">Travelpro</option>
                    <option value="Other Brand">Other Brand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Item Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.itemType}
                    onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                    placeholder="e.g., 21 inch Carry-On Spinner"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Drop-Off Preference
                  </label>
                  <select
                    value={form.preferredLocation}
                    onChange={(e) =>
                      setForm({ ...form, preferredLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  >
                    <option value="Woodbridge Flagship Repair Centre">
                      Woodbridge Flagship Repair Centre
                    </option>
                    <option value="Thornhill Promenade Store">
                      Thornhill Promenade Store Drop-Off
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Describe the Damage or Part Needed *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.issueDescription}
                  onChange={(e) =>
                    setForm({ ...form, issueDescription: e.target.value })
                  }
                  placeholder="Describe wheel, telescopic handle, zipper, TSA lock, or shell issue..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Submitting Request...' : 'Submit Repair Inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

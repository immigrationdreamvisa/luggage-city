import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';

export function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Online Order Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send your message.');
        return;
      }
      setSent(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: 'Online Order Inquiry',
        message: '',
      });
    } catch {
      setError('Network error while sending message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-16">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-2">
            Customer Care & Showrooms
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-3">
            Contact Luggage City
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl">
            Reach our Canadian customer support specialists, visit our Woodbridge Flagship or Thornhill Promenade store, or connect with our repair desk.
          </p>
        </div>
      </section>

      <section className="max-w-[1360px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5DDD0] rounded-sm p-7 space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
              Online Store Customer Care
            </h2>
            <div className="space-y-3 text-sm text-[#334155]">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div>+1 (905) 851-2001 ext. 29</div>
                  <div>Toll-Free: 1-833-662-7233</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div>Online Support: sales@luggagecity.ca</div>
                  <div>Repair Centre: service@luggagecity.ca</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>Monday – Friday: 10:00 AM – 6:00 PM ET</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5DDD0] rounded-sm p-7 space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
              Physical Store Locations
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
                  <div className="text-xs text-[#64748B] mt-1">
                    Repairs Phone: (905) 851-2001 ext. 30
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#EFEAE1] flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B89352] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#0B172A]">
                    Thornhill — Promenade Mall
                  </div>
                  <div>1 Promenade Circle, Thornhill, ON L4J 4P8</div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Store Phone: (905) 764-0020
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-sm p-7 sm:p-9">
          <h2 className="font-serif text-3xl font-semibold text-[#0B172A] mb-2">
            Send Us a Message
          </h2>
          <p className="text-sm text-[#5B6472] mb-7">
            Questions about airline cabin sizing, corporate gifting, order tracking, or returns? Our team responds within one business day.
          </p>

          {sent ? (
            <div className="p-6 bg-[#FAF9F6] border border-[#B89352]/40 rounded-sm">
              <div className="flex items-center gap-2 text-[#1E5631] font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Message Received</span>
              </div>
              <p className="text-sm text-[#475569] mb-4">
                Thank you for contacting Luggage City. A specialist from our Ontario team will reply to your email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-5 py-2 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm cursor-pointer"
              >
                Send Another Message
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Topic *
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  >
                    <option value="Online Order Inquiry">Online Order Inquiry</option>
                    <option value="Product & Sizing Advice">Product & Sizing Advice</option>
                    <option value="Returns & Exchanges">Returns & Exchanges</option>
                    <option value="Repairs & Warranty">Repairs & Warranty</option>
                    <option value="Corporate & Bulk Orders">Corporate & Bulk Orders</option>
                    <option value="Careers & Recruitment">Careers & Recruitment</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

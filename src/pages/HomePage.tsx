import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import {
  BRANDS,
  FEATURED_CATEGORIES,
  IMAGES,
  PRODUCTS,
  TESTIMONIALS,
} from '../data/catalog';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export function HomePage() {
  const [email, setEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const trendingProducts = PRODUCTS.filter((p) => p.isTrending).slice(0, 6);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewsletterState('success');
      setEmail('');
    } catch {
      setNewsletterState('error');
    }
  };

  return (
    <div>
      {/* 1. Editorial Full-Width Hero */}
      <section className="relative bg-[#0B172A] overflow-hidden">
        <div className="absolute inset-0">
          <SafeImage
            src={IMAGES.heroEditorial}
            alt="Luxury hardside carry-on suitcases inside a sunlit international airport departure lounge"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B172A]/90 via-[#0B172A]/60 to-[#0B172A]/20" />
        </div>

        <div className="relative max-w-[1360px] mx-auto px-6 py-24 sm:py-32 lg:py-36">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium tracking-[0.14em] uppercase text-[#D4B882] mb-4">
              Canada's Specialty Luggage Retailer · Est. 1999
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-semibold text-[#FAF9F6] leading-[1.08] tracking-tight mb-6">
              Your Journey. Your Style. Your Luggage.
            </h1>
            <p className="text-base sm:text-lg text-[#E5DDD0] leading-relaxed max-w-xl mb-9">
              Discover over 40 international luggage and travel houses—from Briggs & Riley lifetime collections to featherweight Samsonite spinners—backed by Canada's premier authorized repair centre.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-[#B89352] text-[#0B172A] rounded-sm hover:bg-[#D4B882] transition-colors whitespace-nowrap"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/luggage"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium border border-[#FAF9F6]/40 text-[#FAF9F6] rounded-sm hover:bg-[#FAF9F6]/10 transition-colors whitespace-nowrap"
              >
                <span>Explore Collections</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Assurance Strip (Full-Width Row Below Hero) */}
      <section className="bg-[#F1ECE4] border-b border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#B89352] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#0B172A]">
                Free Canadian Shipping
              </div>
              <div className="text-xs text-[#5B6472]">
                Complimentary delivery across Canada on orders $69+ CAD
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-[#B89352] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#0B172A]">
                Authorized Repair Centre
              </div>
              <div className="text-xs text-[#5B6472]">
                Certified technicians for Samsonite, Briggs & Riley & Verage
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#B89352] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#0B172A]">
                40+ Global Travel Brands
              </div>
              <div className="text-xs text-[#5B6472]">
                100% authentic stock backed by full manufacturer warranties
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B89352] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#0B172A]">
                K. Jamson Group Heritage
              </div>
              <div className="text-xs text-[#5B6472]">
                Canadian leather & travel craftsmanship rooted since 1930
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories */}
      <section className="max-w-[1360px] mx-auto px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
              Curated Travel Categories
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A]">
              Engineered for Every Departure
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B172A] hover:text-[#B89352] transition-colors whitespace-nowrap"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              to={cat.route}
              className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-[#F1ECE4] border border-[#E5DDD0]"
            >
              <SafeImage
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B172A]/85 via-[#0B172A]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-serif text-2xl font-semibold text-[#FAF9F6] mb-1">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#E5DDD0] leading-relaxed mb-3 max-w-xs">
                  {cat.subtitle}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4B882] group-hover:gap-2 transition-all">
                  <span>Shop Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Brands */}
      <section className="bg-white border-y border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
                Authorized Canadian Retailer
              </p>
              <h2 className="font-serif text-3xl font-semibold text-[#0B172A]">
                Premier Travel Houses
              </h2>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B172A] hover:text-[#B89352]"
            >
              <span>Explore All Brands</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BRANDS.slice(0, 8).map((brand) => (
              <Link
                key={brand.slug}
                to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group p-6 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm hover:border-[#B89352] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="font-serif text-2xl font-semibold text-[#0B172A] group-hover:text-[#B89352] transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-xs text-[#5B6472] mt-1">
                    {brand.specialty}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5DDD0] text-[11px] font-medium text-[#0B172A]/80 flex items-center justify-between">
                  <span>{brand.warrantyHighlight}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B89352] shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trending Products */}
      <section className="max-w-[1360px] mx-auto px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
              Traveller Favourites
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A]">
              Trending Across Canada
            </h2>
          </div>
          <Link
            to="/best-sellers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B172A] hover:text-[#B89352]"
          >
            <span>Browse Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Special Offers Editorial Banner */}
      <section className="max-w-[1360px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch bg-[#0B172A] rounded-sm overflow-hidden border border-[#1E3150]">
          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-3">
              Seasonal Travel Event
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF9F6] leading-tight mb-4">
              Save Up to 22% on Coordinated Luggage Sets & Hardside Spinners
            </h2>
            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed mb-8">
              Upgrade your upcoming itinerary with nested sets from Samsonite and Verage, plus exclusive Canadian savings on American Tourister and Travelpro essentials.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/sale"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#B89352] text-[#0B172A] rounded-sm hover:bg-[#D4B882] transition-colors"
              >
                <span>Shop Sale & Offers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/luggage?category=Luggage+Sets"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#FAF9F6] border border-white/25 rounded-sm hover:bg-white/10 transition-colors"
              >
                <span>Explore Luggage Sets</span>
              </Link>
            </div>
          </div>
          <div className="min-h-[300px] lg:min-h-full">
            <SafeImage
              src={IMAGES.luggageSets}
              alt="Coordinated 3-piece champagne and navy hardside luggage set"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Repair & Warranty Craftsmanship Spotlight */}
      <section className="bg-[#F1ECE4] border-y border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div className="min-h-[320px] rounded-sm overflow-hidden border border-[#E5DDD0]">
              <SafeImage
                src={IMAGES.repairWorkshop}
                alt="Luggage City authorized technician inspecting precision spinner wheel assemblies"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
                Woodbridge Authorized Service Centre
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] leading-tight mb-4">
                Built to Travel Far. Repaired to Last Longer.
              </h2>
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed mb-6">
                Luggage City is an official authorized warranty and repair centre for Samsonite, Briggs & Riley, American Tourister, Verage, and Travelpro. From wheel assemblies and telescopic handles to TSA lock replacements, our technicians restore your luggage using factory-genuine parts.
              </p>
              <ul className="space-y-2.5 text-sm text-[#0B172A] mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B89352] shrink-0" />
                  <span>Direct manufacturer warranty claims & airline damage assessments</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B89352] shrink-0" />
                  <span>Drop-off & pickup during store hours at 200 Windflower Gate, Woodbridge</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B89352] shrink-0" />
                  <span>Dedicated repair team: (905) 851-2001 ext. 30 · service@luggagecity.ca</span>
                </li>
              </ul>
              <div>
                <Link
                  to="/repairs-warranty"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors"
                >
                  <span>Explore Repairs & Warranty</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Attributable Customer Reviews */}
      <section className="max-w-[1360px] mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
            Verified Canadian Travellers
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A]">
            Trusted Across Every Coast
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="p-7 bg-white border border-[#E5DDD0] rounded-sm flex flex-col justify-between"
            >
              <p className="text-sm text-[#334155] leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <footer className="pt-4 border-t border-[#EFEAE1]">
                <div className="text-sm font-semibold text-[#0B172A]">{t.name}</div>
                <div className="text-xs text-[#5B6472] mt-0.5">
                  {t.role} · {t.city}
                </div>
                <div className="text-[11px] font-medium text-[#B89352] mt-1.5">
                  {t.product}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* 8. Newsletter Subscription */}
      <section className="bg-[#FAF9F6] border-t border-[#E5DDD0]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-2">
            The Luggage City Dispatch
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] mb-3">
            Receive Exclusive Canadian Offers & New Arrivals
          </h2>
          <p className="text-sm text-[#5B6472] mb-8 max-w-lg mx-auto">
            Join Canadian travellers receiving seasonal private savings, airline carry-on sizing updates, and early access to limited luggage editions.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.ca"
              aria-label="Email address"
              className="flex-1 px-4 py-3 text-sm bg-white border border-[#D4CDC0] rounded-sm text-[#0B172A] focus:outline-none focus:border-[#0B172A]"
            />
            <button
              type="submit"
              disabled={newsletterState === 'loading'}
              className="px-7 py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
            >
              {newsletterState === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {newsletterState === 'success' && (
            <p className="mt-3 text-xs font-medium text-[#1E5631]">
              Welcome aboard. Your email has been registered for Luggage City updates.
            </p>
          )}
          {newsletterState === 'error' && (
            <p className="mt-3 text-xs font-medium text-[#9B2C2C]">
              Please enter a valid email address.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

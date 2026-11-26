import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { IMAGES } from '../data/catalog';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  return (
    <div>
      <section className="bg-[#0B172A] text-[#FAF9F6]">
        <div className="max-w-[1360px] mx-auto px-6 py-16 lg:py-24">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-3">
            Our Heritage · K. Jamson Group
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight max-w-3xl mb-5">
            Canada's Specialty Luggage Authority Since 1999
          </h1>
          <p className="text-base sm:text-lg text-[#CBD5E1] max-w-2xl leading-relaxed">
            Rooted in the K. Jamson Group's leather craftsmanship dating back to 1930, Luggage City has grown into Canada's premier specialty travel retailer—combining curated global collections with hands-on local expertise.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="bg-[#F1ECE4] border-b border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 tabular-nums">
          <div>
            <div className="font-serif text-4xl font-semibold text-[#0B172A]">1930</div>
            <div className="text-xs text-[#5B6472] mt-1">K. Jamson Group Craftsmanship Roots</div>
          </div>
          <div>
            <div className="font-serif text-4xl font-semibold text-[#0B172A]">40+</div>
            <div className="text-xs text-[#5B6472] mt-1">International Travel & Luggage Brands</div>
          </div>
          <div>
            <div className="font-serif text-4xl font-semibold text-[#0B172A]">3,000+</div>
            <div className="text-xs text-[#5B6472] mt-1">Curated Suitcases, Packs & Accessories</div>
          </div>
          <div>
            <div className="font-serif text-4xl font-semibold text-[#0B172A]">5,000 sq ft</div>
            <div className="text-xs text-[#5B6472] mt-1">Woodbridge Flagship Travel Superstore</div>
          </div>
        </div>
      </section>

      {/* Story Split */}
      <section className="max-w-[1360px] mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        <div className="rounded-sm overflow-hidden border border-[#E5DDD0] min-h-[320px]">
          <SafeImage
            src={IMAGES.careersRetail}
            alt="Luggage City showroom specialist assisting a traveller"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#B89352]">
            Why Travellers Choose Luggage City
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] leading-tight">
            Thoughtful Curation Backed by Real Technicians
          </h2>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Unlike faceless marketplaces, every suitcase, business brief, anti-theft backpack, and RFID wallet we stock is selected by specialists who test zippers, wheel housings, and airline cabin sizing every day.
          </p>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Our relationship with your luggage continues long after checkout. As an official authorized Canadian repair centre for Samsonite, Briggs & Riley, American Tourister, Verage, and Travelpro, our Woodbridge technicians keep trusted travel companions rolling for decades.
          </p>
          <div className="pt-3 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844]"
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-[#0B172A] text-[#0B172A] rounded-sm hover:bg-[#F1ECE4]"
            >
              <span>Join Our Team</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="bg-white border-t border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl font-semibold text-[#0B172A] mb-10">
            Our Ontario Showrooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B89352]">
                <MapPin className="w-4 h-4" />
                <span>Flagship Superstore & Repair Centre</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#0B172A]">
                Woodbridge Flagship (Vaughan)
              </h3>
              <p className="text-sm text-[#475569]">
                Piazza Del Sole Plaza, Unit 201, 200 Windflower Gate, Woodbridge, ON L4L 9L3
              </p>
              <p className="text-sm text-[#475569]">
                5,000 square feet showcasing our full collection of luggage, backpacks, handbags, travel accessories, and our in-house authorized repair workshop.
              </p>
              <div className="pt-2 text-xs text-[#0B172A] font-medium">
                Phone: +1 (905) 851-2001 · Toll-Free: 1-833-662-7233
              </div>
            </div>

            <div className="p-8 bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B89352]">
                <MapPin className="w-4 h-4" />
                <span>Retail Boutique</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#0B172A]">
                Thornhill — Promenade Mall
              </h3>
              <p className="text-sm text-[#475569]">
                Promenade Shopping Centre, 1 Promenade Circle, Thornhill, ON L4J 4P8
              </p>
              <p className="text-sm text-[#475569]">
                Convenient showroom featuring curated carry-ons, Briggs & Riley business collections, Pacsafe anti-theft gear, Secrid wallets, and personalized fittings.
              </p>
              <div className="pt-2 text-xs text-[#0B172A] font-medium">
                Phone: (905) 764-0020
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: '100% Authentic Brands',
                text: 'Direct relationships with every featured manufacturer ensure genuine stock and valid Canadian warranty registration.',
              },
              {
                icon: Wrench,
                title: 'Factory-Trained Repair',
                text: 'Certified warranty diagnostics, genuine replacement wheels and handles, and airline damage evaluation.',
              },
              {
                icon: ShieldCheck,
                title: 'Dedicated Canadian Care',
                text: 'Responsive Ontario-based support for sizing questions, corporate orders, and post-purchase service.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 border border-[#E5DDD0] rounded-sm bg-white">
                <item.icon className="w-5 h-5 text-[#B89352] mb-3" />
                <h3 className="text-base font-semibold text-[#0B172A] mb-1.5">{item.title}</h3>
                <p className="text-xs text-[#5B6472] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

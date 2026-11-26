import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wrench } from 'lucide-react';
import { BRANDS, PRODUCTS } from '../data/catalog';

export function BrandsPage() {
  return (
    <div>
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-16">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-2">
            Authorized Canadian Dealer
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-3">
            Our Featured Brands
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl leading-relaxed">
            Luggage City partners directly with more than 40 international travel houses to guarantee authentic merchandise, full manufacturer warranties, and certified local repair support.
          </p>
        </div>
      </section>

      <section className="max-w-[1360px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {BRANDS.map((brand) => {
            const count = PRODUCTS.filter((p) => p.brand === brand.name).length;
            return (
              <article
                key={brand.slug}
                className="bg-white border border-[#E5DDD0] rounded-sm p-7 flex flex-col justify-between hover:border-[#B89352] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#64748B] mb-2">
                    <span>{brand.origin}</span>
                    <span className="tabular-nums">{count} featured models</span>
                  </div>
                  <h2 className="font-serif text-3xl font-semibold text-[#0B172A] mb-1">
                    {brand.name}
                  </h2>
                  <p className="text-xs font-medium text-[#B89352] mb-4">
                    {brand.specialty}
                  </p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-6">
                    {brand.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-[#EFEAE1] space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#0B172A]">
                    <ShieldCheck className="w-4 h-4 text-[#B89352] shrink-0" />
                    <span>{brand.warrantyHighlight}</span>
                  </div>
                  {brand.authorizedRepair && (
                    <div className="flex items-center gap-2 text-xs text-[#1E5631]">
                      <Wrench className="w-4 h-4 shrink-0" />
                      <span>Official Luggage City Authorized Repair Brand</span>
                    </div>
                  )}
                  <Link
                    to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B172A] hover:text-[#B89352]"
                  >
                    <span>Shop {brand.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

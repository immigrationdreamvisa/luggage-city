import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRANDS, PRODUCTS, formatCad } from '../data/catalog';
import { SafeImage } from './SafeImage';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS.slice(0, 4);
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  if (!searchOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B172A]/60 backdrop-blur-[2px] flex items-start justify-center pt-16 sm:pt-24 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search Luggage City catalog"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-5 py-4 border-b border-[#E5DDD0] bg-white"
        >
          <Search className="w-5 h-5 text-[#B89352] shrink-0" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Samsonite, Briggs & Riley, carry-on, Secrid, backpacks..."
            className="flex-1 bg-transparent text-sm text-[#0B172A] placeholder:text-[#8B93A1] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="p-1.5 text-[#5B6472] hover:text-[#0B172A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#5B6472] tracking-wide">
              {query.trim() ? `Matching Products (${matches.length})` : 'Popular Searches'}
            </span>
            {query.trim() && (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0B172A] hover:text-[#B89352] cursor-pointer"
              >
                <span>View all in Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {matches.length === 0 ? (
            <p className="text-sm text-[#5B6472] py-6 text-center">
              No products matched "{query}". Try searching for Carry-On, Samsonite, Pacsafe, or Secrid.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 p-2.5 bg-white border border-[#E5DDD0] rounded-sm hover:border-[#B89352] transition-colors"
                >
                  <div className="w-16 h-14 shrink-0 bg-[#F1ECE4] rounded-sm overflow-hidden">
                    <SafeImage
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-[#B89352]">{p.brand}</div>
                    <div className="text-xs font-semibold text-[#0B172A] truncate">
                      {p.name}
                    </div>
                    <div className="text-xs font-medium text-[#334155] tabular-nums mt-0.5">
                      {formatCad(p.priceCad)} CAD
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#E5DDD0]">
            <div className="text-xs font-semibold text-[#5B6472] mb-2">Featured Brands</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#0B172A]">
              {BRANDS.slice(0, 7).map((brand) => (
                <Link
                  key={brand.slug}
                  to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                  onClick={() => setSearchOpen(false)}
                  className="hover:text-[#B89352] underline-offset-4 hover:underline"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCad } from '../data/catalog';
import { SafeImage } from './SafeImage';

export function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0]?.name || 'Standard');
      setActiveImage(0);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const wishlisted = isWishlisted(quickViewProduct.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B172A]/60 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${quickViewProduct.name}`}
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-white/90 text-[#0B172A] border border-[#E5DDD0] rounded-sm hover:bg-[#0B172A] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-[#F1ECE4] p-6 flex flex-col justify-between">
          <div className="aspect-[4/3] overflow-hidden rounded-sm bg-white">
            <SafeImage
              src={quickViewProduct.images[activeImage] || quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          {quickViewProduct.images.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              {quickViewProduct.images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-12 overflow-hidden rounded-sm border transition-all cursor-pointer ${
                    activeImage === i
                      ? 'border-[#0B172A] ring-1 ring-[#0B172A]'
                      : 'border-[#E5DDD0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-7 flex flex-col">
          <div className="text-xs text-[#B89352] font-semibold tracking-wide mb-1">
            {quickViewProduct.brand} · {quickViewProduct.category}
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] leading-tight mb-2">
            {quickViewProduct.name}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[#5B6472] mb-4">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="w-3.5 h-3.5 text-[#B89352] fill-[#B89352]" />
              {quickViewProduct.rating.toFixed(1)} ({quickViewProduct.reviewCount} reviews)
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{quickViewProduct.sku}</span>
          </div>

          <div className="flex items-baseline gap-2.5 mb-4 tabular-nums">
            <span className="text-2xl font-semibold text-[#0B172A]">
              {formatCad(quickViewProduct.priceCad)}
            </span>
            {quickViewProduct.compareAtCad && (
              <span className="text-sm text-[#8B93A1] line-through">
                {formatCad(quickViewProduct.compareAtCad)}
              </span>
            )}
            <span className="text-xs text-[#64748B]">CAD</span>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed mb-5">
            {quickViewProduct.shortDescription}
          </p>

          <div className="mb-5">
            <div className="text-xs font-medium text-[#0B172A] mb-2">
              Finish: <span className="text-[#5B6472] font-normal">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {quickViewProduct.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    selectedColor === c.name
                      ? 'border-[#B89352] scale-110'
                      : 'border-white ring-1 ring-[#D4CDC0]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="text-xs text-[#1E5631] font-medium mb-5">
            {quickViewProduct.stockNote}
          </div>

          <div className="mt-auto flex flex-col gap-2.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(quickViewProduct, selectedColor);
                  setQuickViewProduct(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(quickViewProduct.id)}
                aria-label="Toggle wishlist"
                className={`px-3.5 py-3 border rounded-sm transition-colors cursor-pointer ${
                  wishlisted
                    ? 'bg-[#0B172A] text-[#D4B882] border-[#0B172A]'
                    : 'border-[#D4CDC0] text-[#0B172A] hover:border-[#0B172A]'
                }`}
              >
                <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            <Link
              to={`/product/${quickViewProduct.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="text-center text-xs font-medium text-[#0B172A] underline underline-offset-4 hover:text-[#B89352] py-1"
            >
              View Full Specifications & Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

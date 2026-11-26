import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product, formatCad } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickViewProduct } = useStore();
  const wishlisted = isWishlisted(product.id);
  const discountPct =
    product.compareAtCad && product.compareAtCad > product.priceCad
      ? Math.round(((product.compareAtCad - product.priceCad) / product.compareAtCad) * 100)
      : null;

  return (
    <article className="group flex flex-col bg-white border border-[#E5DDD0] rounded-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-[#F4EFE8] overflow-hidden">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89352]"
        >
          <SafeImage
            src={product.images[0]}
            alt={`${product.brand} ${product.name}`}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>

        {/* Single restrained editorial tag (no badge spam) */}
        {discountPct ? (
          <span className="absolute top-3 left-3 bg-[#0B172A] text-[#FAF9F6] text-[11px] font-medium tracking-wide px-2.5 py-1 tabular-nums">
            Save {discountPct}%
          </span>
        ) : product.isBestSeller ? (
          <span className="absolute top-3 left-3 bg-[#FAF9F6]/95 text-[#0B172A] text-[11px] font-medium tracking-wide px-2.5 py-1 border border-[#E5DDD0]">
            Best Seller
          </span>
        ) : null}

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-9 h-9 flex items-center justify-center rounded-sm border transition-colors cursor-pointer ${
              wishlisted
                ? 'bg-[#0B172A] text-[#D4B882] border-[#0B172A]'
                : 'bg-[#FAF9F6]/95 text-[#0B172A] border-[#E5DDD0] hover:bg-[#0B172A] hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            aria-label={`Quick view ${product.name}`}
            className="w-9 h-9 flex items-center justify-center rounded-sm bg-[#FAF9F6]/95 text-[#0B172A] border border-[#E5DDD0] hover:bg-[#0B172A] hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-[#5B6472] mb-1.5">
          <span className="font-medium tracking-wide text-[#B89352]">{product.brand}</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="w-3.5 h-3.5 text-[#B89352] fill-[#B89352]" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-[#8B93A1]">({product.reviewCount})</span>
          </span>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="text-[15px] font-semibold text-[#0B172A] leading-snug hover:text-[#B89352] transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-[#5B6472] mb-4">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span className={product.inStock ? 'text-[#1E5631]' : 'text-[#9B2C2C]'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-[#EFEAE1] flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-semibold text-[#0B172A]">
              {formatCad(product.priceCad)}
            </span>
            {product.compareAtCad && (
              <span className="text-xs text-[#8B93A1] line-through">
                {formatCad(product.compareAtCad)}
              </span>
            )}
            <span className="text-[11px] text-[#7B8494]">CAD</span>
          </div>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#1A2D4A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </article>
  );
}

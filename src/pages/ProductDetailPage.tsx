import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Wrench,
} from 'lucide-react';
import { PRODUCTS, formatCad } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const product = PRODUCTS.find((p) => p.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setSelectedColor(product.colors[0]?.name || 'Standard');
      setSelectedSize(product.sizes[0] || 'Standard');
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-4xl font-semibold text-[#0B172A] mb-3">
          Product Not Found
        </h1>
        <p className="text-sm text-[#5B6472] mb-8">
          The travel item you requested is unavailable or has been moved.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm"
        >
          Return to Shop All
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const relatedProducts = PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category === product.category || p.brand === product.brand)
  ).slice(0, 3);

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] mb-8">
        <Link to="/" className="hover:text-[#0B172A]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#0B172A]">Shop All</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/shop?brand=${encodeURIComponent(product.brand)}`}
          className="hover:text-[#0B172A]"
        >
          {product.brand}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0B172A] font-medium">{product.name}</span>
      </nav>

      {/* Main Split: Sticky Gallery Left + Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Image Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="aspect-[4/3] bg-[#F1ECE4] border border-[#E5DDD0] rounded-sm overflow-hidden mb-4">
            <SafeImage
              src={product.images[activeImage] || product.images[0]}
              alt={`${product.brand} ${product.name}`}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`aspect-[4/3] overflow-hidden rounded-sm border bg-[#F1ECE4] transition-all cursor-pointer ${
                    activeImage === i
                      ? 'border-[#0B172A] ring-1 ring-[#0B172A]'
                      : 'border-[#E5DDD0] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-sm p-7 sm:p-8">
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            <Link
              to={`/shop?brand=${encodeURIComponent(product.brand)}`}
              className="font-semibold tracking-wider uppercase text-[#B89352] hover:underline"
            >
              {product.brand}
            </Link>
            <span className="font-mono text-[#64748B]">SKU: {product.sku}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 text-xs text-[#5B6472] mb-5">
            <span className="inline-flex items-center gap-1 tabular-nums font-medium text-[#0B172A]">
              <Star className="w-4 h-4 text-[#B89352] fill-[#B89352]" />
              {product.rating.toFixed(1)}
            </span>
            <span>({product.reviewCount} verified reviews)</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          <div className="flex items-baseline gap-3 pb-6 mb-6 border-b border-[#EFEAE1] tabular-nums">
            <span className="text-3xl font-semibold text-[#0B172A]">
              {formatCad(product.priceCad)}
            </span>
            {product.compareAtCad && (
              <span className="text-base text-[#8B93A1] line-through">
                {formatCad(product.compareAtCad)}
              </span>
            )}
            <span className="text-xs font-medium text-[#64748B]">CAD</span>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Finish / Color */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-[#0B172A] mb-2.5">
              Colour: <span className="font-normal text-[#5B6472]">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded-sm transition-colors cursor-pointer ${
                    selectedColor === c.name
                      ? 'border-[#0B172A] bg-[#F1ECE4] font-medium text-[#0B172A]'
                      : 'border-[#E5DDD0] text-[#475569] hover:border-[#B89352]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-[#0B172A] mb-2">Size</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3.5 py-2 text-xs border rounded-sm cursor-pointer ${
                    selectedSize === size
                      ? 'border-[#0B172A] bg-[#0B172A] text-[#FAF9F6] font-medium'
                      : 'border-[#D4CDC0] text-[#0B172A] hover:border-[#0B172A]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#1E5631] mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{product.stockNote}</span>
          </div>

          {/* Quantity + Add to Cart + Wishlist */}
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center border border-[#D4CDC0] rounded-sm bg-[#FAF9F6]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-11 flex items-center justify-center hover:bg-[#EFEAE1] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="w-10 h-11 flex items-center justify-center hover:bg-[#EFEAE1] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                addToCart(product, selectedColor, selectedSize, quantity)
              }
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Save to wishlist"
              className={`w-11 h-11 flex items-center justify-center border rounded-sm transition-colors cursor-pointer ${
                wishlisted
                  ? 'bg-[#0B172A] text-[#D4B882] border-[#0B172A]'
                  : 'border-[#D4CDC0] text-[#0B172A] hover:border-[#0B172A]'
              }`}
            >
              <Heart className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Retail Guarantees */}
          <div className="pt-5 border-t border-[#EFEAE1] space-y-2.5 text-xs text-[#475569]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#B89352] shrink-0" />
              <span>Free Canadian standard shipping on orders $69+ CAD</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#B89352] shrink-0" />
              <span>{product.specs.warranty}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-[#B89352] shrink-0" />
              <span>Supported by our Woodbridge Authorized Repair Centre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <section className="mt-16 pt-12 border-t border-[#E5DDD0]">
        <h2 className="font-serif text-3xl font-semibold text-[#0B172A] mb-6">
          Technical Specifications
        </h2>
        <div className="bg-white border border-[#E5DDD0] rounded-sm overflow-hidden">
          <dl className="divide-y divide-[#EFEAE1]">
            {[
              ['Brand', product.brand],
              ['Model SKU', product.sku],
              ['Dimensions', product.specs.dimensions],
              ['Weight', product.specs.weight],
              ['Packing Capacity', product.specs.capacity],
              ['Material Construction', product.specs.material],
              ['Mobility / Straps', product.specs.wheelsOrStrap],
              ['Security & Locks', product.specs.lock],
              ['Manufacturer Warranty', product.specs.warranty],
            ].map(([label, val]) => (
              <div
                key={label}
                className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-2 text-sm"
              >
                <dt className="font-semibold text-[#0B172A]">{label}</dt>
                <dd className="sm:col-span-2 text-[#475569]">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#E5DDD0]">
          <h2 className="font-serif text-3xl font-semibold text-[#0B172A] mb-8">
            You May Also Consider
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { PRODUCTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { wishlistIds } = useStore();
  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  return (
    <div>
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-14">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-2">
            Saved Items
          </p>
          <h1 className="font-serif text-4xl font-semibold">Your Wishlist</h1>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-6 py-14">
        {savedProducts.length === 0 ? (
          <div className="bg-white border border-[#E5DDD0] rounded-sm p-14 text-center max-w-xl mx-auto">
            <Heart className="w-10 h-10 text-[#B89352] mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
              No saved items yet
            </h2>
            <p className="text-sm text-[#5B6472] mb-7">
              Tap the heart icon on any suitcase, backpack, or travel accessory to bookmark it for your next trip.
            </p>
            <Link
              to="/shop"
              className="inline-block px-7 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844]"
            >
              Browse Shop All
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

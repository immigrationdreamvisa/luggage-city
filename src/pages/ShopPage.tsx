import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { BRANDS, PRODUCTS, ProductCategory } from '../data/catalog';
import { ProductCard } from '../components/ProductCard';

export type ShopCollectionMode =
  | 'all'
  | 'luggage'
  | 'backpacks'
  | 'handbags'
  | 'accessories'
  | 'best-sellers'
  | 'sale';

interface ShopPageProps {
  mode: ShopCollectionMode;
}

const MODE_META: Record<
  ShopCollectionMode,
  { kicker: string; title: string; subtitle: string }
> = {
  all: {
    kicker: 'Complete Catalog',
    title: 'Shop All Travel Gear',
    subtitle:
      'Browse authentic carry-on spinners, checked luggage, backpacks, handbags, and Canadian travel essentials across 40+ trusted brands.',
  },
  luggage: {
    kicker: 'Suitcases & Sets',
    title: 'Carry-On, Checked & Luggage Sets',
    subtitle:
      'Hardside polycarbonate and ballistic nylon spinners engineered for effortless airport mobility and lasting durability.',
  },
  backpacks: {
    kicker: 'Packs & Commute',
    title: 'Travel & Everyday Backpacks',
    subtitle:
      'From Pacsafe anti-theft expedition packs to timeless JanSport daily companions with padded laptop protection.',
  },
  handbags: {
    kicker: 'Personal Items & Totes',
    title: 'Travel Handbags & Crossbodies',
    subtitle:
      'Structured totes with trolley pass-through sleeves and slash-resistant RFID crossbodies for effortless transit.',
  },
  accessories: {
    kicker: 'Travel Essentials',
    title: 'Travel Accessories & RFID Wallets',
    subtitle:
      'Dutch-crafted Secrid Cardprotectors, compression packing cubes, leather passport holders, and TSA-approved locks.',
  },
  'best-sellers': {
    kicker: 'Top Rated',
    title: 'Best Sellers',
    subtitle:
      'Our most-recommended suitcases, backpacks, and wallets chosen by frequent Canadian travellers.',
  },
  sale: {
    kicker: 'Seasonal Savings',
    title: 'Sale & Special Offers',
    subtitle:
      'Limited-time Canadian pricing on hardside spinners, coordinated luggage sets, and anti-theft travel gear.',
  },
};

const ALL_CATEGORIES: ProductCategory[] = [
  'Carry-On Luggage',
  'Checked Luggage',
  'Luggage Sets',
  'Backpacks',
  'Handbags',
  'Travel Accessories',
];

export function ShopPage({ mode }: ShopPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get('brand') || 'All'
  );
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating'
  >('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
    setSelectedBrand(searchParams.get('brand') || 'All');
  }, [mode, searchParams]);

  const baseProducts = useMemo(() => {
    switch (mode) {
      case 'luggage':
        return PRODUCTS.filter((p) => p.parentGroup === 'luggage');
      case 'backpacks':
        return PRODUCTS.filter((p) => p.parentGroup === 'backpacks');
      case 'handbags':
        return PRODUCTS.filter((p) => p.parentGroup === 'handbags');
      case 'accessories':
        return PRODUCTS.filter((p) => p.parentGroup === 'accessories');
      case 'best-sellers':
        return PRODUCTS.filter((p) => p.isBestSeller);
      case 'sale':
        return PRODUCTS.filter((p) => p.isOnSale || Boolean(p.compareAtCad));
      default:
        return PRODUCTS;
    }
  }, [mode]);

  const availableCategories = useMemo(() => {
    const present = new Set(baseProducts.map((p) => p.category));
    return ALL_CATEGORIES.filter((c) => present.has(c));
  }, [baseProducts]);

  const availableBrands = useMemo(() => {
    const present = new Set(baseProducts.map((p) => p.brand));
    return BRANDS.map((b) => b.name).filter((name) => present.has(name));
  }, [baseProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = baseProducts.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (p.priceCad > maxPrice) return false;
      if (
        q &&
        !(
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.priceCad - b.priceCad);
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.priceCad - a.priceCad);
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [baseProducts, selectedCategory, selectedBrand, maxPrice, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(1500);
    setSortBy('featured');
    setSearchParams({});
  };

  const meta = MODE_META[mode];

  return (
    <div>
      {/* Dedicated Page Header */}
      <section className="bg-[#0B172A] text-[#FAF9F6] border-b border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-14 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D4B882] mb-2">
            {meta.kicker}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight mb-3">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl leading-relaxed">
            {meta.subtitle}
          </p>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-6 py-10">
        {/* Top Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E5DDD0]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white border border-[#D4CDC0] rounded-sm text-[#0B172A] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <span className="text-sm text-[#5B6472] tabular-nums">
              Showing <strong className="text-[#0B172A]">{filteredProducts.length}</strong> of{' '}
              {baseProducts.length} items
            </span>
            {(selectedCategory !== 'All' ||
              selectedBrand !== 'All' ||
              searchQuery.trim() !== '' ||
              maxPrice < 1500) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#B89352] hover:text-[#0B172A] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B93A1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full sm:w-60 pl-9 pr-3 py-2 text-xs bg-white border border-[#D4CDC0] rounded-sm text-[#0B172A] focus:outline-none focus:border-[#0B172A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-[#5B6472] whitespace-nowrap">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 text-xs bg-white border border-[#D4CDC0] rounded-sm text-[#0B172A] focus:outline-none focus:border-[#0B172A]"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
          {/* Sidebar Filters */}
          <aside
            className={`${
              filtersOpen ? 'block' : 'hidden'
            } lg:block bg-white border border-[#E5DDD0] rounded-sm p-6 space-y-7`}
          >
            {availableCategories.length > 1 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0B172A] mb-3">
                  Category
                </h2>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full text-left px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${
                      selectedCategory === 'All'
                        ? 'bg-[#0B172A] text-[#FAF9F6] font-medium'
                        : 'text-[#334155] hover:bg-[#F1ECE4]'
                    }`}
                  >
                    All Categories
                  </button>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#0B172A] text-[#FAF9F6] font-medium'
                          : 'text-[#334155] hover:bg-[#F1ECE4]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0B172A] mb-3">
                Brand
              </h2>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('All')}
                  className={`w-full text-left px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${
                    selectedBrand === 'All'
                      ? 'bg-[#0B172A] text-[#FAF9F6] font-medium'
                      : 'text-[#334155] hover:bg-[#F1ECE4]'
                  }`}
                >
                  All Brands
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-2.5 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${
                      selectedBrand === brand
                        ? 'bg-[#0B172A] text-[#FAF9F6] font-medium'
                        : 'text-[#334155] hover:bg-[#F1ECE4]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0B172A]">
                  Max Price (CAD)
                </h2>
                <span className="text-xs font-semibold text-[#B89352] tabular-nums">
                  ${maxPrice}
                </span>
              </div>
              <input
                type="range"
                min={75}
                max={1500}
                step={25}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0B172A] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#64748B] tabular-nums mt-1">
                <span>$75</span>
                <span>$750</span>
                <span>$1,500</span>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#E5DDD0] rounded-sm p-12 text-center">
                <h3 className="font-serif text-2xl font-semibold text-[#0B172A] mb-2">
                  No matching travel gear found
                </h3>
                <p className="text-sm text-[#5B6472] mb-6">
                  Try widening your maximum price or clearing your brand and search filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2.5 text-xs font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

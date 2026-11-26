import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  FileCheck2,
  Heart,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { CartDrawer } from './CartDrawer';
import { QuickViewModal } from './QuickViewModal';
import { SearchOverlay } from './SearchOverlay';

const SHOP_NAV = [
  { label: 'Home', to: '/' },
  { label: 'Shop All', to: '/shop' },
  { label: 'Luggage', to: '/luggage' },
  { label: 'Backpacks', to: '/backpacks' },
  { label: 'Handbags', to: '/handbags' },
  { label: 'Travel Accessories', to: '/travel-accessories' },
  { label: 'Brands', to: '/brands' },
  { label: 'Best Sellers', to: '/best-sellers' },
  { label: 'Sale & Offers', to: '/sale' },
];

const HEADER_NAV = [
  { label: 'Repairs & Warranty', to: '/repairs-warranty' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Careers', to: '/careers' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    cartCount,
    wishlistIds,
    setCartOpen,
    setSearchOpen,
    toastMessage,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubStatus, setFooterSubStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, location.search]);

  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail.trim()) return;
    setFooterSubStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: footerEmail.trim() }),
      });
      if (!res.ok) throw new Error('Invalid email');
      setFooterSubStatus('done');
      setFooterEmail('');
    } catch {
      setFooterSubStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#0B172A]">
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5DDD0] shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="xl:hidden w-10 h-10 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" aria-label="Luggage City Home" className="flex items-center">
              <BrandLogo />
            </Link>
          </div>

          {/* Zone 2: Primary Storefront Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-6 text-[14px] font-medium text-[#2A3445]"
          >
            {SHOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1.5 border-b-2 text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#0B172A] border-[#B89352]'
                      : 'border-transparent text-[#334155] hover:text-[#0B172A] hover:border-[#D4B882]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Compact tablet nav dropdown for lg screens before xl */}
          <div className="hidden lg:flex xl:hidden items-center gap-5 text-[14px] font-medium text-[#2A3445]">
            <NavLink to="/shop" className="whitespace-nowrap hover:text-[#0B172A]">
              Shop All
            </NavLink>
            <NavLink to="/luggage" className="whitespace-nowrap hover:text-[#0B172A]">
              Luggage
            </NavLink>
            <NavLink to="/backpacks" className="whitespace-nowrap hover:text-[#0B172A]">
              Backpacks
            </NavLink>
            <NavLink to="/brands" className="whitespace-nowrap hover:text-[#0B172A]">
              Brands
            </NavLink>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="inline-flex items-center gap-1 whitespace-nowrap hover:text-[#0B172A] cursor-pointer"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white border border-[#E5DDD0] rounded-sm shadow-lg py-2 z-50">
                  {SHOP_NAV.filter(
                    (i) => !['/shop', '/luggage', '/backpacks', '/brands'].includes(i.to)
                  ).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 text-xs text-[#2A3445] hover:bg-[#F1ECE4] hover:text-[#0B172A]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone 3: Interactive Utility Controls (Search, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="w-10 h-10 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlistIds.length} items)`}
              className="relative w-10 h-10 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#B89352] text-white text-[10px] font-semibold tabular-nums">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag (${cartCount} items)`}
              className="relative w-10 h-10 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#0B172A] text-[#FAF9F6] text-[10px] font-semibold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0B172A]/60 backdrop-blur-[2px] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-[#FAF9F6] h-full flex flex-col border-r border-[#E5DDD0] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#E5DDD0]">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-6">
              <div>
                <div className="text-[11px] font-semibold tracking-wider text-[#B89352] mb-2">
                  Shop Collections
                </div>
                <nav className="flex flex-col">
                  {SHOP_NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="py-2.5 text-sm font-medium text-[#0B172A] border-b border-[#EFEAE1] hover:text-[#B89352]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-wider text-[#B89352] mb-2">
                  Services & Careers
                </div>
                <nav className="flex flex-col">
                  {HEADER_NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="py-2.5 text-sm font-medium text-[#0B172A] border-b border-[#EFEAE1] hover:text-[#B89352]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Premium Multi-Column Footer */}
      <footer className="bg-[#0B172A] text-[#E5DDD0] border-t border-[#1E3150]">
        <div className="max-w-[1360px] mx-auto px-6 py-16">
          {/* Top Recruitment & Offer Verification Strip inside Footer */}
          <div className="mb-12 pb-10 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-medium text-[#D4B882] tracking-wide mb-1">
                Careers & Candidate Services
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF9F6]">
                Building Canada's Finest Travel Retail Experience
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/careers"
                className="px-5 py-2.5 text-xs font-medium bg-[#FAF9F6] text-[#0B172A] rounded-sm hover:bg-[#E5DDD0] transition-colors whitespace-nowrap"
              >
                Explore Open Careers
              </Link>
              <Link
                to="/check-offer-letter"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium border border-[#B89352] text-[#D4B882] rounded-sm hover:bg-[#B89352] hover:text-[#0B172A] transition-colors whitespace-nowrap"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Check Your Offer Letter</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Column 1: Brand & Company */}
            <div className="lg:col-span-2">
              <BrandLogo variant="light" />
              <p className="mt-4 text-sm text-[#CBD5E1] leading-relaxed max-w-md">
                Flagship retail brand of the K. Jamson Group — carrying 40+ leading global luggage and travel brands with heritage rooted in leather craftsmanship since 1930 and Canada's premier travel superstore since 1999.
              </p>
              <div className="mt-5 space-y-2 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4B882] shrink-0 mt-0.5" />
                  <span>
                    Flagship & Repair Centre: Unit 201, 200 Windflower Gate, Woodbridge, ON L4L 9L3
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4B882] shrink-0 mt-0.5" />
                  <span>Promenade Store: 1 Promenade Circle, Thornhill, ON L4J 4P8</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#D4B882] shrink-0" />
                  <span>+1 (905) 851-2001 ext. 29 · Toll-Free: 1-833-662-7233</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#D4B882] shrink-0" />
                  <span>sales@luggagecity.ca · service@luggagecity.ca</span>
                </div>
              </div>
            </div>

            {/* Column 2: Shop Categories */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-[#D4B882] uppercase mb-4">
                Shop Categories
              </h3>
              <ul className="space-y-2.5 text-sm text-[#CBD5E1]">
                <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/luggage" className="hover:text-white transition-colors">Carry-On & Checked Luggage</Link></li>
                <li><Link to="/backpacks" className="hover:text-white transition-colors">Travel & Everyday Backpacks</Link></li>
                <li><Link to="/handbags" className="hover:text-white transition-colors">Handbags & Travel Totes</Link></li>
                <li><Link to="/travel-accessories" className="hover:text-white transition-colors">Travel Accessories & Secrid</Link></li>
                <li><Link to="/brands" className="hover:text-white transition-colors">All Brands</Link></li>
                <li><Link to="/best-sellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link to="/sale" className="hover:text-white transition-colors">Sale & Seasonal Offers</Link></li>
              </ul>
            </div>

            {/* Column 3: Customer Support & Policies */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-[#D4B882] uppercase mb-4">
                Support & Services
              </h3>
              <ul className="space-y-2.5 text-sm text-[#CBD5E1]">
                <li><Link to="/repairs-warranty" className="hover:text-white transition-colors">Repairs & Warranty</Link></li>
                <li><Link to="/shipping-delivery" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
                <li><Link to="/returns-exchanges" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Luggage City</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors font-medium text-[#FAF9F6]">Careers at Luggage City</Link></li>
                <li><Link to="/check-offer-letter" className="hover:text-white transition-colors font-medium text-[#D4B882]">Check Your Offer Letter</Link></li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Social */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-[#D4B882] uppercase mb-4">
                Stay Informed
              </h3>
              <p className="text-sm text-[#CBD5E1] mb-4 leading-relaxed">
                Receive seasonal luggage offers, new Samsonite and Briggs & Riley arrivals, and travel care tips.
              </p>
              <form onSubmit={handleFooterNewsletter} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#162844] border border-white/15 rounded-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4B882]"
                />
                <button
                  type="submit"
                  disabled={footerSubStatus === 'loading'}
                  className="w-full py-2.5 px-4 text-xs font-semibold tracking-wide bg-[#B89352] text-[#0B172A] rounded-sm hover:bg-[#D4B882] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {footerSubStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {footerSubStatus === 'done' && (
                <p className="mt-2 text-xs text-[#D4B882]">
                  Thank you for subscribing to Luggage City updates.
                </p>
              )}
              {footerSubStatus === 'error' && (
                <p className="mt-2 text-xs text-red-300">
                  Please enter a valid email address.
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-xs text-[#94A3B8] mb-2">Connect With Us</div>
                <div className="flex items-center gap-4 text-xs font-medium text-[#E5DDD0]">
                  <a href="https://www.instagram.com/luggagecityca/" target="_blank" rel="noreferrer" className="hover:text-[#D4B882]">Instagram</a>
                  <a href="https://www.facebook.com/luggagecity/" target="_blank" rel="noreferrer" className="hover:text-[#D4B882]">Facebook</a>
                  <a href="https://www.linkedin.com/company/luggage-city/" target="_blank" rel="noreferrer" className="hover:text-[#D4B882]">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div>
              © {new Date().getFullYear()} Luggage City (K. Jamson Group). All rights reserved. Prices in Canadian Dollars (CAD).
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Overlays */}
      <CartDrawer />
      <SearchOverlay />
      <QuickViewModal />

      {/* Subtle Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#0B172A] text-[#FAF9F6] border border-[#B89352]/40 px-5 py-3 rounded-sm shadow-xl text-sm font-medium"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

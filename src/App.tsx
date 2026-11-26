import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { BrandsPage } from './pages/BrandsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { RepairsWarrantyPage } from './pages/RepairsWarrantyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import {
  FaqsPage,
  PrivacyPolicyPage,
  ReturnsExchangesPage,
  ShippingDeliveryPage,
  TermsConditionsPage,
} from './pages/SupportPages';
import { CareersPage } from './pages/CareersPage';
import { OfferLetterPortalPage } from './pages/OfferLetterPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B89352] mb-2">
        404 · Page Not Found
      </p>
      <h1 className="font-serif text-4xl font-semibold text-[#0B172A] mb-3">
        This Destination Could Not Be Found
      </h1>
      <p className="text-sm text-[#5B6472] mb-8">
        Return to our homepage or browse our luggage and travel collections.
      </p>
      <Link
        to="/"
        className="inline-block px-7 py-3 text-sm font-semibold bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844]"
      >
        Return Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage mode="all" />} />
            <Route path="/luggage" element={<ShopPage mode="luggage" />} />
            <Route path="/backpacks" element={<ShopPage mode="backpacks" />} />
            <Route path="/handbags" element={<ShopPage mode="handbags" />} />
            <Route path="/travel-accessories" element={<ShopPage mode="accessories" />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/best-sellers" element={<ShopPage mode="best-sellers" />} />
            <Route path="/sale" element={<ShopPage mode="sale" />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/repairs-warranty" element={<RepairsWarrantyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shipping-delivery" element={<ShippingDeliveryPage />} />
            <Route path="/returns-exchanges" element={<ReturnsExchangesPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/check-offer-letter" element={<OfferLetterPortalPage />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </StoreProvider>
    </BrowserRouter>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCad } from '../data/catalog';
import { SafeImage } from '../components/SafeImage';

const PROVINCES = [
  { code: 'ON', name: 'Ontario (13% HST)', rate: 0.13 },
  { code: 'BC', name: 'British Columbia (12% GST+PST)', rate: 0.12 },
  { code: 'AB', name: 'Alberta (5% GST)', rate: 0.05 },
  { code: 'QC', name: 'Quebec (14.975% GST+QST)', rate: 0.14975 },
  { code: 'MB', name: 'Manitoba (12% GST+PST)', rate: 0.12 },
  { code: 'SK', name: 'Saskatchewan (11% GST+PST)', rate: 0.11 },
  { code: 'NS', name: 'Nova Scotia (15% HST)', rate: 0.15 },
  { code: 'NB', name: 'New Brunswick (15% HST)', rate: 0.15 },
  { code: 'NL', name: 'Newfoundland & Labrador (15% HST)', rate: 0.15 },
  { code: 'PE', name: 'Prince Edward Island (15% HST)', rate: 0.15 },
];

function PayPalLogo() {
  return (
    <svg className="h-5 w-auto" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.2 3.8H4.4C3.8 3.8 3.3 4.2 3.2 4.8L0.1 24.3C0 24.8 0.4 25.2 0.9 25.2H4.6C5.1 25.2 5.6 24.8 5.7 24.2L6.8 17.1C6.9 16.5 7.4 16.1 8 16.1H10.7C15.8 16.1 19.3 13.5 20.1 8.5C20.5 6.4 19.9 4.7 18.3 3.9C16.8 3.8 14.5 3.8 12.2 3.8Z" fill="#003087"/>
      <path d="M21.3 8.3C20.5 13.3 17 15.9 11.9 15.9H9.2C8.6 15.9 8.1 16.3 8 16.9L6.5 26.2C6.4 26.7 6.8 27.1 7.3 27.1H10.6C11.1 27.1 11.6 26.7 11.7 26.1L12.5 20.8C12.6 20.2 13.1 19.8 13.7 19.8H15.6C20.2 19.8 23.3 17.5 24 13C24.5 9.7 23.2 8.3 21.3 8.3Z" fill="#0079C1"/>
      <path d="M12.2 3.8H4.4C3.8 3.8 3.3 4.2 3.2 4.8L0.1 24.3C0 24.8 0.4 25.2 0.9 25.2H4.6C5.1 25.2 5.6 24.8 5.7 24.2L6.8 17.1C6.9 16.5 7.4 16.1 8 16.1H10.7C15.8 16.1 19.3 13.5 20.1 8.5C20.5 6.4 19.9 4.7 18.3 3.9C16.8 3.8 14.5 3.8 12.2 3.8Z" fill="#00457C"/>
      <text x="30" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="18" fill="#003087">Pay</text>
      <text x="63" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="18" fill="#0079C1">Pal</text>
    </svg>
  );
}

export function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    province: 'ON',
    postalCode: '',
  });

  // Payment method selection: ONLY 'card' or 'paypal'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [paypalEmail, setPaypalEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    subtotalCad: number;
    shippingCad: number;
    taxCad: number;
    totalCad: number;
    status: string;
    paymentMethod: string;
    paymentDetails: string;
  } | null>(null);

  const selectedProv = PROVINCES.find((p) => p.code === form.province) || PROVINCES[0];
  const shipping = cartSubtotal >= 69 || cartSubtotal === 0 ? 0 : 14.95;
  const tax = Number(((cartSubtotal + shipping) * selectedProv.rate).toFixed(2));
  const total = Number((cartSubtotal + shipping + tax).toFixed(2));

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardData((prev) => ({
      ...prev,
      cardNumber: parts ? parts.join(' ') : raw,
    }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: raw }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation for Card
    if (paymentMethod === 'card') {
      const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a valid credit or debit card number.');
        return;
      }
      if (cardData.expiry.length < 5) {
        setError('Please enter a valid expiration date (MM/YY).');
        return;
      }
      if (cardData.cvv.length < 3) {
        setError('Please enter a valid card security code (CVV/CVC).');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            priceCad: i.product.priceCad,
            quantity: i.quantity,
            color: i.selectedColor,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to place your order.');
        return;
      }

      const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
      const paymentSummary =
        paymentMethod === 'card'
          ? {
              paymentMethod: 'Credit / Debit Card',
              paymentDetails: `Card ending in •••• ${cleanNum.slice(-4) || '4242'}`,
            }
          : {
              paymentMethod: 'PayPal',
              paymentDetails: `PayPal account (${paypalEmail.trim() || form.customerEmail.trim() || 'Verified'})`,
            };

      setConfirmation({
        ...data,
        ...paymentSummary,
      });
      clearCart();
    } catch {
      setError('A network error occurred while submitting your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white border border-[#E5DDD0] rounded-sm p-8 sm:p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#1E5631] mx-auto mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B89352] mb-2">
            Order Confirmation
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B172A] mb-2">
            Thank You for Your Order
          </h1>
          <p className="text-sm text-[#5B6472] mb-6">
            Order <span className="font-mono font-semibold text-[#0B172A]">{confirmation.orderNumber}</span> — {confirmation.status}
          </p>

          <div className="bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm p-5 text-left text-sm space-y-2.5 mb-8 tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#5B6472]">Subtotal</span>
              <span>{formatCad(confirmation.subtotalCad)} CAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5B6472]">Canadian Shipping</span>
              <span>{confirmation.shippingCad === 0 ? 'Free' : `${formatCad(confirmation.shippingCad)} CAD`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5B6472]">Estimated Taxes</span>
              <span>{formatCad(confirmation.taxCad)} CAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5B6472]">Payment Method</span>
              <span className="font-medium text-[#0B172A]">{confirmation.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs text-[#64748B]">
              <span>Payment Details</span>
              <span>{confirmation.paymentDetails}</span>
            </div>
            <div className="flex justify-between pt-2.5 border-t border-[#E5DDD0] font-semibold text-[#0B172A] text-base">
              <span>Total Paid</span>
              <span>{formatCad(confirmation.totalCad)} CAD</span>
            </div>
          </div>

          <Link
            to="/shop"
            className="inline-block px-7 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <ShoppingBag className="w-10 h-10 text-[#B89352] mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-serif text-3xl font-semibold text-[#0B172A] mb-3">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#5B6472] mb-7">
          Add luggage or travel accessories to your bag before checking out.
        </p>
        <Link
          to="/shop"
          className="inline-block px-7 py-3 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[#B89352] mb-1">
          Canadian Checkout
        </p>
        <h1 className="font-serif text-4xl font-semibold text-[#0B172A]">
          Complete Your Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-sm p-7 sm:p-8 space-y-7"
        >
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
              {error}
            </div>
          )}

          {/* Section 1: Shipping Information */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
              1. Shipping & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="jane.smith@example.ca"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="(905) 555-0192"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  placeholder="123 Bay Street, Suite 400"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Toronto"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Province / Territory *
                </label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                >
                  {PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value.toUpperCase() })}
                  placeholder="M5J 2R8"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF9F6] border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method (Only Card & PayPal) */}
          <div className="pt-6 border-t border-[#E5DDD0] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
                2. Payment Method
              </h2>
              <span className="text-xs text-[#64748B]">Only Card & PayPal</span>
            </div>

            {/* Selector: Card vs PayPal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-sm text-left flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-[#0B172A] bg-[#FAF9F6] shadow-sm ring-1 ring-[#0B172A]'
                    : 'border-[#D4CDC0] bg-white hover:border-[#8B93A1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[#0B172A] text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-[#D4B882]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0B172A]">
                      Credit / Debit Card
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Visa, Mastercard, Amex
                    </div>
                  </div>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-[#0B172A]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {paymentMethod === 'card' && (
                    <span className="w-2 h-2 rounded-full bg-[#0B172A]" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border rounded-sm text-left flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === 'paypal'
                    ? 'border-[#003087] bg-[#F4F8FC] shadow-sm ring-1 ring-[#003087]'
                    : 'border-[#D4CDC0] bg-white hover:border-[#8B93A1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[#003087] text-white flex items-center justify-center shrink-0">
                    <span className="font-serif font-black text-sm italic tracking-tighter">P</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#003087] flex items-center gap-1.5">
                      <PayPalLogo />
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Fast & Secure PayPal Checkout
                    </div>
                  </div>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'paypal' ? 'border-[#003087]' : 'border-[#CBD5E1]'
                  }`}
                >
                  {paymentMethod === 'paypal' && (
                    <span className="w-2 h-2 rounded-full bg-[#003087]" />
                  )}
                </span>
              </button>
            </div>

            {/* Card Inputs Form */}
            {paymentMethod === 'card' && (
              <div className="bg-[#FAF9F6] border border-[#E5DDD0] rounded-sm p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD0]">
                  <span className="text-xs font-semibold text-[#0B172A] tracking-wide uppercase">
                    Cardholder Details
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-[#475569]">
                    <span className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded">VISA</span>
                    <span className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded">MC</span>
                    <span className="px-1.5 py-0.5 bg-white border border-[#CBD5E1] rounded">AMEX</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    required={paymentMethod === 'card'}
                    value={cardData.cardholderName}
                    onChange={(e) =>
                      setCardData({ ...cardData, cardholderName: e.target.value })
                    }
                    placeholder="Jane Smith"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    Card Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={paymentMethod === 'card'}
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4500 •••• •••• 1234"
                      maxLength={19}
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm font-mono bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                    />
                    <CreditCard className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'card'}
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM / YY"
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                      Security Code (CVV) *
                    </label>
                    <input
                      type="password"
                      required={paymentMethod === 'card'}
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#0B172A]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-[#64748B]">
                  <Lock className="w-3.5 h-3.5 text-[#B89352] shrink-0" />
                  <span>256-bit SSL encrypted. Card numbers are processed securely without being stored.</span>
                </div>
              </div>
            )}

            {/* PayPal View */}
            {paymentMethod === 'paypal' && (
              <div className="bg-[#F4F8FC] border border-[#CBD5E1] rounded-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <PayPalLogo />
                  <span className="text-xs font-semibold text-[#003087]">
                    Official PayPal Express Checkout
                  </span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed">
                  You will complete this purchase through PayPal. You can pay with your PayPal account balance, linked bank account, or any major credit/debit card.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#0B172A] mb-1.5">
                    PayPal Account Email (optional)
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder={form.customerEmail || 'your-paypal@example.ca'}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4CDC0] rounded-sm focus:outline-none focus:border-[#003087]"
                  />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#003087] font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0079C1] shrink-0" />
                  <span>Eligible for PayPal Buyer Protection on Canadian orders.</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EFEAE1] flex items-center gap-2 text-xs text-[#5B6472]">
            <Lock className="w-4 h-4 text-[#B89352]" />
            <span>
              Orders are confirmed immediately for dispatch from our Woodbridge, ON distribution centre.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 px-6 text-sm font-semibold rounded-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
              paymentMethod === 'paypal'
                ? 'bg-[#0070BA] text-white hover:bg-[#003087]'
                : 'bg-[#0B172A] text-[#FAF9F6] hover:bg-[#162844]'
            }`}
          >
            {submitting ? (
              'Processing Order...'
            ) : paymentMethod === 'paypal' ? (
              <>
                <span>Pay with PayPal ·</span>
                <span>{formatCad(total)} CAD</span>
              </>
            ) : (
              <>
                <span>Confirm & Pay with Card ·</span>
                <span>{formatCad(total)} CAD</span>
              </>
            )}
          </button>
        </form>

        {/* Order Summary */}
        <aside className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-sm p-7">
          <h2 className="font-serif text-2xl font-semibold text-[#0B172A] mb-5">
            Order Summary
          </h2>

          <ul className="divide-y divide-[#EFEAE1] mb-6">
            {cart.map((item) => (
              <li
                key={`${item.product.id}-${item.selectedColor}`}
                className="py-3.5 flex items-center gap-3.5"
              >
                <div className="w-16 h-14 bg-[#F1ECE4] rounded-sm overflow-hidden shrink-0">
                  <SafeImage
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#0B172A] truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {item.selectedColor} · Qty {item.quantity}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#0B172A] tabular-nums">
                  {formatCad(item.product.priceCad * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-2.5 text-sm border-t border-[#E5DDD0] pt-5 tabular-nums">
            <div className="flex justify-between text-[#475569]">
              <span>Subtotal</span>
              <span>{formatCad(cartSubtotal)} CAD</span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>Canadian Shipping</span>
              <span>{shipping === 0 ? 'Free' : `${formatCad(shipping)} CAD`}</span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>Estimated Tax ({selectedProv.code})</span>
              <span>{formatCad(tax)} CAD</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E5DDD0] text-base font-semibold text-[#0B172A]">
              <span>Total</span>
              <span>{formatCad(total)} CAD</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#EFEAE1] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Accepted Payment Methods</span>
              <span className="font-semibold text-[#0B172A]">Card & PayPal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                VISA
              </span>
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                MASTERCARD
              </span>
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                AMEX
              </span>
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider bg-[#F4F8FC] border border-[#0079C1] rounded text-[#003087]">
                PAYPAL
              </span>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#5B6472] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#B89352] shrink-0 mt-0.5" />
              <span>
                Backed by Luggage City's authentic brand guarantee and authorized Canadian warranty service.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

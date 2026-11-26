import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCad } from '../data/catalog';
import { SafeImage } from './SafeImage';

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
  } = useStore();

  if (!cartOpen) return null;

  const freeShippingThreshold = 69;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0B172A]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      onClick={() => setCartOpen(false)}
    >
      <div
        className="w-full max-w-md bg-[#FAF9F6] h-full flex flex-col border-l border-[#E5DDD0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5DDD0]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#0B172A]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B172A]">
              Your Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close shopping bag"
            className="w-9 h-9 flex items-center justify-center rounded-sm text-[#0B172A] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Canadian Shipping Meter */}
        <div className="px-6 py-3.5 bg-[#F1ECE4] border-b border-[#E5DDD0]">
          {remainingForFreeShipping === 0 && cart.length > 0 ? (
            <p className="text-xs font-medium text-[#1E5631]">
              Your order qualifies for complimentary Canadian standard shipping.
            </p>
          ) : (
            <p className="text-xs text-[#334155]">
              Add{' '}
              <span className="font-semibold text-[#0B172A] tabular-nums">
                {formatCad(remainingForFreeShipping)} CAD
              </span>{' '}
              more for free shipping across Canada.
            </p>
          )}
          <div className="mt-2 h-1.5 w-full bg-[#E2D9CB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B89352] transition-all duration-300"
              style={{
                width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#B89352] mb-4" strokeWidth={1.4} />
              <h3 className="font-serif text-xl font-semibold text-[#0B172A] mb-2">
                Your bag is currently empty
              </h3>
              <p className="text-sm text-[#5B6472] max-w-xs mb-6">
                Explore carry-on spinners, lifetime-guaranteed luggage, anti-theft backpacks, and travel essentials.
              </p>
              <Link
                to="/shop"
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors"
              >
                Explore Shop All
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5DDD0]">
              {cart.map((item) => (
                <li
                  key={`${item.product.id}-${item.selectedColor}`}
                  className="py-4 flex gap-4"
                >
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-[#F1ECE4] border border-[#E5DDD0]"
                  >
                    <SafeImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-medium text-[#B89352]">
                          {item.product.brand}
                        </div>
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-sm font-semibold text-[#0B172A] hover:text-[#B89352] leading-snug line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.product.id, item.selectedColor)
                        }
                        aria-label={`Remove ${item.product.name}`}
                        className="text-[#8B93A1] hover:text-[#9B2C2C] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#64748B] mt-1">
                      {item.selectedColor} · {item.selectedSize}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#D4CDC0] rounded-sm bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedColor,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#0B172A] hover:bg-[#F1ECE4] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedColor,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#0B172A] hover:bg-[#F1ECE4] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[#0B172A] tabular-nums">
                        {formatCad(item.product.priceCad * item.quantity)} CAD
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#E5DDD0] bg-white">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-[#5B6472]">Subtotal</span>
              <span className="text-base font-semibold text-[#0B172A] tabular-nums">
                {formatCad(cartSubtotal)} CAD
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Provincial taxes (GST/HST/PST) and shipping calculated at checkout.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="w-full text-center py-3 px-5 text-sm font-medium bg-[#0B172A] text-[#FAF9F6] rounded-sm hover:bg-[#162844] transition-colors"
              >
                Proceed to Checkout
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="w-full text-center py-2.5 px-5 text-xs font-medium text-[#0B172A] border border-[#D4CDC0] rounded-sm hover:bg-[#F1ECE4] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#E5DDD0] flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                <Lock className="w-3.5 h-3.5 text-[#B89352]" />
                <span>Secure Checkout with Card & PayPal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                  VISA
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                  MASTERCARD
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF9F6] border border-[#CBD5E1] rounded text-[#0B172A]">
                  AMEX
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F4F8FC] border border-[#0079C1] rounded text-[#003087]">
                  PAYPAL
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

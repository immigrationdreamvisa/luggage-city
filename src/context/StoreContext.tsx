import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../data/catalog';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface AdminSession {
  token: string;
  admin: {
    id?: number;
    email: string;
    fullName: string;
    role: 'super_admin' | 'hr_manager' | 'recruiter';
  };
}

interface StoreContextValue {
  cart: CartItem[];
  wishlistIds: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewProduct: Product | null;
  toastMessage: string | null;
  adminSession: AdminSession | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setAdminSession: (session: AdminSession | null) => void;
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, selectedColor: string, quantity: number) => void;
  removeFromCart: (productId: string, selectedColor: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  cartSubtotal: number;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_STORAGE_KEY = 'luggage_city_cart_v1';
const WISHLIST_STORAGE_KEY = 'luggage_city_wishlist_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin auth token is held strictly in React memory (never persisted in localStorage/sessionStorage)
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore quota errors
    }
  }, [wishlistIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const addToCart = (
    product: Product,
    color?: string,
    size?: string,
    quantity = 1
  ) => {
    const selectedColor = color || product.colors[0]?.name || 'Standard';
    const selectedSize = size || product.sizes[0] || 'Standard';
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(20, next[idx].quantity + quantity),
        };
        return next;
      }
      return [...prev, { product, quantity, selectedColor, selectedSize }];
    });
    setCartOpen(true);
    showToast(`Added ${product.name} to your bag`);
  };

  const updateCartQuantity = (
    productId: string,
    selectedColor: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity: Math.min(20, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, selectedColor: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === selectedColor)
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist');
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.priceCad * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlistIds,
        cartOpen,
        searchOpen,
        quickViewProduct,
        toastMessage,
        adminSession,
        setCartOpen,
        setSearchOpen,
        setQuickViewProduct,
        setAdminSession,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        cartSubtotal,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

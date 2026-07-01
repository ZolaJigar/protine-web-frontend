'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { getFromStorage, setInStorage, removeFromStorage } from '@/lib/functions';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  wishlist: [],
  notifications: [],
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'LOGOUT':
      removeFromStorage('accessToken');
      removeFromStorage('refreshToken');
      removeFromStorage('user');
      return { ...state, user: null, isAuthenticated: false, cart: [] };

    // Cart
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_TO_CART': {
      const existing = state.cart.find((i) => i.id === action.payload.id);
      const updatedCart = existing
        ? state.cart.map((i) => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.cart, { ...action.payload, quantity: 1 }];
      setInStorage('cart', updatedCart);
      return { ...state, cart: updatedCart };
    }
    case 'REMOVE_FROM_CART': {
      const updatedCart = state.cart.filter((i) => i.id !== action.payload);
      setInStorage('cart', updatedCart);
      return { ...state, cart: updatedCart };
    }
    case 'UPDATE_CART_ITEM': {
      const updatedCart = state.cart.map((i) =>
        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      );
      setInStorage('cart', updatedCart);
      return { ...state, cart: updatedCart };
    }
    case 'CLEAR_CART':
      setInStorage('cart', []);
      return { ...state, cart: [] };

    // Wishlist
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find((i) => i.id === action.payload.id);
      const updated = exists
        ? state.wishlist.filter((i) => i.id !== action.payload.id)
        : [...state.wishlist, action.payload];
      setInStorage('wishlist', updated);
      return { ...state, wishlist: updated };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const user = getFromStorage('user');
    if (user) dispatch({ type: 'SET_USER', payload: user });

    const cart = getFromStorage('cart');
    if (cart) dispatch({ type: 'SET_CART', payload: cart });

    const wishlist = getFromStorage('wishlist');
    if (wishlist) dispatch({ type: 'SET_WISHLIST', payload: wishlist });
  }, []);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, cartCount, cartTotal }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

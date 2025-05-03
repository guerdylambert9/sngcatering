import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.name === item.name);
      if (existingItem) {
        return prev.map((i) =>
          i.name === item.name
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (name, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeFromCart = (name) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Initialize sessionId from sessionStorage or generate new
  const [sessionId] = useState(() => {
    const storedId = sessionStorage.getItem('sessionId');
    if (storedId) return storedId;
    const newId = uuidv4();
    sessionStorage.setItem('sessionId', newId);
    return newId;
  });

  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('regular');

  // Add item to cart (called after backend confirmation)
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.dishId === item.dishId);
      if (existingItem) {
        return prev.map((i) =>
          i.dishId === item.dishId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  // Update cart items (used when fetching cart from backend)
  const updateQuantity = useCallback((newCart) => {
    setCart(newCart);
  }, []);

  // Remove item from cart (called after backend confirmation)
  const removeFromCart = useCallback((dishId) => {
    setCart((prev) => prev.filter((item) => item.dishId !== dishId));
  }, []);

  // Clear cart (called after backend confirmation)
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        orderType,
        setOrderType,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}









// import { createContext, useContext, useState } from 'react';
// import { v4 as uuidv4 } from 'uuid';

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   // Initialize sessionId from sessionStorage or generate new
//   const [sessionId] = useState(() => {
//     const storedId = sessionStorage.getItem('sessionId');
//     if (storedId) return storedId;
//     const newId = uuidv4();
//     sessionStorage.setItem('sessionId', newId);
//     return newId;
//   });

//   const [cart, setCart] = useState([]);
//   const [orderType, setOrderType] = useState('regular');

//   // Add item to cart (called after backend confirmation)
//   const addToCart = (item) => {
//     setCart((prev) => {
//       const existingItem = prev.find((i) => i.dishId === item.dishId);
//       if (existingItem) {
//         return prev.map((i) =>
//           i.dishId === item.dishId ? { ...i, quantity: i.quantity + item.quantity } : i
//         );
//       }
//       return [...prev, item];
//     });
//   };

//   // Update cart items (used when fetching cart from backend)
//   const updateQuantity = (newCart) => {
//     setCart(newCart);
//   };

//   // Remove item from cart (called after backend confirmation)
//   const removeFromCart = (dishId) => {
//     setCart((prev) => prev.filter((item) => item.dishId !== dishId));
//   };

//   // Clear cart (called after backend confirmation)
//   const clearCart = () => {
//     setCart([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         updateQuantity,
//         removeFromCart,
//         clearCart,
//         orderType,
//         setOrderType,
//         sessionId,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   return useContext(CartContext);
// }
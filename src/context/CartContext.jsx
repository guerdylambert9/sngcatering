import { createContext, useContext, useState } from 'react';
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
  const addToCart = (item) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.dishId === item.dishId);
      if (existingItem) {
        return prev.map((i) =>
          i.dishId === item.dishId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  // Update cart items (used when fetching cart from backend)
  const updateQuantity = (newCart) => {
    setCart(newCart);
  };

  // Remove item from cart (called after backend confirmation)
  const removeFromCart = (dishId) => {
    setCart((prev) => prev.filter((item) => item.dishId !== dishId));
  };

  // Clear cart (called after backend confirmation)
  const clearCart = () => {
    setCart([]);
  };

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









// import { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   const [cart, setCart] = useState(() => {
//     const savedCart = localStorage.getItem('cart');
//     return savedCart ? JSON.parse(savedCart) : [];
//   });
//   const [orderType, setOrderType] = useState(() => {
//     const savedOrderType = localStorage.getItem('orderType');
//     return savedOrderType ? savedOrderType : 'regular';
//   });

//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(cart));
//     localStorage.setItem('orderType', orderType);
//   }, [cart, orderType]);

//   const addToCart = (item) => {
//     setCart((prev) => {
//       const existingItem = prev.find((i) => i.name === item.name);
//       if (existingItem) {
//         return prev.map((i) =>
//           i.name === item.name
//             ? { ...i, quantity: i.quantity + item.quantity }
//             : i
//         );
//       }
//       return [...prev, item];
//     });
//   };

//   const updateQuantity = (name, quantity) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.name === name ? { ...item, quantity: Math.max(1, quantity) } : item
//       )
//     );
//   };

//   const removeFromCart = (name) => {
//     setCart((prev) => prev.filter((item) => item.name !== name));
//   };

//   const clearCart = () => {
//     setCart([]);
//     setOrderType('regular');
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
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   return useContext(CartContext);
// }









// import { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export function CartProvider({ children }) {
//   const [cart, setCart] = useState(() => {
//     const savedCart = localStorage.getItem('cart');
//     return savedCart ? JSON.parse(savedCart) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = (item) => {
//     setCart((prev) => {
//       const existingItem = prev.find((i) => i.name === item.name);
//       if (existingItem) {
//         return prev.map((i) =>
//           i.name === item.name
//             ? { ...i, quantity: i.quantity + item.quantity }
//             : i
//         );
//       }
//       return [...prev, item];
//     });
//   };

//   const updateQuantity = (name, quantity) => {
//     setCart((prev) =>
//       prev.map((item) =>
//         item.name === name ? { ...item, quantity: Math.max(1, quantity) } : item
//       )
//     );
//   };

//   const removeFromCart = (name) => {
//     setCart((prev) => prev.filter((item) => item.name !== name));
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   return useContext(CartContext);
// }

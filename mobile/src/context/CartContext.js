
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  const addToCart = (product, unit = 'ካርቶን', price = 2800) => {
    if (!product || !product.id) return;
    const key = `\({product.id}_\){unit}`;

    setCart((prev) => {
      const cur = prev[key]?.quantity || 0;
      return {
        ...prev,
        [key]: {
          productId: product.id,
          name: product.nameAm || product.nameOm || 'ምርት',
          unit,
          price: Number(price),
          quantity: cur + 1,
        },
      };
    });
  };

  const updateQuantity = (key, delta) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[key]) return prev;
      const next = copy[key].quantity + delta;
      if (next <= 0) {
        delete copy[key];
      } else {
        copy[key] = { ...copy[key], quantity: next };
      }
      return copy;
    });
  };

  const clearCart = () => setCart({});

  const totalCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    
      {children}
    
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      cart: {},
      addToCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalCount: 0,
      totalPrice: 0,
    };
  }
  return ctx;
}
// import React, { createContext, useContext, useState } from 'react';

// const CartContext = createContext(null);

// export function CartProvider({ children }) {
//   const [cart, setCart] = useState({});

//   const addToCart = (product, unit = 'ካርቶን', price = 2800) => {
//     if (!product || !product.id) return;
//     const key = `\({product.id}_\){unit}`;

//     setCart((prev) => {
//       const cur = prev[key]?.quantity || 0;
//       return {
//         ...prev,
//         [key]: {
//           productId: product.id,
//           name: product.nameAm || product.nameOm || 'ምርት',
//           unit,
//           price: Number(price),
//           quantity: cur + 1,
//         },
//       };
//     });
//   };

//   const updateQuantity = (key, delta) => {
//     setCart((prev) => {
//       const copy = { ...prev };
//       if (!copy[key]) return prev;
//       const next = copy[key].quantity + delta;
//       if (next <= 0) {
//         delete copy[key];
//       } else {
//         copy[key] = { ...copy[key], quantity: next };
//       }
//       return copy;
//     });
//   };

//   const clearCart = () => setCart({});

//   const totalCount = Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
//   const totalPrice = Object.values(cart).reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0);

//   return (
    
//       {children}
    
//   );
// }

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) {
//     return {
//       cart: {},
//       addToCart: () => {},
//       updateQuantity: () => {},
//       clearCart: () => {},
//       totalCount: 0,
//       totalPrice: 0,
//     };
//   }
//   return ctx;
// }
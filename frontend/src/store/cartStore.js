import { create } from 'zustand';
import { LEGAL_LIMITS } from '../utils/constants'; 

const cartFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const useCartStore = create((set, get) => ({
  cartItems: cartFromStorage,

  addToCart: (product, qty) => {
    const currentCart = get().cartItems;
    
    const currentTotalWeight = currentCart.reduce((total, item) => {
      return total + (item.weightInOunces * item.qty);
    }, 0);

    const additionalWeight = product.weightInOunces * qty;

    // Use the constant here instead of the hardcoded 3.0
    if (currentTotalWeight + additionalWeight > LEGAL_LIMITS.MAX_OUNCES_PER_ORDER) {
      alert(`⚠️ Legal Limit Reached! You cannot exceed ${LEGAL_LIMITS.MAX_OUNCES_PER_ORDER} ounces per order. Please adjust your cart.`);
      return; 
    }
    // 4. Check if the item is already in the cart
    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      // If it exists, just update the quantity
      set({
        cartItems: currentCart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        ),
      });
    } else {
      // If it's a new item, add it to the array
      set({ cartItems: [...currentCart, { ...product, qty }] });
    }
    localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
  },

  // Action: Remove an item entirely
  removeFromCart: (productId) => {
    set({
      cartItems: get().cartItems.filter((item) => item._id !== productId),
    });
    localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
  },
}));

export default useCartStore;
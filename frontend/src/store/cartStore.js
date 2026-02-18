import { create } from 'zustand';
import { LEGAL_LIMITS } from '../utils/constants'; 
import { toast } from 'react-toastify';

const cartFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? JSON.parse(localStorage.getItem('paymentMethod'))
  : 'Aeropay (ACH)'; // Defaulting to the compliant digital gateway

const useCartStore = create((set, get) => ({
  cartItems: cartFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,

  addToCart: (product, qty) => {
    const currentCart = get().cartItems;
    
    const currentTotalWeight = currentCart.reduce((total, item) => {
      return total + (item.weightInOunces * item.qty);
    }, 0);

    const additionalWeight = product.weightInOunces * qty;

    // Use the constant here instead of the hardcoded 3.0
    if (currentTotalWeight + additionalWeight > LEGAL_LIMITS.MAX_OUNCES_PER_ORDER) {
      // THE FIX: Swap alert for toast and return false so the UI knows it failed
      toast.warning(`Legal Limit Reached! Unfortunately you cannot exceed ${LEGAL_LIMITS.MAX_OUNCES_PER_ORDER} ounces per order.`);
      return false; 
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
    
    // THE FIX: Return true so the UI knows it successfully added the item
    return true; 
  },

  // Action: Remove an item entirely
  removeFromCart: (productId) => {
    set({
      cartItems: get().cartItems.filter((item) => item._id !== productId),
    });
    localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
  },

  saveShippingAddress: (data) => {
    set({ shippingAddress: data });
    localStorage.setItem('shippingAddress', JSON.stringify(data));
  },

  savePaymentMethod: (data) => {
    set({ paymentMethod: data });
    localStorage.setItem('paymentMethod', JSON.stringify(data));
  },

  clearCart: () => {
    const currentAddress = get().shippingAddress;
    
    // If they used the pickup placeholder, wipe it so the next order safely defaults to Delivery
    if (currentAddress?.address === 'In-Store Pickup') {
      set({ cartItems: [], shippingAddress: {} });
      localStorage.removeItem('shippingAddress');
    } else {
      // If it's a real delivery address, keep it safe in Zustand and LocalStorage for the pre-fill!
      set({ cartItems: [] });
    }
    
    // Always empty the cart items
    localStorage.removeItem('cartItems');
  },

  mergeCarts: (dbCartItems) => {
    const localCart = get().cartItems;
    let mergedCart = [...localCart];

    // Calculate current weight of the local anonymous cart
    let currentWeight = mergedCart.reduce((total, item) => total + (item.weightInOunces * item.qty), 0);

    dbCartItems.forEach((dbItem) => {
      const existingItem = mergedCart.find((item) => item._id === dbItem._id);

      if (existingItem) {
        // If the item is in both carts, take the highest quantity to prevent double-counting
        // (e.g., if they had 2 in DB, logged out, and added 2 anonymously, we keep it at 2, not 4)
        const newQty = Math.max(existingItem.qty, dbItem.qty);
        const weightDiff = (newQty - existingItem.qty) * dbItem.weightInOunces;

        // Only merge if it keeps them under the 3.0 oz state limit
        if (currentWeight + weightDiff <= LEGAL_LIMITS.MAX_OUNCES_PER_ORDER) {
          existingItem.qty = newQty;
          currentWeight += weightDiff;
        }
      } else {
        // It's a new item from their database history, add it if legal
        const itemWeight = dbItem.weightInOunces * dbItem.qty;
        if (currentWeight + itemWeight <= LEGAL_LIMITS.MAX_OUNCES_PER_ORDER) {
          mergedCart.push(dbItem);
          currentWeight += itemWeight;
        }
      }
    });

    // Save the newly merged cart to Zustand and LocalStorage
    set({ cartItems: mergedCart });
    localStorage.setItem('cartItems', JSON.stringify(mergedCart));

    return mergedCart; 
  },
}));

export default useCartStore;
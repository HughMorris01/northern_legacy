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
  : 'Aeropay (ACH)';

// --- LEGAL COMPLIANCE LIMITS ---
const FLOWER_CATEGORIES = ['Flower', 'Pre-Roll'];
const CONCENTRATE_CATEGORIES = ['Concentrate', 'Vape', 'Edible', 'Tincture'];
const LIMIT_FLOWER_OZ = 3.0; // NY Limit
const LIMIT_CONCENTRATE_G = 24.0; // NY Limit

// Helper to determine accurate concentrate weight in grams
const getConcentrateGrams = (item) => {
  if (item.concentrateGrams) return item.concentrateGrams; // If you ever add this field to DB
  if (item.weightInOunces > 0) return Number((item.weightInOunces * 28.3495).toFixed(2));
  if (item.category === 'Edible' || item.category === 'Tincture') return 1.0; // Safe default for 100mg edibles
  return 0;
};

const getFlowerOunces = (item) => {
  return item.weightInOunces || 0;
};

const useCartStore = create((set, get) => ({
  cartItems: cartFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,

  addToCart: (product, qty) => {
    const currentCart = get().cartItems;
    
    let currentFlowerWeight = 0;
    let currentConcentrateWeight = 0;

    currentCart.forEach(item => {
      if (FLOWER_CATEGORIES.includes(item.category)) {
        currentFlowerWeight += getFlowerOunces(item) * item.qty;
      } else if (CONCENTRATE_CATEGORIES.includes(item.category)) {
        currentConcentrateWeight += getConcentrateGrams(item) * item.qty;
      }
    });

    const isFlower = FLOWER_CATEGORIES.includes(product.category);
    const isConcentrate = CONCENTRATE_CATEGORIES.includes(product.category);

    const addedFlower = isFlower ? getFlowerOunces(product) * qty : 0;
    const addedConcentrate = isConcentrate ? getConcentrateGrams(product) * qty : 0;

    const limitFlower = LEGAL_LIMITS?.MAX_OUNCES_PER_ORDER || LIMIT_FLOWER_OZ;
    const limitConcentrate = LIMIT_CONCENTRATE_G;

    // Dual-Limit Checks
    if (currentFlowerWeight + addedFlower > limitFlower) {
      toast.warning(`Legal Limit Reached! You cannot exceed ${limitFlower} ounces of flower per order.`);
      return false; 
    }

    if (currentConcentrateWeight + addedConcentrate > limitConcentrate) {
      toast.warning(`Legal Limit Reached! You cannot exceed ${limitConcentrate}g of concentrates/edibles per order.`);
      return false; 
    }
    
    const existingItem = currentCart.find((item) => item._id === product._id);

    if (existingItem) {
      set({
        cartItems: currentCart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qty } : item
        ),
      });
    } else {
      set({ cartItems: [...currentCart, { ...product, qty }] });
    }
    localStorage.setItem('cartItems', JSON.stringify(get().cartItems));
    
    return true; 
  },

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
    if (currentAddress?.address === 'In-Store Pickup') {
      set({ cartItems: [], shippingAddress: {} });
      localStorage.removeItem('shippingAddress');
    } else {
      set({ cartItems: [] });
    }
    localStorage.removeItem('cartItems');
  },

  mergeCarts: (dbCartItems) => {
    const localCart = get().cartItems;
    let mergedCart = [...localCart];

    let currentFlowerWeight = mergedCart.reduce((total, item) => 
      FLOWER_CATEGORIES.includes(item.category) ? total + (getFlowerOunces(item) * item.qty) : total, 0);
    
    let currentConcentrateWeight = mergedCart.reduce((total, item) => 
      CONCENTRATE_CATEGORIES.includes(item.category) ? total + (getConcentrateGrams(item) * item.qty) : total, 0);

    const limitFlower = LEGAL_LIMITS?.MAX_OUNCES_PER_ORDER || LIMIT_FLOWER_OZ;
    const limitConcentrate = LIMIT_CONCENTRATE_G;

    dbCartItems.forEach((dbItem) => {
      const existingItem = mergedCart.find((item) => item._id === dbItem._id);
      const isFlower = FLOWER_CATEGORIES.includes(dbItem.category);
      const isConcentrate = CONCENTRATE_CATEGORIES.includes(dbItem.category);

      if (existingItem) {
        const newQty = Math.max(existingItem.qty, dbItem.qty);
        const qtyDiff = newQty - existingItem.qty;
        
        const diffFlower = isFlower ? getFlowerOunces(dbItem) * qtyDiff : 0;
        const diffConcentrate = isConcentrate ? getConcentrateGrams(dbItem) * qtyDiff : 0;

        if (currentFlowerWeight + diffFlower <= limitFlower && currentConcentrateWeight + diffConcentrate <= limitConcentrate) {
          existingItem.qty = newQty;
          currentFlowerWeight += diffFlower;
          currentConcentrateWeight += diffConcentrate;
        }
      } else {
        const itemFlower = isFlower ? getFlowerOunces(dbItem) * dbItem.qty : 0;
        const itemConcentrate = isConcentrate ? getConcentrateGrams(dbItem) * dbItem.qty : 0;

        if (currentFlowerWeight + itemFlower <= limitFlower && currentConcentrateWeight + itemConcentrate <= limitConcentrate) {
          mergedCart.push(dbItem);
          currentFlowerWeight += itemFlower;
          currentConcentrateWeight += itemConcentrate;
        }
      }
    });

    set({ cartItems: mergedCart });
    localStorage.setItem('cartItems', JSON.stringify(mergedCart));

    return mergedCart; 
  },
}));

export default useCartStore;
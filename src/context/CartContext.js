import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for the cart
const initialState = {
  items: [],
  itemCount: 0,
  total: 0
};

// Actions for the cart reducer
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

// Helper function to extract numeric price from price string
const extractPriceNumeric = (priceString) => {
  if (!priceString) return 0;
  
  // Handle different price formats
  let price = 0;
  
  // If it's already a number, use it directly
  if (typeof priceString === 'number') {
    price = priceString;
  } else {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanedString = priceString.toString().replace(/[^0-9.]/g, '');
    price = parseFloat(cleanedString);
  }
  
  // Ensure we have a valid number and it's positive
  return isNaN(price) ? 0 : Math.abs(price);
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { item, bookingInfo } = action.payload;
      
      // Extract date and time from bookingInfo
      const { date, time } = bookingInfo;
      
      // Format date to ISO string for consistent storage
      const formattedDate = date instanceof Date ? date.toISOString() : date;
      
      // Create a unique booking identifier that includes both date and time
      const bookingId = `${formattedDate}|${time}`;
      
      // Extract numeric price from price string and ensure it's positive
      const priceNumeric = Math.abs(extractPriceNumeric(item.price));
      
      // Check if item with same id and booking info already exists in cart
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.id === item.id && cartItem.bookingId === bookingId
      );
      
      let updatedItems;
      let newItemCount;
      
      if (existingItemIndex >= 0) {
        // If item exists, update quantity
        updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        newItemCount = state.itemCount + 1;
      } else {
        // If item doesn't exist, add it to cart
        const newItem = {
          ...item,
          date: formattedDate,
          time,
          bookingId,
          quantity: 1,
          priceNumeric
        };
        
        updatedItems = [...state.items, newItem];
        newItemCount = state.itemCount + 1;
      }
      
      // Recalculate total from scratch based on all items
      const newTotal = updatedItems.reduce((total, item) => {
        return total + (item.priceNumeric * item.quantity);
      }, 0);
      
      return {
        ...state,
        items: updatedItems,
        itemCount: newItemCount,
        total: newTotal
      };
    }
    
    case REMOVE_FROM_CART: {
      const { id, bookingId } = action.payload;
      
      // Find the item to remove
      const itemToRemove = state.items.find(
        item => item.id === id && item.bookingId === bookingId
      );
      
      if (!itemToRemove) return state;
      
      // Filter out the item
      const updatedItems = state.items.filter(
        item => !(item.id === id && item.bookingId === bookingId)
      );
      
      // Recalculate total from scratch
      const newTotal = updatedItems.reduce((total, item) => {
        return total + (item.priceNumeric * item.quantity);
      }, 0);
      
      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount - itemToRemove.quantity,
        total: newTotal
      };
    }
    
    case UPDATE_QUANTITY: {
      const { id, bookingId, quantity } = action.payload;
      
      // Find the item to update
      const itemIndex = state.items.findIndex(
        item => item.id === id && item.bookingId === bookingId
      );
      
      if (itemIndex === -1) return state;
      
      const item = state.items[itemIndex];
      const quantityDifference = quantity - item.quantity;
      
      // Create new array with updated item
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = {
        ...item,
        quantity
      };
      
      // Recalculate total from scratch
      const newTotal = updatedItems.reduce((total, item) => {
        return total + (item.priceNumeric * item.quantity);
      }, 0);
      
      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount + quantityDifference,
        total: newTotal
      };
    }
    
    case CLEAR_CART: {
      return initialState;
    }
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  // Load cart from localStorage on initial render
  const loadCartFromStorage = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : initialState;
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return initialState;
    }
  };
  
  const [cart, dispatch] = useReducer(cartReducer, loadCartFromStorage());
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item, bookingInfo) => {
    dispatch({
      type: ADD_TO_CART,
      payload: { item, bookingInfo }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id, bookingId) => {
    dispatch({
      type: REMOVE_FROM_CART,
      payload: { id, bookingId }
    });
  };
  
  // Update item quantity
  const updateQuantity = (id, bookingId, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id, bookingId, quantity }
    });
  };
  
  // Clear the entire cart
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };
  
  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

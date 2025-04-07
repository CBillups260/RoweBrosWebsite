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
  const match = priceString.match(/\$?(\d+)/);
  return match ? parseFloat(match[1]) : 0;
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { item, date } = action.payload;
      
      // Extract numeric price from price string (e.g., "$150/day" -> 150)
      const priceNumeric = extractPriceNumeric(item.price);
      
      // Check if item with same id and date already exists in cart
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.id === item.id && cartItem.date === date
      );
      
      if (existingItemIndex >= 0) {
        // If item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        const newTotal = state.total + priceNumeric;
        
        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + 1,
          total: newTotal
        };
      } else {
        // If item doesn't exist, add it to cart
        const newItem = {
          ...item,
          date,
          quantity: 1,
          priceNumeric
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
          itemCount: state.itemCount + 1,
          total: state.total + priceNumeric
        };
      }
    }
    
    case REMOVE_FROM_CART: {
      const { id, date } = action.payload;
      
      // Find the item to remove
      const itemToRemove = state.items.find(
        item => item.id === id && item.date === date
      );
      
      if (!itemToRemove) return state;
      
      // Calculate the amount to subtract from total
      const amountToSubtract = itemToRemove.priceNumeric * itemToRemove.quantity;
      
      // Filter out the item
      const updatedItems = state.items.filter(
        item => !(item.id === id && item.date === date)
      );
      
      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount - itemToRemove.quantity,
        total: state.total - amountToSubtract
      };
    }
    
    case UPDATE_QUANTITY: {
      const { id, date, quantity } = action.payload;
      
      // Find the item to update
      const itemIndex = state.items.findIndex(
        item => item.id === id && item.date === date
      );
      
      if (itemIndex === -1) return state;
      
      const item = state.items[itemIndex];
      const quantityDifference = quantity - item.quantity;
      const priceDifference = item.priceNumeric * quantityDifference;
      
      // Create new array with updated item
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = {
        ...item,
        quantity
      };
      
      return {
        ...state,
        items: updatedItems,
        itemCount: state.itemCount + quantityDifference,
        total: state.total + priceDifference
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
  const addToCart = (item, date) => {
    dispatch({
      type: ADD_TO_CART,
      payload: { item, date }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id, date) => {
    dispatch({
      type: REMOVE_FROM_CART,
      payload: { id, date }
    });
  };
  
  // Update item quantity
  const updateQuantity = (id, date, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id, date, quantity }
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

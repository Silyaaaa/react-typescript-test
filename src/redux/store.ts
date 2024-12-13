import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductState } from '../types';

const initialState: ProductState = {
  products: [],
  isLoaded: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
      state.isLoaded = true;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload);
    },
    editProduct(state, action: PayloadAction<{ id: number; updatedProduct: Partial<Product> }>) {
      const { id, updatedProduct } = action.payload;
      const index = state.products.findIndex((product) => product.id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updatedProduct };
      }
    },
    toggleLike(state, action: PayloadAction<number>) {
      const product = state.products.find((p) => p.id === action.payload);
      if (product) {
        product.liked = !product.liked;
      }
    },
    deleteProduct(state, action: PayloadAction<number>) {
      state.products = state.products.filter((product) => product.id !== action.payload);
    },
  },
});

export const { actions, reducer } = productSlice;
const store = configureStore({
  reducer: {
    products: reducer,
  },
});

export default store;

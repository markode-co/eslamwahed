"use client";

import { create } from "zustand";

type CartUiState = {
  count: number;
  setCount: (count: number) => void;
  bump: (quantity?: number) => void;
};

export const useCartUi = create<CartUiState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  bump: (quantity = 1) => set((state) => ({ count: state.count + quantity })),
}));

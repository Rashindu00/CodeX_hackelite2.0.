import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  modals: {},
  loading: {},
  errors: {},
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    openModal: (state, action) => {
      const { modalId, props } = action.payload;
      state.modals[modalId] = { isOpen: true, props: props || {} };
    },
    closeModal: (state, action) => {
      const modalId = action.payload;
      if (state.modals[modalId]) {
        state.modals[modalId].isOpen = false;
      }
    },
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    setError: (state, action) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
    clearError: (state, action) => {
      const key = action.payload;
      delete state.errors[key];
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now() + Math.random(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      const id = action.payload;
      state.toasts = state.toasts.filter(toast => toast.id !== id);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setLoading,
  setError,
  clearError,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export default uiSlice.reducer;

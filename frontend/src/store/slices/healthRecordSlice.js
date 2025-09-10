import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  records: [],
  currentRecord: null,
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    dateRange: 'all',
  },
};

const healthRecordSlice = createSlice({
  name: 'healthRecords',
  initialState,
  reducers: {
    setHealthRecords: (state, action) => {
      state.records = action.payload;
    },
    addHealthRecord: (state, action) => {
      state.records.unshift(action.payload);
    },
    updateHealthRecord: (state, action) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    setCurrentRecord: (state, action) => {
      state.currentRecord = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearHealthRecords: (state) => {
      state.records = [];
      state.currentRecord = null;
    },
  },
});

export const {
  setHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  setCurrentRecord,
  updateFilters,
  clearHealthRecords,
} = healthRecordSlice.actions;

export default healthRecordSlice.reducer;

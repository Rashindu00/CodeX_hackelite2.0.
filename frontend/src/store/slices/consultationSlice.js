import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeConsultation: null,
  consultationHistory: [],
  isInCall: false,
  callSettings: {
    video: true,
    audio: true,
  },
  isLoading: false,
  error: null,
};

const consultationSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setActiveConsultation: (state, action) => {
      state.activeConsultation = action.payload;
    },
    updateConsultation: (state, action) => {
      if (state.activeConsultation?.id === action.payload.id) {
        state.activeConsultation = { ...state.activeConsultation, ...action.payload };
      }
    },
    setCallStatus: (state, action) => {
      state.isInCall = action.payload;
    },
    updateCallSettings: (state, action) => {
      state.callSettings = { ...state.callSettings, ...action.payload };
    },
    endConsultation: (state) => {
      if (state.activeConsultation) {
        state.consultationHistory.unshift(state.activeConsultation);
      }
      state.activeConsultation = null;
      state.isInCall = false;
    },
    clearConsultations: (state) => {
      state.activeConsultation = null;
      state.consultationHistory = [];
      state.isInCall = false;
    },
  },
});

export const {
  setActiveConsultation,
  updateConsultation,
  setCallStatus,
  updateCallSettings,
  endConsultation,
  clearConsultations,
} = consultationSlice.actions;

export default consultationSlice.reducer;

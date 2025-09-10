import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.unshift(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.currentAppointment = null;
    },
  },
});

export const { 
  setAppointments, 
  addAppointment, 
  updateAppointment, 
  setCurrentAppointment, 
  clearAppointments 
} = appointmentSlice.actions;

export default appointmentSlice.reducer;

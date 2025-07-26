import { createSlice } from '@reduxjs/toolkit'
const token = localStorage.getItem("token");
const initialState = {
  value: !!token, // true if token exists
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loggedIn: (state) => {
      state.value = true;
    },
    loggedOut: (state) => {
      state.value = false;
    },
  },
});


// Action creators are generated for each case reducer function
export const { loggedIn, loggedOut } = authSlice.actions

export default authSlice.reducer
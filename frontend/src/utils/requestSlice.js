import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
    name: "requests",
    initialState: [],
    reducers: {
        addRequests: (state, action) => action.payload,
        removeRequest: (state, action) => state.filter(r => r._id !== action.payload),
    }
})

export const { addRequests, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;

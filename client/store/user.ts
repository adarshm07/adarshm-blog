import { createSlice } from "@reduxjs/toolkit"

const initialState: any = {
    user: {}
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loggedInUser: (state, action) => {
            state.user = action.payload;
        }
    }
})

export const { loggedInUser } = userSlice.actions;

export default userSlice.reducer;
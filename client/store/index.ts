import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

const persistConfig = {
    key: 'root',
    storage: storage,
}

const rootReducer = combineReducers({
    user: userReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk]
});
export const persistor = persistStore(store)

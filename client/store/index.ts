import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user";
// import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

// redux-persist issue with create sync storage - fix
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
    return {
        getItem(_key: any) {
            return Promise.resolve(null);
        },
        setItem(_key: any, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: any) {
            return Promise.resolve();
        },
    };
};

const storage = typeof window === "undefined" ? createNoopStorage() : createWebStorage();

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

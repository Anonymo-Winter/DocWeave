import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { userApi } from '../api/userApi';
import userReducer from './userSlice';

const persistUserReducer = persistReducer({ key: 'user', storage }, userReducer);

const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        user: persistUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['register'],
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(userApi.middleware),
});

const persistor = persistStore(store);

export { store, persistor };

import { configureStore } from '@reduxjs/toolkit';

import { movetaskApi } from './movetaskApi';
import { uiReducer } from './uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [movetaskApi.reducerPath]: movetaskApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(movetaskApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

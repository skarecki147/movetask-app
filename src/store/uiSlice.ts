import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TaskFilters, ThemePreference } from '@/shared/types/ui';

const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  dueDate: 'any',
  tags: [],
};

type UiState = {
  themePreference: ThemePreference;
  selectedProjectId: string | null;
  taskFilters: TaskFilters;
};

const initialState: UiState = {
  themePreference: 'system',
  selectedProjectId: null,
  taskFilters: defaultFilters,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    setSelectedProjectId(state, action: PayloadAction<string | null>) {
      state.selectedProjectId = action.payload;
    },
    setTaskFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.taskFilters = { ...state.taskFilters, ...action.payload };
    },
    resetTaskFilters(state) {
      state.taskFilters = { ...defaultFilters };
    },
  },
});

export const { setThemePreference, setSelectedProjectId, setTaskFilters, resetTaskFilters } =
  uiSlice.actions;
export const uiReducer = uiSlice.reducer;

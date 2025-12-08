import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Create analysis
export const createAnalysis = createAsyncThunk(
  'analysis/create',
  async (analysisData, { rejectWithValue }) => {
    try {
      const response = await api.post('/analysis', analysisData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create analysis');
    }
  }
);

// Get analyses for file
export const getAnalysesForFile = createAsyncThunk(
  'analysis/getForFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/analysis/${fileId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch analyses');
    }
  }
);

// Get AI insights
export const getAIInsights = createAsyncThunk(
  'analysis/getAIInsights',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/insights/${fileId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get AI insights');
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    currentAnalysisConfig: {
      xAxis: '',
      yAxis: '',
      chartType: 'bar',
      options: {},
    },
    analysesForFile: [],
    aiInsights: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setAnalysisConfig: (state, action) => {
      state.currentAnalysisConfig = { ...state.currentAnalysisConfig, ...action.payload };
    },
    clearAnalysis: (state) => {
      state.currentAnalysisConfig = {
        xAxis: '',
        yAxis: '',
        chartType: 'bar',
        options: {},
      };
      state.aiInsights = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create analysis
      .addCase(createAnalysis.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAnalysis.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add to analyses list
        state.analysesForFile.unshift(action.payload);
      })
      .addCase(createAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get analyses for file
      .addCase(getAnalysesForFile.fulfilled, (state, action) => {
        state.analysesForFile = action.payload;
      })
      // Get AI insights
      .addCase(getAIInsights.fulfilled, (state, action) => {
        state.aiInsights = action.payload;
      });
  },
});

export const { setAnalysisConfig, clearAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;




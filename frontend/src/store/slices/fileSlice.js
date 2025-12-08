import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Upload file
export const uploadFile = createAsyncThunk(
  'files/upload',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Upload failed');
    }
  }
);

// Get file history
export const getFileHistory = createAsyncThunk(
  'files/history',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/files/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch history');
    }
  }
);

// Get file by ID
export const getFileById = createAsyncThunk(
  'files/getById',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch file');
    }
  }
);

// Delete file
export const deleteFile = createAsyncThunk(
  'files/delete',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete file');
    }
  }
);

const fileSlice = createSlice({
  name: 'files',
  initialState: {
    files: [],
    currentFile: null,
    fullData: null, // Full parsed data for current file
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    setFullData: (state, action) => {
      state.fullData = action.payload;
    },
    clearCurrentFile: (state) => {
      state.currentFile = null;
      state.fullData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadFile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentFile = {
          id: action.payload.id,
          originalName: action.payload.originalName,
          columns: action.payload.columns,
          rowCount: action.payload.rowCount,
          uploadedAt: action.payload.uploadedAt,
          fullData: action.payload.fullData,
          sampleData: action.payload.sampleData,
        };
        state.fullData = action.payload.fullData || action.payload.sampleData;
        // Add to files list if not already there
        if (!state.files.find(f => f._id === action.payload.id)) {
          state.files.unshift({
            _id: action.payload.id,
            originalName: action.payload.originalName,
            uploadedAt: action.payload.uploadedAt,
          });
        }
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // History
      .addCase(getFileHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getFileHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.files = action.payload;
      })
      .addCase(getFileHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get by ID
      .addCase(getFileById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getFileById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentFile = action.payload;
        // Set fullData from response (backend returns fullData or sampleData)
        if (action.payload.fullData) {
          state.fullData = action.payload.fullData;
        } else if (action.payload.sampleData) {
          state.fullData = action.payload.sampleData;
        }
      })
      .addCase(getFileById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove deleted file from files list
        state.files = state.files.filter(file => file._id !== action.payload.id);
        // Clear current file if it was deleted
        if (state.currentFile && state.currentFile.id === action.payload.id) {
          state.currentFile = null;
          state.fullData = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentFile, setFullData, clearCurrentFile } = fileSlice.actions;
export default fileSlice.reducer;

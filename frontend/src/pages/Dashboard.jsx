import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadFile, getFileHistory, deleteFile } from '../store/slices/fileSlice';
import { toast } from 'react-toastify';

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { files, status } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(getFileHistory());
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        toast.error('Please upload an Excel file (.xls or .xlsx)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        toast.error('Please upload an Excel file (.xls or .xlsx)');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const result = await dispatch(uploadFile(selectedFile));
      if (uploadFile.fulfilled.match(result)) {
        toast.success('✨ File uploaded successfully!');
        setSelectedFile(null);
        navigate(`/analysis/${result.payload.id}`);
      } else {
        toast.error(result.payload || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const handleFileClick = (fileId) => {
    navigate(`/analysis/${fileId}`);
  };

  const handleDeleteFile = async (e, fileId, fileName) => {
    e.stopPropagation(); // Prevent triggering the file click event
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await dispatch(deleteFile(fileId));
      if (deleteFile.fulfilled.match(result)) {
        toast.success('🗑️ File deleted successfully!');
        // Refresh the file history
        dispatch(getFileHistory());
      } else {
        toast.error(result.payload || 'Failed to delete file');
      }
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          📊 Excel Analytics Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Upload, analyze, and visualize your Excel data</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-slide-down">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span>📤</span>
          <span>Upload Excel File</span>
        </h2>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-gray-500 mb-4">or</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Browse Files
              </span>
            </label>
            <p className="text-sm text-gray-400 mt-4">Supports .xls and .xlsx files (Max 10MB)</p>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📄</div>
                <div>
                  <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === 'loading'}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Upload & Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* File History */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📚</span>
            <span>Upload History</span>
          </h2>
          {files.length > 0 && (
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>

        {status === 'loading' ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-500 mb-2">No files uploaded yet</p>
            <p className="text-gray-400">Upload your first Excel file to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={file._id}
                className="group relative bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all transform hover:scale-105 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">📊</div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Click to analyze
                    </span>
                    <button
                      onClick={(e) => handleDeleteFile(e, file._id, file.originalName)}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
                      title="Delete file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div onClick={() => handleFileClick(file._id)} className="cursor-pointer">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                    {file.originalName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📅</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(file.uploadedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    <span>Analyze</span>
                    <span className="transform group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

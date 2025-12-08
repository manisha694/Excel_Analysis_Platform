import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { getFileById, setFullData } from '../store/slices/fileSlice';
import { createAnalysis, getAIInsights, setAnalysisConfig } from '../store/slices/analysisSlice';
import { toast } from 'react-toastify';
import ThreeDChart from '../components/ThreeDChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart color themes
const chartThemes = {
  default: {
    bar: 'rgba(59, 130, 246, 0.6)',
    line: 'rgba(16, 185, 129, 0.6)',
    border: 'rgba(59, 130, 246, 1)',
  },
  vibrant: {
    bar: 'rgba(236, 72, 153, 0.6)',
    line: 'rgba(168, 85, 247, 0.6)',
    border: 'rgba(236, 72, 153, 1)',
  },
  ocean: {
    bar: 'rgba(14, 165, 233, 0.6)',
    line: 'rgba(20, 184, 166, 0.6)',
    border: 'rgba(14, 165, 233, 1)',
  },
  sunset: {
    bar: 'rgba(251, 146, 60, 0.6)',
    line: 'rgba(239, 68, 68, 0.6)',
    border: 'rgba(251, 146, 60, 1)',
  },
};

function Analysis() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentFile, fullData } = useSelector((state) => state.files);
  const { currentAnalysisConfig, aiInsights } = useSelector((state) => state.analysis);

  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    dispatch(getFileById(fileId));
  }, [fileId, dispatch]);

  useEffect(() => {
    if (currentFile) {
      if (currentFile.fullData && Array.isArray(currentFile.fullData) && currentFile.fullData.length > 0) {
        dispatch(setFullData(currentFile.fullData));
      } else if (currentFile.sampleData && Array.isArray(currentFile.sampleData) && currentFile.sampleData.length > 0) {
        dispatch(setFullData(currentFile.sampleData));
      }
    }
  }, [currentFile, dispatch]);

  // Calculate statistics
  const calculateStats = () => {
    const dataToUse = fullData || currentFile?.fullData || currentFile?.sampleData;
    if (!dataToUse || !yAxis || !xAxis) return null;

    const values = dataToUse.map((row) => {
      const val = parseFloat(row[yAxis]);
      return isNaN(val) ? null : val;
    }).filter(v => v !== null);

    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
    };
  };

  const stats = calculateStats();

  const handleGenerateChart = () => {
    if (!xAxis || !yAxis) {
      toast.error('Please select both X and Y axes');
      return;
    }

    setIsGenerating(true);
    const dataToUse = fullData || currentFile?.fullData || currentFile?.sampleData;
    
    if (!dataToUse || !Array.isArray(dataToUse) || dataToUse.length === 0) {
      toast.error('No data available. Please ensure the file has data.');
      setIsGenerating(false);
      return;
    }

    const firstRow = dataToUse[0];
    if (!firstRow) {
      toast.error('Data is empty or invalid');
      setIsGenerating(false);
      return;
    }
    
    const availableColumns = Object.keys(firstRow);
    if (!availableColumns.includes(xAxis) || !availableColumns.includes(yAxis)) {
      toast.error(`Selected columns not found. Available: ${availableColumns.join(', ')}`);
      setIsGenerating(false);
      return;
    }

    let data = {};
    const theme = chartThemes[selectedTheme];

    try {
      if (chartType === 'pie') {
        const labels = dataToUse.map((row) => String(row[xAxis] || 'N/A'));
        const values = dataToUse.map((row) => {
          const val = parseFloat(row[yAxis]);
          return isNaN(val) ? 0 : val;
        });

        const filteredData = labels.map((label, idx) => ({ label, value: values[idx] }))
          .filter(item => item.value > 0)
          .slice(0, 20);

        data = {
          labels: filteredData.map(item => item.label),
          datasets: [{
            label: yAxis,
            data: filteredData.map(item => item.value),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(255, 99, 255, 0.8)',
              'rgba(99, 255, 132, 0.8)',
            ],
          }],
        };
      } else if (chartType === 'scatter') {
        const points = dataToUse
          .map((row) => {
            const x = parseFloat(row[xAxis]);
            const y = parseFloat(row[yAxis]);
            if (isNaN(x) || isNaN(y)) return null;
            return { x, y };
          })
          .filter(point => point !== null);

        if (points.length === 0) {
          toast.error('No valid numeric data points found for scatter plot');
          setIsGenerating(false);
          return;
        }

        data = {
          datasets: [{
            label: `${yAxis} vs ${xAxis}`,
            data: points,
            backgroundColor: theme.bar,
            pointRadius: 6,
            pointHoverRadius: 8,
          }],
        };
      } else {
        const labels = dataToUse.map((row) => {
          const value = row[xAxis];
          return value !== null && value !== undefined ? String(value) : 'N/A';
        });
        
        const values = dataToUse.map((row) => {
          const val = parseFloat(row[yAxis]);
          return isNaN(val) ? 0 : val;
        });

        const validValues = values.filter(v => v !== 0 && !isNaN(v));
        if (validValues.length === 0) {
          toast.error('No valid numeric data found for Y axis');
          setIsGenerating(false);
          return;
        }

        data = {
          labels: labels,
          datasets: [{
            label: yAxis,
            data: values,
            backgroundColor: chartType === 'bar' || chartType === '3d-bar' ? theme.bar : theme.line,
            borderColor: theme.border,
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 4 : 0,
          }],
        };
      }

      setChartData(data);
      dispatch(setAnalysisConfig({ xAxis, yAxis, chartType }));
      dispatch(createAnalysis({ fileId, xAxis, yAxis, chartType }));
      toast.success('✨ Chart generated successfully!');
    } catch (error) {
      console.error('Error generating chart:', error);
      toast.error('Failed to generate chart');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!chartData) {
      toast.error('Please generate a chart first');
      return;
    }

    try {
      const element = chartType === '3d-bar' 
        ? document.getElementById('three-d-chart')
        : document.getElementById('chart-container');

      if (!element) {
        toast.error('Chart element not found');
        return;
      }

      const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `chart-${chartType}-${Date.now()}.png`;
      link.href = url;
      link.click();
      toast.success('📥 Chart downloaded as PNG');
    } catch (error) {
      toast.error('Failed to download chart');
    }
  };

  const handleDownloadPDF = async () => {
    if (!chartData) {
      toast.error('Please generate a chart first');
      return;
    }

    try {
      const element = chartType === '3d-bar' 
        ? document.getElementById('three-d-chart')
        : document.getElementById('chart-container');

      if (!element) {
        toast.error('Chart element not found');
        return;
      }

      const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const pageHeight = 200;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', position, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`chart-${chartType}-${Date.now()}.pdf`);
      toast.success('📥 Chart downloaded as PDF');
    } catch (error) {
      toast.error('Failed to download chart');
    }
  };

  const handleExportCSV = () => {
    const dataToUse = fullData || currentFile?.fullData || currentFile?.sampleData;
    if (!dataToUse || !xAxis || !yAxis) {
      toast.error('Please generate a chart first');
      return;
    }

    const csvData = dataToUse.map(row => ({
      [xAxis]: row[xAxis] || '',
      [yAxis]: row[yAxis] || '',
    }));

    const headers = [xAxis, yAxis];
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-${Date.now()}.csv`;
    link.click();
    toast.success('📥 Data exported as CSV');
  };

  const handleExportJSON = () => {
    const dataToUse = fullData || currentFile?.fullData || currentFile?.sampleData;
    if (!dataToUse || !xAxis || !yAxis) {
      toast.error('Please generate a chart first');
      return;
    }

    const jsonData = dataToUse.map(row => ({
      [xAxis]: row[xAxis] || '',
      [yAxis]: row[yAxis] || '',
    }));

    const json = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-${Date.now()}.json`;
    link.click();
    toast.success('📥 Data exported as JSON');
  };

  const handleGetAIInsights = () => {
    dispatch(getAIInsights(fileId));
  };

  if (!currentFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading file data...</p>
        </div>
      </div>
    );
  }

  const dataToUse = fullData || currentFile?.fullData || currentFile?.sampleData || [];
  const previewData = dataToUse.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-6 animate-fade-in">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-all hover:gap-3"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentFile.originalName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {currentFile.rowCount} rows
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {currentFile.columns.length} columns
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {dataToUse.length} data points
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDataPreview(!showDataPreview)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium"
              >
                {showDataPreview ? '👁️ Hide' : '👁️ Preview'} Data
              </button>
              {stats && (
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition text-sm font-medium"
                >
                  {showStats ? '📊 Hide' : '📊 Show'} Stats
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && stats && (
        <div className="mb-6 animate-slide-down bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Statistics for {yAxis}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-xs text-blue-600 font-medium mb-1">Minimum</p>
              <p className="text-2xl font-bold text-blue-700">{stats.min.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-xs text-green-600 font-medium mb-1">Maximum</p>
              <p className="text-2xl font-bold text-green-700">{stats.max.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <p className="text-xs text-purple-600 font-medium mb-1">Average</p>
              <p className="text-2xl font-bold text-purple-700">{stats.avg.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <p className="text-xs text-orange-600 font-medium mb-1">Median</p>
              <p className="text-2xl font-bold text-orange-700">{stats.median.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
              <p className="text-xs text-pink-600 font-medium mb-1">Sum</p>
              <p className="text-2xl font-bold text-pink-700">{stats.sum.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
              <p className="text-xs text-indigo-600 font-medium mb-1">Count</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.count}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      {showDataPreview && (
        <div className="mb-6 animate-slide-down bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📋 Data Preview (First 10 rows)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {currentFile.columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    {currentFile.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-sm text-gray-700">
                        {row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart Configuration */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Chart Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📍 X Axis
            </label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            >
              <option value="">Select column...</option>
              {currentFile.columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Y Axis
            </label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            >
              <option value="">Select column...</option>
              {currentFile.columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📈 Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            >
              <option value="bar">📊 Bar Chart</option>
              <option value="line">📈 Line Chart</option>
              <option value="pie">🥧 Pie Chart</option>
              <option value="scatter">🔵 Scatter Plot</option>
              <option value="3d-bar">🎯 3D Bar Chart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎨 Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm hover:shadow-md"
            >
              <option value="default">🔵 Default</option>
              <option value="vibrant">💗 Vibrant</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="sunset">🌅 Sunset</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerateChart}
          disabled={isGenerating || !xAxis || !yAxis}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Chart</span>
            </>
          )}
        </button>
      </div>

      {/* Chart Display */}
      {chartData && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chart Preview
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPNG}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📥</span>
                <span>PNG</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📄</span>
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📊</span>
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>📋</span>
                <span>JSON</span>
              </button>
            </div>
          </div>
          <div id="chart-container" className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{ minHeight: '450px', position: 'relative', width: '100%' }}>
            {chartType === '3d-bar' ? (
              <ThreeDChart data={chartData} xAxis={xAxis} yAxis={yAxis} />
            ) : chartType === 'bar' ? (
              <div style={{ height: '450px', position: 'relative' }}>
                <Bar 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'top' },
                      title: {
                        display: true,
                        text: `${yAxis} by ${xAxis}`,
                        font: { size: 18, weight: 'bold' },
                        color: '#1e40af',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: yAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      x: {
                        title: { display: true, text: xAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                    },
                  }} 
                />
              </div>
            ) : chartType === 'line' ? (
              <div style={{ height: '450px', position: 'relative' }}>
                <Line 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'top' },
                      title: {
                        display: true,
                        text: `${yAxis} by ${xAxis}`,
                        font: { size: 18, weight: 'bold' },
                        color: '#1e40af',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: yAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      x: {
                        title: { display: true, text: xAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                    },
                  }} 
                />
              </div>
            ) : chartType === 'pie' ? (
              <div style={{ height: '450px', position: 'relative' }}>
                <Pie 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'right' },
                      title: {
                        display: true,
                        text: `${yAxis} Distribution`,
                        font: { size: 18, weight: 'bold' },
                        color: '#1e40af',
                      },
                    },
                  }} 
                />
              </div>
            ) : chartType === 'scatter' ? (
              <div style={{ height: '450px', position: 'relative' }}>
                <Scatter 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true },
                      title: {
                        display: true,
                        text: `${yAxis} vs ${xAxis}`,
                        font: { size: 18, weight: 'bold' },
                        color: '#1e40af',
                      },
                    },
                    scales: {
                      x: {
                        title: { display: true, text: xAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      y: {
                        title: { display: true, text: yAxis, font: { size: 14, weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                    },
                  }} 
                />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🤖 AI Insights
          </h2>
          <button
            onClick={handleGetAIInsights}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>✨</span>
            <span>Get Insights</span>
          </button>
        </div>
        {aiInsights ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-purple-700">Source:</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-medium">
                {aiInsights.source}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{aiInsights.insights}</p>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Click "Get Insights" to generate AI-powered analysis of your data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analysis;

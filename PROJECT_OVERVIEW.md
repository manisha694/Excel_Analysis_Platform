# Excel Analytics Platform - Project Overview

## Project Description

A powerful MERN stack-based full-stack platform for uploading Excel files (.xls or .xlsx), analyzing data, and generating interactive 2D and 3D charts. Users can dynamically select X and Y axes from column headers, choose chart types, and generate downloadable graphs. Each user's upload and analysis history is saved and visible on their dashboard. Admin users can manage users and view data usage statistics. The platform optionally integrates AI APIs to provide smart insights and summary reports from uploaded data.

## ✅ Implemented Features

### 1. User & Admin Authentication (JWT-based)
- ✅ User registration with email validation
- ✅ User login with JWT token generation
- ✅ Password hashing using bcrypt
- ✅ Protected routes with JWT middleware
- ✅ Role-based access control (user/admin)
- ✅ Admin-only routes protection

### 2. Excel File Upload & Management
- ✅ Support for .xls and .xlsx file formats
- ✅ File parsing using SheetJS (xlsx)
- ✅ Column extraction and data validation
- ✅ File metadata storage in MongoDB
- ✅ Sample data storage (first 10 rows)
- ✅ Upload history per user
- ✅ File ownership tracking

### 3. Dynamic Data Mapping
- ✅ Dynamic X and Y axis selection from column headers
- ✅ Column dropdown menus populated from Excel headers
- ✅ Real-time chart generation based on selected axes
- ✅ Support for numeric and categorical data

### 4. Interactive Chart Generation

#### 2D Charts (Chart.js)
- ✅ Bar Chart
- ✅ Line Chart
- ✅ Pie Chart
- ✅ Scatter Plot

#### 3D Charts (Three.js)
- ✅ 3D Bar Chart with interactive rotation
- ✅ Mouse drag controls for 3D visualization
- ✅ Responsive 3D rendering

### 5. Chart Export & Download
- ✅ PNG export using html2canvas
- ✅ PDF export using jsPDF
- ✅ Support for both 2D and 3D chart exports
- ✅ Automatic file naming with timestamps

### 6. Dashboard & History
- ✅ User dashboard with file upload interface
- ✅ Upload history display
- ✅ File metadata (name, upload date, row/column count)
- ✅ Quick navigation to analysis page
- ✅ File click-to-analyze functionality

### 7. Admin Dashboard
- ✅ User management view
- ✅ Usage statistics (total users, files, analyses)
- ✅ Files per user breakdown
- ✅ User role display
- ✅ Admin-only access protection

### 8. AI Tools API Integration (Optional)
- ✅ OpenAI API integration for insights
- ✅ Mock insights fallback when API key not configured
- ✅ Data summary generation
- ✅ Smart analysis of Excel data
- ✅ Pattern recognition and use case suggestions
- ✅ Error handling with graceful fallback

### 9. Modern Responsive UI
- ✅ Tailwind CSS for styling
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Clean and modern interface
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling
- ✅ Intuitive navigation

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **SheetJS (xlsx)** - Excel file parsing
- **dotenv** - Environment variable management

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Chart.js** - 2D charting library
- **react-chartjs-2** - React wrapper for Chart.js
- **Three.js** - 3D graphics library
- **html2canvas** - Chart to image conversion
- **jsPDF** - PDF generation
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **react-toastify** - Toast notifications

## Project Structure

```
.
├── backend/
│   ├── models/          # MongoDB models (User, File, Analysis)
│   ├── routes/          # Express routes
│   │   ├── auth.js      # Authentication routes
│   │   ├── files.js     # File upload/history routes
│   │   ├── analysis.js  # Analysis configuration routes
│   │   ├── admin.js     # Admin dashboard routes
│   │   └── ai.js        # AI insights routes
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # JWT verification & admin check
│   │   └── errorHandler.js # Error handling
│   ├── server.js        # Express server entry point
│   ├── env.example      # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   └── ThreeDChart.jsx # 3D chart component
│   │   ├── pages/       # Page components
│   │   │   ├── Dashboard.jsx   # User dashboard
│   │   │   ├── Analysis.jsx    # Chart analysis page
│   │   │   └── Admin.jsx       # Admin dashboard
│   │   ├── store/       # Redux store
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js      # Auth state
│   │   │   │   ├── fileSlice.js      # File state
│   │   │   │   └── analysisSlice.js  # Analysis state
│   │   │   └── store.js          # Store configuration
│   │   ├── utils/       # Utilities
│   │   │   └── api.js   # Axios instance with auth
│   │   └── App.jsx      # Main app component
│   └── package.json
├── README.md            # Setup and usage instructions
├── SETUP.md            # Detailed setup guide
└── PROJECT_OVERVIEW.md  # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Files
- `POST /api/files/upload` - Upload Excel file (protected)
- `GET /api/files/history` - Get user's upload history (protected)
- `GET /api/files/:fileId` - Get file details (protected)

### Analysis
- `POST /api/analysis` - Create analysis configuration (protected)
- `GET /api/analysis/:fileId` - Get analyses for a file (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/usage` - Get usage statistics (admin only)

### AI
- `POST /api/ai/insights/:fileId` - Get AI insights (protected)

## Key Features Implementation Details

### Dynamic Axis Selection
- Users can select any column as X or Y axis
- Dropdown menus dynamically populated from Excel headers
- Validation ensures both axes are selected before chart generation
- Supports both numeric and categorical data types

### Chart Type Support
- **Bar Chart**: Best for categorical comparisons
- **Line Chart**: Ideal for trends over time
- **Pie Chart**: Limited to 20 items for readability
- **Scatter Plot**: For correlation analysis between numeric variables
- **3D Bar Chart**: Interactive 3D visualization with rotation controls

### Export Functionality
- PNG export captures chart as high-quality image
- PDF export includes chart in multi-page format if needed
- Works for both 2D Chart.js charts and 3D Three.js visualizations
- Automatic timestamp-based file naming

### AI Insights
- Uses OpenAI GPT-3.5-turbo when API key is configured
- Analyzes file metadata, columns, and sample data
- Provides insights about data type, patterns, and visualization recommendations
- Falls back to mock insights if API unavailable
- Clear indication of insight source (OpenAI vs mock)

## Development Timeline (10-Week Structure)

### Weeks 1-5: Core Features
- ✅ Project setup and environment configuration
- ✅ User authentication system
- ✅ File upload functionality
- ✅ Excel parsing and data extraction
- ✅ Basic chart generation (2D)

### Weeks 6-10: Advanced Features
- ✅ 3D chart implementation
- ✅ Chart export functionality
- ✅ Admin dashboard
- ✅ AI integration
- ✅ UI/UX polish and responsive design

## Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/excel-analytics
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
OPENAI_API_KEY=sk-... # Optional
```

## Security Features
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ File ownership validation
- ✅ Input validation and sanitization

## Performance Considerations
- Sample data storage (first 10 rows) to reduce database size
- Efficient MongoDB queries with indexing
- Client-side chart rendering for performance
- Lazy loading of chart components
- Optimized 3D rendering with Three.js

## Future Enhancement Opportunities
- [ ] Real-time collaboration features
- [ ] Advanced chart customization options
- [ ] Data filtering and sorting
- [ ] Multiple dataset comparison
- [ ] Scheduled report generation
- [ ] Email notifications
- [ ] Data export to CSV/Excel
- [ ] Chart templates and presets
- [ ] User preferences and settings
- [ ] Advanced AI analysis with multiple models

## Notes for Students

This project demonstrates:
- Full-stack MERN development
- RESTful API design
- State management with Redux
- File handling and parsing
- Data visualization techniques
- Authentication and authorization
- Third-party API integration
- Responsive UI design
- Error handling and validation

## License

ISC


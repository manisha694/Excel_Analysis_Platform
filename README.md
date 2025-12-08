# Excel Analytics Platform (MERN Stack)

A full-stack web application for uploading Excel files, parsing data, and creating interactive 2D and 3D charts with AI-powered insights.

## Features

- **User Authentication**: JWT-based registration and login
- **Excel File Upload**: Upload and parse .xls/.xlsx files
- **Interactive Charting**: Create bar, line, pie, scatter, and 3D bar charts
- **Chart Export**: Download charts as PNG or PDF
- **AI Insights**: Get AI-powered analysis of your data (requires OpenAI API key)
- **Admin Dashboard**: Manage users and view usage statistics
- **Upload History**: View and analyze previously uploaded files

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- SheetJS (xlsx) for Excel parsing
- bcrypt for password hashing

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- React Router for navigation
- Chart.js for 2D charts
- Three.js for 3D charts
- Tailwind CSS for styling
- Axios for API calls

## Project Structure

```
.
├── backend/
│   ├── models/          # MongoDB models (User, File, Analysis)
│   ├── routes/          # Express routes (auth, files, analysis, admin, ai)
│   ├── middleware/      # Auth and error handling middleware
│   ├── server.js        # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store and slices
│   │   ├── utils/       # API utilities
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/excel-analytics
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
OPENAI_API_KEY=  # Optional: Add your OpenAI API key for AI insights
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing (use a strong random string)
- `PORT`: Server port (default: 5000)
- `OPENAI_API_KEY`: (Optional) OpenAI API key for AI insights feature

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Excel File**: Go to Dashboard and upload a .xls or .xlsx file
3. **Analyze Data**: Select X/Y axes and chart type, then generate the chart
4. **Export Charts**: Download charts as PNG or PDF
5. **Get AI Insights**: Click "Get Insights" to receive AI-powered analysis (if API key is configured)
6. **Admin Access**: Admin users can view user list and usage statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Files
- `POST /api/files/upload` - Upload Excel file (protected)
- `GET /api/files/history` - Get upload history (protected)
- `GET /api/files/:fileId` - Get file details (protected)

### Analysis
- `POST /api/analysis` - Create analysis configuration (protected)
- `GET /api/analysis/:fileId` - Get analyses for file (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/usage` - Get usage statistics (admin only)

### AI
- `POST /api/ai/insights/:fileId` - Get AI insights (protected)

## Notes

- The backend stores file metadata and sample data (first 10 rows) in MongoDB. For production, consider storing full data in a separate collection or using a file storage service.
- The 3D chart uses Three.js and supports mouse drag for rotation.
- Chart export uses html2canvas and jsPDF libraries.
- AI insights require an OpenAI API key. Without it, mock insights are returned.

## Development

- Backend uses ES modules (`"type": "module"` in package.json)
- Frontend uses Vite for fast development
- Redux Toolkit is used for state management
- Tailwind CSS is used for styling

## License

ISC




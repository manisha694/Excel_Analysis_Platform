# Setup Guide - Excel Analytics Platform

## Quick Start Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from env.example)
# On Windows:
copy env.example .env
# On Mac/Linux:
cp env.example .env

# Edit .env file and set:
# - MONGODB_URI (default: mongodb://localhost:27017/excel-analytics)
# - JWT_SECRET (use a strong random string)
# - PORT (default: 5000)
# - OPENAI_API_KEY (optional, for AI insights)

# Start MongoDB (if running locally)
# Make sure MongoDB is running on your system

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. First Time Setup

1. **Start MongoDB**: Ensure MongoDB is running locally or update `MONGODB_URI` in `.env` to point to your MongoDB instance (e.g., MongoDB Atlas).

2. **Create Admin User** (optional): You can create an admin user by:
   - Registering a user through the UI
   - Manually updating the user's role in MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "your-email@example.com" },
       { $set: { role: "admin" } }
     )
     ```

3. **Test the Application**:
   - Register a new account
   - Login
   - Upload an Excel file (.xls or .xlsx)
   - Create charts and analyze data

## Environment Variables

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/excel-analytics` |
| `JWT_SECRET` | Secret for JWT token signing | Yes | - |
| `PORT` | Server port | No | `5000` |
| `OPENAI_API_KEY` | OpenAI API key for AI insights | No | - |

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify the connection string in `.env`
- For MongoDB Atlas, use the connection string from your cluster

### Port Already in Use
- Change the `PORT` in backend `.env` file
- Update frontend `vite.config.js` proxy target if needed

### CORS Errors
- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `backend/server.js`

### File Upload Fails
- Check file size (max 10MB)
- Ensure file is .xls or .xlsx format
- Check backend console for error messages

## Production Deployment Notes

1. **Environment Variables**: Never commit `.env` files. Use environment variables in your hosting platform.

2. **MongoDB**: Use MongoDB Atlas or a managed MongoDB service for production.

3. **File Storage**: Consider using cloud storage (AWS S3, Azure Blob, etc.) for large Excel files instead of storing in MongoDB.

4. **Security**:
   - Use a strong `JWT_SECRET` in production
   - Enable HTTPS
   - Configure CORS properly
   - Add rate limiting

5. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   Serve the `dist` folder with a web server (nginx, Apache, etc.)

6. **Backend**: Use PM2 or similar process manager for Node.js in production.

## Project Structure

```
.
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handling
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/        # Redux store
│   │   └── utils/        # Utilities
│   └── package.json
└── README.md
```

## Next Steps

1. Install dependencies for both backend and frontend
2. Configure MongoDB connection
3. Set JWT_SECRET
4. Start both servers
5. Open `http://localhost:3000` in your browser
6. Register and start using the application!




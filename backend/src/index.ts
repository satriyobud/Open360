import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import reviewCycleRoutes from './routes/reviewCycles';
import categoryRoutes from './routes/categories';
import questionRoutes from './routes/questions';
import assignmentRoutes from './routes/assignments';
import feedbackRoutes from './routes/feedbacks';
import reportRoutes from './routes/reports';
import departmentRoutes from './routes/departments';

// Load environment variables
dotenv.config();

// Import MySQL connection (will connect automatically)
import './config/database';

const app = express();
const PORT = process.env.PORT || 5100;

// Security middleware
app.use(helmet());

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL 
        ? [process.env.FRONTEND_URL] 
        : ['https://your-frontend-domain.com'])
    : [
        'http://localhost:5200',
        /^https:\/\/.*\.ngrok-free\.dev$/,
        /^https:\/\/.*\.ngrok\.io$/,
        /^https:\/\/.*\.ngrok\.app$/,
        /^https:\/\/.*\.onrender\.com$/
      ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/review-cycles', reviewCycleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);

// Serve static files from React build (both production and development for ngrok)
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  // Try multiple possible paths for the frontend build
  const possiblePaths = [
    path.join(__dirname, '../../frontend/build'),
    path.join(__dirname, '../frontend/build'),
    path.join(process.cwd(), 'frontend/build'),
    path.join(process.cwd(), '../frontend/build')
  ];
  
  let buildPath = null;
  for (const testPath of possiblePaths) {
    try {
      if (require('fs').existsSync(path.join(testPath, 'index.html'))) {
        buildPath = testPath;
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!buildPath) {
    console.error('Frontend build not found in any expected location');
    console.error('Searched paths:', possiblePaths);
    console.error('Current working directory:', process.cwd());
    console.error('__dirname:', __dirname);
  } else {
    console.log('Serving static files from:', buildPath);
  }
  
  if (buildPath) {
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      console.log('Serving React app for route:', req.path);
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // Fallback if frontend build not found
    app.get('*', (req, res) => {
      res.status(500).json({ 
        error: 'Frontend build not found. Please check deployment logs.',
        searchedPaths: possiblePaths,
        currentDir: process.cwd(),
        __dirname: __dirname
      });
    });
  }
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request entity too large' });
  }

  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

export default app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const messageRoutes = require('./routes/messages');

// Silence console logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS options must be declared before use
const corsOptions = {
  origin: process.env.FRONTEND_URI,
  optionsSuccessStatus: 200 // Legacy browser support
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());

// API routes
app.use('/api', messageRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Web Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: [
      'GET /api/health',
      'GET /api/conversations',
      'GET /api/conversations/:waId/messages',
      'POST /api/conversations/:waId/messages'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `${req.method} ${req.url} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server locally
if (process.env.VERCEL !== '1') {
  (async () => {
    try {
      await connectDatabase();
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = app;







// // SERVER SETUP - server.js

// // Silence all console.log in production
// if (process.env.NODE_ENV === 'production') {
//   console.log = () => {};
// }


// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const { connectDatabase } = require('./config/database');
// const messageRoutes = require('./routes/messages');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors());
// app.use(express.json());

// // API routes
// app.use('/api', messageRoutes);

// // Root endpoint - API information
// app.get('/', (req, res) => {
//     res.json({
//         message: 'WhatsApp Web Backend API',
//         version: '1.0.0',
//         status: 'Running',
//         endpoints: [
//             'GET /api/health - System health check',
//             'GET /api/conversations - Get all conversations',
//             'GET /api/conversations/:waId/messages - Get messages for a conversation',
//             'POST /api/conversations/:waId/messages - Send message to a conversation'
//         ]
//     });
// });

// // 404 handler for unknown routes
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         error: 'API endpoint not found',
//         message: `${req.method} ${req.url} does not exist`
//     });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//     console.error('Server Error:', error);
//     res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//         message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//     });
// });

// /**
//  * Start the server
//  * First connects to database, then starts listening
//  */
// async function startServer() {
//     try {
//         await connectDatabase();
        
//         app.listen(PORT, () => {
//             console.log(`\n Server running on http://localhost:${PORT}`);
//             console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
//             console.log('\n Available endpoints:');
//             console.log(`   GET  http://localhost:${PORT}/api/health`);
//             console.log(`   GET  http://localhost:${PORT}/api/conversations`);
//             console.log(`   GET  http://localhost:${PORT}/api/conversations/:waId/messages`);
//             console.log(`   POST http://localhost:${PORT}/api/conversations/:waId/messages`);
//             console.log('\n Server ready!');
//         });
        
//     } catch (error) {
//         console.error(' Failed to start server:', error.message);
//         process.exit(1);
//     }
// }

// startServer();





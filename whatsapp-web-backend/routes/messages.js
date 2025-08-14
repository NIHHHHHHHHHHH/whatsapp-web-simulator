
// API ROUTES - routes/messages.js


const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

/**
 * API Route Definitions
 * All routes are prefixed with /api in server.js
 */

// Get list of all conversations
router.get('/conversations', messageController.getConversations);

// Get messages for a specific conversation
router.get('/conversations/:waId/messages', messageController.getMessages);

// Send a new message
router.post('/conversations/:waId/messages', messageController.sendMessage);

// System health check
router.get('/health', messageController.getHealth);

module.exports = router;


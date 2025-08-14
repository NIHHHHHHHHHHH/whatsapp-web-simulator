
// MESSAGE MODEL - models/Message.js


const mongoose = require('mongoose');

/**
 * Message Schema Definition
 * Stores WhatsApp messages with conversation grouping by wa_id
 */
const messageSchema = new mongoose.Schema({
    // Unique identifier for each message
    messageId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // WhatsApp ID - used to group conversations
    wa_id: {
        type: String,
        required: true,
        index: true
    },
    
    // Message content
    text: {
        type: String,
        default: ''
    },
    
    // Type of message (text, image, etc.)
    messageType: {
        type: String,
        default: 'text',
        enum: ['text', 'image', 'audio', 'video', 'document']
    },
    
    // Sender's phone number
    fromNumber: {
        type: String,
        required: true,
        index: true
    },
    
    // Recipient's phone number
    toNumber: {
        type: String,
        required: true
    },
    
    // Display name of the contact
    contactName: {
        type: String,
        default: 'Unknown'
    },
    
    // Message timestamp (Unix timestamp)
    timestamp: {
        type: Number,
        required: true,
        index: true
    },
    
    // True if message is sent by business, false if received
    isOutgoing: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Message delivery status
    status: {
        type: String,
        default: 'received',
        enum: ['sent', 'delivered', 'read', 'failed', 'received']
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound indexes for better query performance
messageSchema.index({ wa_id: 1, timestamp: -1 });
messageSchema.index({ fromNumber: 1, timestamp: -1 });
messageSchema.index({ toNumber: 1, timestamp: -1 });
messageSchema.index({ isOutgoing: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema, 'processed_messages');


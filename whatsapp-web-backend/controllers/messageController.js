
// MESSAGE CONTROLLER - controllers/messageController.js


const Message = require('../models/Message');

/**
 * Get all conversations
 * Returns list of people who have sent messages, grouped by wa_id
 */
const getConversations = async (req, res) => {
    try {
        // Find all unique wa_ids from incoming messages
        const senderIds = await Message.distinct('wa_id', {
            isOutgoing: false
        });
        
        const conversations = [];
        
        // Get conversation details for each wa_id
        for (const waId of senderIds) {
            const conversationData = await buildConversationSummary(waId);
            if (conversationData) {
                conversations.push(conversationData);
            }
        }
        
        // Sort conversations by latest message time
        conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        
        res.json({ 
            success: true,
            conversations 
        });
        
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get conversations' 
        });
    }
};

/**
 * Helper function to build conversation summary
 * Gets latest message and contact info for a wa_id
 */
async function buildConversationSummary(waId) {
    try {
        // Get the most recent message in this conversation
        const lastMessage = await Message.findOne({
            $or: [
                { wa_id: waId },
                { toNumber: waId }
            ]
        }).sort({ timestamp: -1 });
        
        // Get contact info from incoming messages
        const contactInfo = await Message.findOne({
            wa_id: waId,
            isOutgoing: false
        });
        
        if (!lastMessage) return null;
        
        return {
            wa_id: waId,
            phoneNumber: contactInfo?.fromNumber || waId,
            contactName: contactInfo?.contactName || 'Unknown',
            lastMessage: lastMessage.text || 'No message',
            lastMessageTime: lastMessage.timestamp,
            isLastOutgoing: lastMessage.isOutgoing
        };
        
    } catch (error) {
        console.error('Error building conversation summary:', error);
        return null;
    }
}

/**
 * Get all messages for a specific conversation
 * Returns messages sorted chronologically (oldest first)
 */
const getMessages = async (req, res) => {
    try {
        const { waId } = req.params;
        
        // Validate input
        if (!waId) {
            return res.status(400).json({
                success: false,
                error: 'wa_id is required'
            });
        }
        
        // Find all messages in this conversation
        const messages = await Message.find({
            $or: [
                { wa_id: waId },
                { toNumber: waId }
            ]
        }).sort({ timestamp: 1 });
        
        res.json({ 
            success: true,
            messages 
        });
        
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get messages' 
        });
    }
};

/**
 * Send a new message
 * Creates and saves an outgoing message to database
 */
const sendMessage = async (req, res) => {
    try {
        const { waId } = req.params;
        const { text, contactName } = req.body;
        
        // Validate required inputs
        const validation = validateMessageInput(text, waId);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        // Get business phone number from environment
        const businessPhone = process.env.BUSINESS_PHONE_NUMBER || '+1234567890';
        
        // Get contact name from existing conversation
        const contactNameToUse = await getContactName(waId, contactName);
        
        // Create new message object
        const messageData = createOutgoingMessage(waId, text, businessPhone, contactNameToUse);
        
        // Save message to database
        const savedMessage = await new Message(messageData).save();
        
        console.log(` Message saved: ${savedMessage.messageId} to ${contactNameToUse} (${waId})`);
        
        res.json({ 
            success: true, 
            message: savedMessage
        });
        
    } catch (error) {
        console.error(' Error sending message:', error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: `Validation failed: ${Object.values(error.errors).map(e => e.message).join(', ')}`
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Message with this ID already exists'
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to send message' 
        });
    }
};

/**
 * Validate message input data
 */
function validateMessageInput(text, waId) {
    if (!text || !text.trim()) {
        return { isValid: false, error: 'Message text is required' };
    }
    
    if (!waId) {
        return { isValid: false, error: 'wa_id is required' };
    }
    
    return { isValid: true };
}

/**
 * Get contact name from existing messages or use provided name
 */
async function getContactName(waId, providedName) {
    try {
        const existingMessage = await Message.findOne({ 
            wa_id: waId,
            isOutgoing: false 
        });
        
        return existingMessage?.contactName || providedName || 'Unknown';
    } catch (error) {
        return providedName || 'Unknown';
    }
}

/**
 * Create outgoing message object
 */
function createOutgoingMessage(waId, text, businessPhone, contactName) {
    return {
        messageId: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        wa_id: 'business',
        text: text.trim(),
        messageType: 'text',
        fromNumber: businessPhone,
        toNumber: waId,
        contactName: 'You',
        timestamp: Date.now(),
        isOutgoing: true,
        status: 'sent'
    };
}

/**
 * Get system health and statistics
 */
const getHealth = async (req, res) => {
    try {
        // Get database statistics
        const totalMessages = await Message.countDocuments();
        const uniqueConversations = await Message.distinct('wa_id', {
            isOutgoing: false
        });
        
        res.json({ 
            success: true,
            status: 'OK',
            totalMessages,
            totalConversations: uniqueConversations.length,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ 
            success: false,
            status: 'Database Error',
            error: error.message
        });
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    getHealth
};


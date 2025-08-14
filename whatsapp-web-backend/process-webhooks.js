
// WEBHOOK PROCESSOR - processWebhooks.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const Message = require('./models/Message');

/**
 * Save a single message to database
 * Checks for duplicates before saving
 */
async function saveMessage(messageData) {
    try {
        // Check if message already exists
        const existingMessage = await Message.findOne({ 
            messageId: messageData.messageId 
        });
        
        if (existingMessage) {
            console.log(' Message already exists:', messageData.messageId);
            return false;
        }
        
        // Create and save new message
        const newMessage = new Message(messageData);
        await newMessage.save();
        
        console.log('Saved message:', messageData.messageId, 'from:', messageData.contactName);
        return true;
        
    } catch (error) {
        console.log('Error saving message:', error.message);
        return false;
    }
}

/**
 * Update message status for delivery reports
 */
async function updateMessageStatus(messageId, status) {
    try {
        const result = await Message.updateOne(
            { messageId: messageId },
            { 
                status: status,
                updatedAt: new Date()
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log('Updated status:', messageId, 'to', status);
        } else {
            console.log('Message not found for status update:', messageId);
        }
        
    } catch (error) {
        console.log(' Error updating status:', error.message);
    }
}

/**
 * Process a single webhook JSON file
 */
async function processWebhookFile(filePath) {
    try {
        const fileName = path.basename(filePath);
        console.log('\n Processing:', fileName);
        
        // Read and parse JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const webhookData = JSON.parse(fileContent);
        
        // Extract webhook structure
        const webhookInfo = extractWebhookData(webhookData);
        if (!webhookInfo) {
            console.log('Invalid webhook structure in:', fileName);
            return;
        }
        
        // Process messages if present
        if (webhookInfo.messages && webhookInfo.messages.length > 0) {
            await processMessages(webhookInfo.messages, webhookInfo.value, webhookInfo.businessNumber);
        }
        
        // Process status updates if present
        if (webhookInfo.statuses && webhookInfo.statuses.length > 0) {
            await processStatusUpdates(webhookInfo.statuses);
        }
        
    } catch (error) {
        console.log(' Error processing file:', path.basename(filePath));
        console.log('   Error details:', error.message);
    }
}

/**
 * Extract webhook data structure
 */
function extractWebhookData(webhookData) {
    const entry = webhookData.metaData?.entry?.[0];
    if (!entry) return null;
    
    const changes = entry.changes?.[0];
    const value = changes?.value;
    if (!value) return null;
    
    const businessNumber = value.metadata?.display_phone_number || process.env.BUSINESS_PHONE_NUMBER;
    
    return {
        value,
        businessNumber,
        messages: value.messages,
        statuses: value.statuses
    };
}

/**
 * Process incoming/outgoing messages
 */
async function processMessages(messages, value, businessNumber) {
    console.log(`Found ${messages.length} message(s)`);
    
    for (const message of messages) {
        const messageData = createMessageFromWebhook(message, value, businessNumber);
        if (messageData) {
            await saveMessage(messageData);
        }
    }
}

/**
 * Process status updates (delivery reports)
 */
async function processStatusUpdates(statuses) {
    console.log(`Found ${statuses.length} status update(s)`);
    
    for (const status of statuses) {
        const messageId = status.id || status.meta_msg_id;
        if (messageId) {
            await updateMessageStatus(messageId, status.status);
        }
    }
}

/**
 * Create message object from webhook data
 * Simplified version that's easier to understand
 */
function createMessageFromWebhook(message, value, businessNumber) {
    try {
        // Default values
        let contactName = 'Unknown';
        let isOutgoing = false;
        let waId = null;
        let toNumber = null;
        
        // Check if message is from business (outgoing)
        if (businessNumber && message.from === businessNumber) {
            isOutgoing = true;
            contactName = 'You';
            waId = 'business';
            
            // Find recipient from contacts
            if (value.contacts && value.contacts.length > 0) {
                toNumber = value.contacts[0].wa_id;
            }
        } else {
            // Incoming message - get contact info
            const contactInfo = getContactInfoFromWebhook(message.from, value.contacts);
            waId = contactInfo.waId;
            contactName = contactInfo.name;
            toNumber = businessNumber;
        }
        
        // Create message object
        return {
            messageId: message.id,
            wa_id: waId,
            text: message.text?.body || '',
            messageType: message.type || 'text',
            fromNumber: message.from,
            toNumber: toNumber,
            contactName: contactName,
            timestamp: parseInt(message.timestamp) * 1000,
            isOutgoing: isOutgoing,
            status: isOutgoing ? 'sent' : 'received'
        };
        
    } catch (error) {
        console.log('Error creating message object:', error.message);
        return null;
    }
}

/**
 * Get contact information from webhook contacts array
 */
function getContactInfoFromWebhook(fromNumber, contacts) {
    let waId = fromNumber; // Default fallback
    let name = 'Unknown'; // Default name
    
    if (contacts && contacts.length > 0) {
        // Find matching contact
        const contact = contacts.find(c => c.wa_id === fromNumber) || contacts[0];
        
        if (contact) {
            waId = contact.wa_id;
            if (contact.profile?.name) {
                name = contact.profile.name;
            }
        }
    }
    
    return { waId, name };
}

/**
 * Main function to process all webhook files
 */
async function processAllWebhookFiles() {
    console.log('🚀 Starting Webhook Processor...\n');
    
    try {
        // Connect to database
        await connectDatabase();
        
        // Check for webhook-data folder
        const webhookFolder = './webhook-data';
        if (!fs.existsSync(webhookFolder)) {
            console.log(' webhook-data folder not found!');
            console.log(' Please create the folder and add JSON files from WhatsApp webhook');
            return;
        }
        
        // Get all JSON files
        const files = fs.readdirSync(webhookFolder);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            console.log(' No JSON files found in webhook-data folder');
            console.log('Please add webhook JSON files to process');
            return;
        }
        
        console.log(` Found ${jsonFiles.length} JSON file(s) to process\n`);
        
        // Process each file
        for (const fileName of jsonFiles) {
            const filePath = path.join(webhookFolder, fileName);
            await processWebhookFile(filePath);
        }
        
        console.log(`\n Processing completed!`);
        console.log(` Processed ${jsonFiles.length} file(s)`);
        console.log(' You can now start the server: npm start');
        
    } catch (error) {
        console.error(' Fatal error:', error.message);
    }
    
    process.exit(0);
}

// Start processing if this file is run directly
if (require.main === module) {
    processAllWebhookFiles();
}

module.exports = {
    processAllWebhookFiles,
    saveMessage,
    updateMessageStatus
};





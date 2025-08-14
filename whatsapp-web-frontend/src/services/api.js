/**
 * API Service Module
 * Handles all HTTP communication with the backend server.
 */

import axios from 'axios'

// CONFIGURATION

// Backend server URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Request timeout in milliseconds (10 seconds)
const REQUEST_TIMEOUT = 10000


// AXIOS INSTANCE SETUP


//Create axios instance with default configuration
 
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// REQUEST INTERCEPTOR


//Log outgoing requests for debugging

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)


// RESPONSE INTERCEPTOR


// Handle responses and transform errors into user-friendly messages

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(' Response Error:', error.response?.data || error.message)
    
    // Transform different error types into user-friendly messages
    const transformedError = transformApiError(error)
    return Promise.reject(transformedError)
  }
)


// HELPER FUNCTIONS


//Transform API errors into user-friendly messages

const transformApiError = (error) => {
  let message = 'An unexpected error occurred'

  // Network connectivity issues
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    message = 'Cannot connect to server. Please make sure the backend is running.'
  }
  // Server errors
  else if (error.response?.status === 500) {
    message = 'Server error. Please try again later.'
  }
  // Not found errors
  else if (error.response?.status === 404) {
    message = 'Requested data not found.'
  }
  // Timeout errors
  else if (error.code === 'ECONNABORTED') {
    message = 'Request timeout. Please check your connection and try again.'
  }
  // Use server-provided error message if available
  else if (error.response?.data?.error) {
    message = error.response.data.error
  }
  // Fallback to error message
  else if (error.message) {
    message = error.message
  }

  return new Error(message)
}


// Validate required parameters for API calls

const validateParams = (params, required) => {
  for (const param of required) {
    if (!params[param]) {
      throw new Error(`${param} is required`)
    }
  }
}


//Create standardized API response object

const createResponse = (success, data = null, error = null) => {
  const response = { success }
  
  if (success && data !== null) {
    return { ...response, ...data }
  }
  
  if (!success && error) {
    response.error = error
  }
  
  return response
}


// API FUNCTIONS


/**
 * Get all conversations from the backend
 * 
 * Response format:
 * {
 *   success: boolean,
 *   conversations: Array,
 *   total: number
 * }
 */
export const getConversations = async () => {
  try {
    console.log(' Fetching conversations from backend...')
    
    const response = await api.get('/api/conversations')
    
    // Validate response structure
    if (!response.data?.conversations) {
      throw new Error('Invalid response format: missing conversations data')
    }
    
    const conversations = response.data.conversations
    
    console.log(` Successfully fetched ${conversations.length} conversations`)
    
    return createResponse(true, {
      conversations,
      total: conversations.length
    })
  } catch (error) {
    console.error('Failed to fetch conversations:', error.message)
    
    return createResponse(false, null, error.message)
  }
}

/**
 * Get messages for a specific conversation
 * Response format:
 * {
 *   success: boolean,
 *   messages: Array,
 *   total: number
 * }
 */
export const getMessages = async (waId, page = 1, limit = 50) => {
  try {
    // Validate required parameters
    validateParams({ waId }, ['waId'])
    
    console.log(` Fetching messages for conversation: ${waId}`)
    
    const response = await api.get(`/api/conversations/${waId}/messages`, {
      params: { page, limit }
    })
    
    // Check if backend returned success response
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch messages')
    }
    
    const messages = response.data.messages || []
    
    console.log(` Successfully fetched ${messages.length} messages`)
    
    return createResponse(true, {
      messages,
      total: messages.length
    })
  } catch (error) {
    console.error(` Failed to fetch messages for ${waId}:`, error.message)
    
    return createResponse(false, null, error.message)
  }
}

/**
 * Send a new message to a conversation
 * Note: This is a demo function that saves to database only (doesn't send via WhatsApp)
 * Response format:
 * {
 *   success: boolean,
 *   message: Object
 * }
 */
export const sendMessage = async (phoneNumber, text, contactName = 'Unknown') => {
  try {
    // Validate required parameters
    validateParams({ phoneNumber, text }, ['phoneNumber', 'text'])
    
    // Validate text content
    const messageText = text.trim()
    if (!messageText) {
      throw new Error('Message text cannot be empty')
    }
    
    console.log(` Sending message to ${contactName} (${phoneNumber})`)
    
    const response = await api.post(`/api/conversations/${phoneNumber}/messages`, {
      text: messageText,
      contactName
    })
    
    // Debug log for troubleshooting
    console.log(' Backend response:', response.data)
    
    // Validate backend response
    if (!response.data.success || !response.data.message) {
      throw new Error(response.data.error || 'Invalid response from server')
    }
    
    const sentMessage = response.data.message
    
    console.log(' Message sent successfully')
    
    return createResponse(true, { message: sentMessage })
  } catch (error) {
    console.error(` Failed to send message to ${phoneNumber}:`, error.message)
    
    return createResponse(false, null, error.message)
  }
}

/**
 * Check backend server health status
 * Response format:
 * {
 *   success: boolean,
 *   data: Object (server info)
 * }
 */
export const checkHealth = async () => {
  try {
    console.log(' Checking server health...')
    
    const response = await api.get('/api/health')
    
    console.log(' Server health check successful')
    
    return createResponse(true, { data: response.data })
  } catch (error) {
    console.error(' Server health check failed:', error.message)
    
    return createResponse(false, null, error.message)
  }
}


// UTILITY FUNCTIONS

/**
 * Test if backend server is reachable
 * Useful for connection testing and error handling
 */
export const isBackendReachable = async () => {
  try {
    const healthCheck = await checkHealth()
    return healthCheck.success
  } catch (error) {
    console.error(' Backend connectivity test failed:', error.message)
    return false
  }
}


// Get current API configuration for debugging


export const getApiConfig = () => {
  return {
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    environment: import.meta.env.MODE || 'development'
  }
}


// Export the configured axios instance for direct use if needed
export default api


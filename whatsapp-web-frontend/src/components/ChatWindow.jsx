/**
 * ChatWindow Component
 * Main chat interface component that displays messages for a selected conversation.
 */

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Video, MoreVertical, Check, CheckCheck, Plus, Sticker, SendHorizontal, MessageCircle, X, User, Search, Mic } from 'lucide-react'
import { getMessages, sendMessage } from '../services/api'
import { format } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'
import whatsappchatbg from '../assets/whatsappchatbg.jpg'

const ChatWindow = ({ conversation, onBack, onConversationUpdate, isMobile }) => {

  // STATE MANAGEMENT
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  
  // REFS FOR DOM ELEMENTS

  // Reference to scroll to bottom of messages
  const messagesEndRef = useRef(null)
  // Reference to the chat container for scrolling
  const chatContainerRef = useRef(null)
  // Reference to dropdown menu for click outside detection
  const dropdownRef = useRef(null)

 
  // EFFECTS

  /**
   * Load messages when conversation changes
   */
  useEffect(() => {
    if (conversation) {
      loadMessages()
    }
  }, [conversation?.wa_id])

  /**
   * Auto-scroll to bottom when new messages arrive
   * Uses timeout to ensure DOM is updated before scrolling
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages.length])

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

 
  // HELPER FUNCTIONS

  /**
   * Get conversation identifier (wa_id or phoneNumber)
   * This provides backward compatibility
   */
  const getConversationId = () => {
    return conversation.wa_id || conversation.phoneNumber
  }

  /**
   * Scroll chat to the bottom smoothly
   */
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }

  /**
   * Format timestamp to display time (HH:mm format)
   * @param {string|number} timestamp - Message timestamp
   * @returns {string} Formatted time or empty string if invalid
   */
  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return ''
      
      return format(date, 'HH:mm')
    } catch (error) {
      console.error('Error formatting time:', error)
      return ''
    }
  }

  /**
   * Format timestamp to display date (Today, Yesterday, or actual date)
   * @param {string|number} timestamp - Message timestamp
   * @returns {string} Formatted date
   */
const formatMessageDate = (timestamp) => {
  try {
    if (!timestamp) return "Unknown Date";

    const utcDate = new Date(Number(timestamp));
    // Create a date using UTC parts to avoid local timezone shift
    const messageDate = new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate()
    );

    const now = new Date();
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7 && diffDays > -7) return format(messageDate, "EEEE");

    return format(messageDate, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown Date";
  }
};


  /**
   * Get appropriate status icon for outgoing messages
   * @param {string} status - Message status (sent, delivered, read, etc.)
   * @param {boolean} isOutgoing - Whether message is outgoing
   * @returns {JSX.Element|null} Status icon component or null
   */
  const getStatusIcon = (status, isOutgoing) => {
    // Only show status for outgoing messages
    if (!isOutgoing) return null
    
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />
      case 'read':
      case 'seen':
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      default:
        return <Check className="w-4 h-4 text-gray-400" />
    }
  }

  /**
   * Group messages by date for better organization
   * @param {Array} messages - Array of message objects
   * @returns {Array} Array of grouped messages by date
   */
  const groupMessagesByDate = (messages) => {
    // Validate input
    if (!Array.isArray(messages)) {
      console.error('Messages is not an array:', messages)
      return []
    }
    
    const groups = []
    let currentDate = null
    let currentGroup = []

    messages.forEach((message, index) => {
      // Skip invalid messages
      if (!message || typeof message !== 'object') {
        console.error(`Invalid message at index ${index}:`, message)
        return
      }
      
      const messageDate = formatMessageDate(message.timestamp)
      
      // Start new group if date changes
      if (messageDate !== currentDate) {
        // Save previous group
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup })
        }
        // Start new group
        currentDate = messageDate
        currentGroup = [message]
      } else {
        // Add to current group
        currentGroup.push(message)
      }
    })

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup })
    }

    return groups
  }

  // API FUNCTIONS

  /**
   * Load messages from the backend API
   */
  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Loading messages for ${conversation.contactName}...`)
      
      const identifier = getConversationId()
      const response = await getMessages(identifier)
      
      if (response.success) {
        setMessages(response.messages || [])
        console.log(` Loaded ${response.messages?.length || 0} messages`)
      } else {
        throw new Error(response.error || 'Failed to load messages')
      }
    } catch (error) {
      console.error(' Error loading messages:', error)
      setError('Failed to load messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send a new message
   * @param {Event} e - Form submit event
   */
  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    // Prevent sending empty or duplicate messages
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage('') // Clear input immediately for better UX
    setSending(true)

    try {
      console.log(` Sending message to ${conversation.contactName}: ${messageText}`)
      
      const identifier = getConversationId()
      const response = await sendMessage(identifier, messageText, conversation.contactName)
      
      if (response.success) {
        const sentMessage = response.message
        
        // Validate message structure
        if (sentMessage && typeof sentMessage === 'object' && sentMessage.timestamp) {
          // Add message to local state
          setMessages(prev => [...prev, sentMessage])
          
          // Update conversation in parent component
          if (onConversationUpdate) {
            onConversationUpdate({
              wa_id: conversation.wa_id,
              phoneNumber: conversation.phoneNumber,
              lastMessage: messageText,
              lastMessageTime: sentMessage.timestamp
            })
          }
          
          console.log(' Message sent successfully')
        } else {
          throw new Error('Invalid message format received from server')
        }
      } else {
        throw new Error(response.error || 'Failed to send message')
      }
    } catch (error) {
      console.error(' Error sending message:', error)
      // Restore message text on error
      setNewMessage(messageText)
      alert(`Failed to send message: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  /**
   * Handle closing the chat (navigate back)
   */
  const handleCloseChat = () => {
    setShowDropdown(false)
    if (onBack) {
      onBack()
    }
  }

  /**
   * Handle textarea auto-resize
   * @param {Event} e - Input event
   */
  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  /**
   * Handle Enter key press in textarea
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }


  // RENDER CONDITIONS

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner type="circular" size="large" text="Connecting..." />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={loadMessages}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }


  // MAIN RENDER

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* CHAT HEADER */}
  
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and contact info */}
          <div className="flex items-center space-x-4">
          

            {/* Contact avatar */}
            <div className="w-9 h-9 bg-soft-white border border-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" fill="currentColor" />
            </div>

            {/* Contact name */}
            <div>
              <h2 className="text-gray-900 text-base font-medium">
                {conversation.contactName || 'Unknown Contact'}
              </h2>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Video call button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Video className="w-5 h-5" />
            </button>
            
            {/* Search button */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Search className="w-5 h-5 " />
            </button>
            
            {/* More options dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg mx-2 px-2 py-2 z-50">
                  <button
                    onClick={handleCloseChat}
                    className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-soft-white transition-colors cursor-pointer text-left rounded-lg"
                  >
                    <X className="w-4 h-4 mr-3" />
                    Close chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT CONTENT AREA */}
      <div 
        className="flex-1 flex flex-col"
        style={{
          backgroundImage: `url(${whatsappchatbg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      >
        {/* Messages container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4 scroll-smooth"
          style={{
            maxHeight: 'calc(100vh - 150px)',
            overflowAnchor: 'none'
          }}
        >
          {messageGroups.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">Send a message to start the conversation</p>
              </div>
            </div>
          ) : (
            // Message groups
            messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="text-center my-4">
                  <span className="bg-white px-2 py-1 rounded-lg text-xs text-gray-600 shadow-sm">
                    {group.date}
                  </span>
                </div>

                 {/* Messages in this group */}
                <div className="space-y-0">
                  {group.messages.map((message, messageIndex) => {
                    const messageKey = message.messageId || `msg-${groupIndex}-${messageIndex}`
                    
                    return (
                      <div
                        key={messageKey}
                        className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'} mb-1`}
                      >
                        {/* Message bubble */}
                        <div
                          className={`
                            relative max-w-xs lg:max-w-md px-3 py-1 rounded-lg break-words
                            ${message.isOutgoing 
                              ? 'bg-mint-cream text-black' 
                              : 'bg-white text-gray-800'
                            }
                          `}
                          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {/* Message text and time in same line */}
                          <div className="flex items-end justify-between">
                            <div className="text-sm whitespace-pre-wrap leading-5 pr-2">
                              {message.text || 'No content'}
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <span className="text-xxs leading-none text-gray-600">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.isOutgoing && (
                                <div className="flex-shrink-0">
                                  {getStatusIcon(message.status, message.isOutgoing)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
        {/* MESSAGE INPUT AREA */}

        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-end space-x-3 bg-white rounded-full px-2 py-1 shadow-sm max-w-full">
            {/* Attachment buttons */}
            <button className="pb-3 text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0 cursor-pointer">
              <Plus className="w-5 h-5" />
            </button>
            <button className="pb-3 text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors flex-shrink-0 cursor-pointer">
              <Sticker className="w-5 h-5" />
            </button>

            {/* Message input */}
            <div className="flex-1 flex items-end min-w-0">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  rows="1"
                  disabled={sending}
                  className="w-full px-2 py-2 bg-transparent border-0 rounded-lg resize-none focus:outline-none text-sm leading-5 disabled:opacity-50 max-h-20 overflow-y-auto"
                  onKeyPress={handleKeyPress}
                  onInput={handleTextareaInput}
                />
              </div>
            </div>

            {/* Send/Mic button */}
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
              >
                {sending ? (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <SendHorizontal className="w-5 h-5" />
                )}
              </button>
            ) : (
              <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 cursor-pointer">
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow





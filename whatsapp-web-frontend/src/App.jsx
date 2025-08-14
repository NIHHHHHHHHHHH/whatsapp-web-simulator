/**
 * App Component
 * 
 * Main WhatsApp Web-like interface component and root of the application.
 * 
 * Layout Structure:
 * - Sidebar: Fixed width on desktop, full width on mobile
 * - Main Content: Chat window or welcome screen
 * - Responsive breakpoint at 768px
 */

import React, { useState, useEffect } from 'react'
import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'
import WelcomeScreen from './components/WelcomeScreen'
import LoadingSpinner from './components/LoadingSpinner'
import { getConversations } from './services/api.js'
import './index.css'

function App() {

  // STATE MANAGEMENT
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  
  // CONSTANTS
  const MOBILE_BREAKPOINT = 768


  // EFFECTS

  
  // Detect and monitor mobile screen size changes
  
  useEffect(() => {
    const checkMobileView = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }

    // Initial check
    checkMobileView()

    // Listen for window resize events
    window.addEventListener('resize', checkMobileView)

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  
// Load conversations when component mounts
   
  useEffect(() => {
    loadConversations()
  }, [])

  // HELPER FUNCTIONS

  
  // Sort conversations by last message time (most recent first)


  const sortConversationsByTime = (conversations) => {
    return [...conversations].sort((a, b) => 
      new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
    )
  }

  
  // * Update a specific conversation in the list

  const updateConversationInList = (updatedConversation) => {
    setConversations(prevConversations => {
      const updated = prevConversations.map(conversation => 
        conversation.phoneNumber === updatedConversation.phoneNumber 
          ? { ...conversation, ...updatedConversation }
          : conversation
      )
      
      // Sort by last message time after update
      return sortConversationsByTime(updated)
    })
  }


  // API FUNCTIONS

  /**
   * Fetch conversations from the backend API
   * Handles loading states and error management
   */
  const loadConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📱 Loading conversations...')
      
      const response = await getConversations()
      
      // Validate response structure
      if (response.conversations) {
        const sortedConversations = sortConversationsByTime(response.conversations)
        setConversations(sortedConversations)
        console.log(`✅ Loaded ${response.conversations.length} conversations`)
      } else {
        throw new Error('No conversations data received from server')
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error)
      setError('Failed to load conversations. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

 
  // EVENT HANDLERS

 
  // Handle chat selection from sidebar
   
  const handleChatSelect = (conversation) => {
    if (!conversation) {
      console.error('Invalid conversation selected')
      return
    }

    console.log(`💬 Selected chat with: ${conversation.contactName || 'Unknown Contact'}`)
    setSelectedChat(conversation)
  }

  /**
   * Handle back navigation from chat to sidebar
   * Used primarily on mobile devices
   */
  const handleBackToSidebar = () => {
    console.log('🔙 Navigating back to sidebar')
    setSelectedChat(null)
  }

  /**
   * Handle conversation updates when new messages are sent/received
   * Updates the conversation list and maintains sorting
   */
  const handleConversationUpdate = (updatedConversation) => {
    if (!updatedConversation) {
      console.error('Invalid conversation update data')
      return
    }

    console.log(`🔄 Updating conversation: ${updatedConversation.phoneNumber}`)
    updateConversationInList(updatedConversation)
  }

  
  // Handle retry action when loading fails
  
  const handleRetry = () => {
    console.log('🔄 Retrying to load conversations...')
    loadConversations()
  }

 
  // RENDER CONDITIONS

  // Show loading spinner while data is loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner type="circular" size="large" text="Connecting..." />
      </div>
    )
  }

  // Show error screen if loading failed
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button 
            onClick={handleRetry}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // MAIN RENDER

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* SIDEBAR - CONVERSATION LIST */}
    
       <div className={`
        ${isMobile ? 'w-full' : 'max-w-md xl:max-w-lg 2xl:max-w-xl'} 
        ${isMobile && selectedChat ? 'hidden' : 'block'}
        border-r border-gray-300 bg-white flex-shrink-0 lg:min-w-md xl:min-w-lg 2xl:min-w-xl
      `}> 
  
        <ChatSidebar 
          conversations={conversations}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          onRefresh={loadConversations}
        />
      </div>
      {/* MAIN CONTENT AREA */}
    
      <div className={`
        ${isMobile ? 'w-full' : 'flex-1 '} 
        ${isMobile && !selectedChat ? 'hidden' : 'block'}
        relative
      `}>
        {selectedChat ? (
          // Show Chat Window when a conversation is selected
          <ChatWindow 
            conversation={selectedChat}
            onBack={handleBackToSidebar}
            onConversationUpdate={handleConversationUpdate}
            isMobile={isMobile}
          />
        ) : (
          // Show Welcome Screen on desktop when no chat is selected
          !isMobile && <WelcomeScreen />
        )}
      </div>
    </div>
  )
}

export default App





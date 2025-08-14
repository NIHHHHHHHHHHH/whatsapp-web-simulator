/**
 * ChatSidebar Component
 * Left sidebar component displaying conversation list and navigation.
 */

import React, { useState } from 'react'
import { 
  Search, MessageSquareText, User, Circle, Lock, Settings, Users, 
  CircleDashed, MessageCircleMore, MessageSquarePlus, EllipsisVertical, CircleUser, ChevronDown 
} from 'lucide-react'

const ChatSidebar = ({ conversations, selectedChat, onChatSelect, onRefresh }) => {
 
  // STATE MANAGEMENT
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  // CONSTANTS

  const tabs = ['All', 'Unread', 'Favourites', 'Groups']

  // HELPER FUNCTIONS

  /**
   * Filter conversations based on search term
   * Searches through contact name, phone number, and last message
   */
  const getFilteredConversations = () => {
    if (!searchTerm.trim()) return conversations

    return conversations.filter(conversation => {
      // Skip invalid conversations
      if (!conversation) return false

      const name = conversation.contactName?.toLowerCase() || ''
      const phone = conversation.phoneNumber || ''
      const lastMsg = conversation.lastMessage?.toLowerCase() || ''
      const searchLower = searchTerm.toLowerCase()

      return (
        name.includes(searchLower) ||
        phone.includes(searchTerm) ||
        lastMsg.includes(searchLower)
      )
    })
  }

  /**
   * Format timestamp for message time display
   * Shows time for today, day name for this week, or date for older messages
   */
  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return ''

      const date = new Date(timestamp)
      const now = new Date()
      
      // If message is from today, show time (e.g., "2:30 PM")
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      }
      
      // If message is from this week, show day name (e.g., "Mon")
      const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      if (daysDiff < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      // For older messages, show date (e.g., "Jan 15")
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch (error) {
      console.error('Error formatting message time:', error)
      return ''
    }
  }

  /**
   * Get unique key for conversation
   * Uses wa_id as primary key, falls back to phoneNumber
   */
  const getConversationKey = (conversation) => {
    return conversation.wa_id || conversation.phoneNumber
  }

  
   //Check if conversation is currently selected
   
  const isConversationSelected = (conversation) => {
    if (!selectedChat) return false
    
    return selectedChat.wa_id === conversation.wa_id || 
           selectedChat.phoneNumber === conversation.phoneNumber
  }

  
   //Handle search input change
   
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  
   //Handle tab selection
   
  const handleTabSelect = (tab) => {
    setActiveTab(tab)
  }

 
  // RENDER DATA

  
  const filteredConversations = getFilteredConversations()

  return (
    <div className="h-full flex bg-white">
      {/* LEFT NAVIGATION SIDEBAR */}
  
      <div className="w-16 bg-soft-white flex flex-col items-center py-4 space-y-4">
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-1">
          {/* Chat Messages */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <MessageSquareText className="w-5 h-5" />
          </button>
          
          {/* Status Updates */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <CircleDashed className="w-5 h-5" />
          </button>
          
          {/* Channels */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <MessageCircleMore className="w-5 h-5" />
          </button>
          
          {/* Communities */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
          
          {/* Divider */}
          <div className="w-full border-t border-gray-300 my-2"></div>
         
          {/* Meta AI */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer">
            <Circle className="w-5 h-5" color="#007bff" strokeWidth={4} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col space-y-1">
          {/* Settings */}
          <button className="w-10 h-10 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Profile */}
          <button className="w-10 h-10 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors cursor-pointer">
            <CircleUser className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN CHAT LIST AREA */}
    
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="bg-white border-gray-200 px-6 py-4">
          {/* App Title and Actions */}
          <div className="flex items-center justify-between mb-4">
            <h1 className=" text-xl sm:text-2xl font-semibold text-forest-green">WhatsApp</h1>
            
            {/* Header Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* New Chat */}
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <MessageSquarePlus className="w-5 h-5" />
              </button>
              
              {/* More Options */}
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <EllipsisVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-soft-white border-0 rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
      <div className="bg-white px-6 py-2">
         {/* Desktop tabs (above 400px) */}
         <div className=" space-x-2 min-[400px]:flex hidden">
           {tabs.map((tab) => (
             <button
               key={tab}
               onClick={() => handleTabSelect(tab)}
               className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border border-gray-300 ${
                 activeTab === tab
                   ? 'bg-mint-cream text-black'
                   : 'text-gray-600 hover:bg-soft-white'
               }`}
             >
               {tab}
             </button>
           ))}
         </div>

             {/* Mobile dropdown (below 400px) */}
             <div className="min-[400px]:hidden relative">
               <select
                 value={activeTab}
                 onChange={(e) => handleTabSelect(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm font-medium bg-soft-white appearance-none cursor-pointer pr-8 text-gray-600"
               >
                 {tabs.map((tab) => (
                   <option key={tab} value={tab}>
                     {tab}
                   </option>
                 ))}
               </select>
               {/* Custom dropdown arrow */}
               <ChevronDown 
                 size={16} 
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
               />
             </div>
          </div>

        {/* CONVERSATIONS LIST */}
      
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-gray-500 px-8">
              {searchTerm ? (
                // No Search Results
                <>
                  <Search className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No conversations found</p>
                  <p className="text-sm text-center">Try searching for something else</p>
                </>
              ) : (
                // No Conversations
                <>
                  <MessageSquareText className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No conversations yet</p>
                  <p className="text-sm text-center text-gray-400">
                    Run the webhook processor to load data
                  </p>
                </>
              )}
            </div>
          ) : (
            // Conversation List
            <div className="">
              {filteredConversations.map((conversation) => (
                <div
                  key={getConversationKey(conversation)}
                  onClick={() => onChatSelect(conversation)}
                  className={`
                    flex items-center mx-2 px-4 my-1 py-2 cursor-pointer transition-colors relative rounded-xl
                    ${isConversationSelected(conversation) 
                      ? 'bg-soft-white' 
                      : 'hover:bg-soft-white'} 
                  `}
                >
                  {/* Profile Picture */}
                  <div className="relative mr-3">
                    <div className="w-12 h-12 bg-soft-white border border-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row - Name and Time */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-gray-900 truncate text-base font-medium">
                        {conversation.contactName || 'Unknown Contact'}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>

                    {/* Bottom Row - Message Preview and Unread Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      
                      {/* Unread Message Count Badge */}
                      {conversation.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0 min-w-[20px] text-center font-medium">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
   
        <div className="border-t border-gray-300 px-6 py-3">
          <div className="flex items-center justify-center text-xs text-black">
            <Lock className="w-3 h-3 mr-1" />
            <span>
              Your personal messages are{' '}
              <span className="text-green-800 ml-1 font-semibold">
                end-to-end encrypted
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSidebar










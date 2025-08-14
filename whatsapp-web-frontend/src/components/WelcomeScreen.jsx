/**
 * WelcomeScreen Component
 * Landing screen displayed when no conversation is selected (desktop only).
 */

import React from 'react'
import { Lock } from 'lucide-react'
import whatsappLaptop from '../assets/whatsapp-laptop.png'

const WelcomeScreen = () => {

  
  // MAIN RENDER

  return (
    <div className="h-full flex flex-col bg-soft-white">
    
      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="text-center max-w-2xl">
          {/* Hero Image */}
          <div className="mb-8">
            <img
              src={whatsappLaptop}
              alt="Laptop displaying WhatsApp video call interface"
              className="w-80 h-auto mx-auto"
              loading="lazy"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-light text-gray-800 mb-4 leading-tight">
            Download WhatsApp for Windows
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
            Make calls, share your screen and get a faster experience when you download the Windows app.
          </p>

          {/* Download Button */}
          <button 
            className="bg-forest-green hover:bg-green-500 text-white font-medium py-3 px-6 rounded-full text-sm transition-colors cursor-pointer duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download
          </button>
        </div>
      </div>

     
      {/* FOOTER - ENCRYPTION MESSAGE */}
      <div className="pb-12 flex justify-center items-center text-gray-500 text-xs">
        <Lock className="w-4 h-4 mr-2 flex-shrink-0" />
        <span>Your personal messages are end-to-end encrypted</span>
      </div>
    </div>
  )
}

export default WelcomeScreen


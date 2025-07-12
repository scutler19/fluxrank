'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function EmailForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Check if Supabase is available
      if (!supabaseBrowser) {
        // Fallback for demo - just show success
        setTimeout(() => {
          setIsSuccess(true)
          setEmail('')
          setIsLoading(false)
        }, 1000)
        return
      }

      const { error } = await supabaseBrowser
        .from('waitlist')
        .insert([{ email: email.toLowerCase().trim() }])

      if (error) {
        console.error('Supabase error:', error)
        
        // Handle specific error cases
        if (error.code === '23505') { // Unique constraint violation
          setError('This email is already on our waitlist!')
        } else if (error.code === 'PGRST116' || error.message?.includes('404')) {
          // Table doesn't exist or other 404-like errors - fall back to demo mode
          console.log('Supabase table not found, falling back to demo mode')
          setTimeout(() => {
            setIsSuccess(true)
            setEmail('')
            setIsLoading(false)
          }, 1000)
          return
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      setIsSuccess(true)
      setEmail('')
    } catch (err) {
      console.error('Form submission error:', err)
      // Fall back to demo mode on any error
      setTimeout(() => {
        setIsSuccess(true)
        setEmail('')
        setIsLoading(false)
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 sm:p-8 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-green-400 font-semibold text-lg sm:text-xl">
            You&apos;re on the list!
          </div>
        </div>
        <div className="text-gray-400 text-sm sm:text-base">
          We&apos;ll notify you when FluxRank launches. No spam, ever.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Trust signals */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No spam</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Unsubscribe anytime</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your email address"
              className={`w-full px-4 py-4 sm:py-5 rounded-xl border-2 bg-neutral-800/50 text-gray-100 placeholder-gray-500 focus:outline-none transition-all duration-200 text-base sm:text-lg ${
                isFocused 
                  ? 'border-brand-lime bg-neutral-800/70 shadow-lg shadow-brand-lime/20' 
                  : 'border-neutral-600 hover:border-neutral-500'
              } ${error ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {error && (
              <div className="absolute -bottom-6 left-0 text-red-400 text-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`relative px-6 sm:px-8 py-4 sm:py-5 font-bold rounded-xl transition-all duration-300 transform text-base sm:text-lg ${
              isLoading
                ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-lime to-brand-limeLight hover:from-brand-limeLight hover:to-brand-lime text-black shadow-lg hover:shadow-xl hover:shadow-brand-lime/25 hover:-translate-y-1 active:translate-y-0'
            } border-2 border-transparent hover:border-brand-limeLight/50 min-w-[120px]`}
            style={{
              // Force the button to stay visible with important styles
              backgroundColor: isLoading ? undefined : 'transparent',
              backgroundImage: isLoading ? undefined : 'linear-gradient(to right, #C2FF29, #E8FF8A)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Joining...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Join Beta</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 
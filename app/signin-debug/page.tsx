'use client'

import { useState } from 'react'
import { useAuth } from '@/components/context/AuthContext'

export default function SignInDebug() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  
  const { signIn, user, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Signing in...')
    
    try {
      const result = await signIn(email, password)
      if (result.error) {
        setMessage(`Error: ${result.error.message}`)
      } else {
        setMessage('Sign in successful!')
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Sign In</h1>
        
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <p><strong>Auth Status:</strong></p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
          <p>User Email: {user?.email || 'None'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded text-sm">
            {message}
          </div>
        )}
        
        <p className="mt-4 text-center text-sm text-gray-600">
          This debug page shows auth status and doesn't redirect.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface CorsDebugInfo {
  currentDomain: string
  supabaseUrl: string
  hasEnvVars: boolean
  corsTest: string
  networkTest: string
  authTest: string
}

export default function CorsDebugger() {
  const [debugInfo, setDebugInfo] = useState<CorsDebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or if there are CORS errors
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show-cors-debugger') === 'true'
    setIsVisible(shouldShow)

    if (shouldShow) {
      runDiagnostics()
    }
  }, [])

  const runDiagnostics = async () => {
    const info: CorsDebugInfo = {
      currentDomain: window.location.origin,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      hasEnvVars: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      corsTest: 'Testing...',
      networkTest: 'Testing...',
      authTest: 'Testing...'
    }

    setDebugInfo(info)

    // Test 1: Basic CORS test
    try {
      const response = await fetch(`${info.supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json'
        }
      })
      info.corsTest = response.ok ? '✅ CORS OK' : `❌ CORS Failed (${response.status})`
    } catch (error: any) {
      info.corsTest = `❌ CORS Error: ${error.message}`
    }

    // Test 2: Network connectivity
    try {
      const response = await fetch(`${info.supabaseUrl}/health`)
      info.networkTest = response.ok ? '✅ Network OK' : `❌ Network Failed (${response.status})`
    } catch (error: any) {
      info.networkTest = `❌ Network Error: ${error.message}`
    }

    // Test 3: Auth endpoint
    try {
      const response = await fetch(`${info.supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        }
      })
      info.authTest = response.ok ? '✅ Auth OK' : `❌ Auth Failed (${response.status})`
    } catch (error: any) {
      info.authTest = `❌ Auth Error: ${error.message}`
    }

    setDebugInfo({ ...info })
  }

  const copyDebugInfo = () => {
    if (debugInfo) {
      const text = `
CORS Debug Information:
- Current Domain: ${debugInfo.currentDomain}
- Supabase URL: ${debugInfo.supabaseUrl}
- Environment Variables: ${debugInfo.hasEnvVars ? 'Set' : 'Missing'}
- CORS Test: ${debugInfo.corsTest}
- Network Test: ${debugInfo.networkTest}
- Auth Test: ${debugInfo.authTest}
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
      `
      navigator.clipboard.writeText(text)
      alert('Debug info copied to clipboard!')
    }
  }

  if (!isVisible || !debugInfo) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-red-800">CORS Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </div>
      
      <div className="text-sm space-y-1 text-red-700">
        <div><strong>Domain:</strong> {debugInfo.currentDomain}</div>
        <div><strong>Supabase:</strong> {debugInfo.supabaseUrl}</div>
        <div><strong>Env Vars:</strong> {debugInfo.hasEnvVars ? '✅' : '❌'}</div>
        <div><strong>CORS:</strong> {debugInfo.corsTest}</div>
        <div><strong>Network:</strong> {debugInfo.networkTest}</div>
        <div><strong>Auth:</strong> {debugInfo.authTest}</div>
      </div>

      <div className="mt-3 space-x-2">
        <button 
          onClick={runDiagnostics}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
        >
          Retest
        </button>
        <button 
          onClick={copyDebugInfo}
          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          Copy Info
        </button>
      </div>

      <div className="mt-2 text-xs text-red-600">
        <strong>Fix:</strong> Add "{debugInfo.currentDomain}" to Supabase Dashboard → Authentication → URL Configuration
      </div>
    </div>
  )
}

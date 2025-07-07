"use client"

import { useState, useEffect } from "react"

export default function ImageDebug() {
  const [results, setResults] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Test different image loading methods
    const testMethods = [
      { name: 'Direct Path', src: '/images/premium-bus.jpg' },
      { name: 'With Domain', src: 'http://localhost:3000/images/premium-bus.jpg' },
      { name: 'Bus Fleet', src: '/images/bus-fleet.jpg' },
      { name: 'Logo', src: '/images/nandighosh-logo.png' },
    ]

    testMethods.forEach(({ name, src }) => {
      const img = new Image()
      img.onload = () => {
        setResults(prev => ({ ...prev, [name]: `✅ Loaded (${img.naturalWidth}x${img.naturalHeight})` }))
      }
      img.onerror = (e) => {
        setResults(prev => ({ ...prev, [name]: `❌ Failed to load` }))
      }
      img.src = src
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Image Loading Debug</h1>
      
      {/* Test Results */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Loading Test Results</h2>
        {Object.entries(results).map(([method, result]) => (
          <div key={method} className="mb-2">
            <strong>{method}:</strong> {result}
          </div>
        ))}
      </div>

      {/* Simple IMG tags */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Simple IMG Tags</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <h3 className="font-medium mb-2">Premium Bus</h3>
            <div className="w-full h-48 border-2 border-red-500 bg-yellow-100 relative">
              <img 
                src="/images/premium-bus.jpg" 
                alt="Premium Bus"
                className="w-full h-full object-cover"
                onLoad={(e) => console.log('Premium bus loaded:', e.target)}
                onError={(e) => console.error('Premium bus error:', e.target)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Bus Fleet</h3>
            <div className="w-full h-48 border-2 border-blue-500 bg-green-100 relative">
              <img 
                src="/images/bus-fleet.jpg" 
                alt="Bus Fleet"
                className="w-full h-full object-cover"
                onLoad={(e) => console.log('Bus fleet loaded:', e.target)}
                onError={(e) => console.error('Bus fleet error:', e.target)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Logo</h3>
            <div className="w-full h-48 border-2 border-green-500 bg-blue-100 relative">
              <img 
                src="/images/nandighosh-logo.png" 
                alt="Logo"
                className="w-full h-full object-contain"
                onLoad={(e) => console.log('Logo loaded:', e.target)}
                onError={(e) => console.error('Logo error:', e.target)}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Background Image Test */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Background Image Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <h3 className="font-medium mb-2">Premium Bus (Background)</h3>
            <div 
              className="w-full h-48 border-2 border-purple-500 bg-red-100"
              style={{ backgroundImage: 'url(/images/premium-bus.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-white">
                Background Image Test
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Bus Fleet (Background)</h3>
            <div 
              className="w-full h-48 border-2 border-orange-500 bg-purple-100"
              style={{ backgroundImage: 'url(/images/bus-fleet.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-white">
                Background Image Test
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to Main Page
        </a>
      </div>
    </div>
  )
}

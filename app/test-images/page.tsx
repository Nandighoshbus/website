"use client"

import { useState } from "react"

export default function TestImages() {
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({})
  const [imageErrors, setImageErrors] = useState<{[key: string]: string}>({})

  const handleImageLoad = (imageName: string) => {
    console.log(`${imageName} loaded successfully`)
    setImageLoaded(prev => ({ ...prev, [imageName]: true }))
  }

  const handleImageError = (imageName: string, error: any) => {
    console.error(`${imageName} failed to load:`, error)
    setImageErrors(prev => ({ ...prev, [imageName]: error.type || 'Unknown error' }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>
      
      {/* Simple image test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Simple Image Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Premium Bus Image */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Premium Bus</h3>
            <div className="relative w-full h-64 bg-gray-200 rounded">
              <img 
                src="/images/premium-bus.jpg" 
                alt="Premium Bus"
                className="w-full h-full object-cover rounded"
                onLoad={() => handleImageLoad('premium-bus')}
                onError={(e) => handleImageError('premium-bus', e)}
              />
              {imageLoaded['premium-bus'] && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  ✓ Loaded
                </div>
              )}
              {imageErrors['premium-bus'] && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded">
                  <div className="text-red-600 text-center">
                    <div className="font-semibold">Failed to load</div>
                    <div className="text-sm">{imageErrors['premium-bus']}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bus Fleet Image */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Bus Fleet</h3>
            <div className="relative w-full h-64 bg-gray-200 rounded">
              <img 
                src="/images/bus-fleet.jpg" 
                alt="Bus Fleet"
                className="w-full h-full object-cover rounded"
                onLoad={() => handleImageLoad('bus-fleet')}
                onError={(e) => handleImageError('bus-fleet', e)}
              />
              {imageLoaded['bus-fleet'] && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  ✓ Loaded
                </div>
              )}
              {imageErrors['bus-fleet'] && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded">
                  <div className="text-red-600 text-center">
                    <div className="font-semibold">Failed to load</div>
                    <div className="text-sm">{imageErrors['bus-fleet']}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test with Next.js Image component */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Next.js Image Component Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Premium Bus (Next Image)</h3>
            <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
              <img 
                src="/images/premium-bus.jpg" 
                alt="Premium Bus Next"
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad('premium-bus-next')}
                onError={(e) => handleImageError('premium-bus-next', e)}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Bus Fleet (Next Image)</h3>
            <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
              <img 
                src="/images/bus-fleet.jpg" 
                alt="Bus Fleet Next"
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad('bus-fleet-next')}
                onError={(e) => handleImageError('bus-fleet-next', e)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2">
          <div>Image Load Status: {JSON.stringify(imageLoaded, null, 2)}</div>
          <div>Image Errors: {JSON.stringify(imageErrors, null, 2)}</div>
          <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</div>
        </div>
      </div>

      {/* Back to main page */}
      <div className="mt-8">
        <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to Main Page
        </a>
      </div>
    </div>
  )
}

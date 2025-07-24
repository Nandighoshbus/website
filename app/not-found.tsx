import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h3>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the page you're looking for.</p>
        <Link 
          href="/"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

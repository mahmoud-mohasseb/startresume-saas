import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full justify-center"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Need help? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</Link></p>
        </div>
      </div>
    </div>
  )
}

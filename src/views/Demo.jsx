import React from 'react'
import { AlertCircle } from 'lucide-react'

const Demo = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-orange-400 mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Demo Page</h1>
        <p className="text-gray-600">
          This page is available for future demo functionality.
        </p>
      </div>
    </div>
  )
}

export default Demo

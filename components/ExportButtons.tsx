"use client"

import { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ExportButtonsProps {
  content: string
  filename?: string
  className?: string
  disabled?: boolean
  selectedTemplate?: string
  showPreview?: boolean
}

export function ExportButtons({ 
  content, 
  filename = 'document', 
  className = '',
  disabled = false,
  selectedTemplate,
  showPreview
}: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingDOCX, setIsExportingDOCX] = useState(false)

  const exportToPDF = async () => {
    if (!content.trim()) {
      toast.error('No content to export')
      return
    }

    try {
      setIsExportingPDF(true)
      
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: content,
          filename: `${filename}.pdf`
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF exported successfully')
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('Export failed, please try again')
    } finally {
      setIsExportingPDF(false)
    }
  }

  const exportToDOCX = async () => {
    if (!content.trim()) {
      toast.error('No content to export')
      return
    }

    try {
      setIsExportingDOCX(true)
      
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: content,
          filename: `${filename}.docx`
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${filename}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('DOCX exported successfully')
    } catch (error) {
      console.error('DOCX export failed:', error)
      toast.error('Export failed, please try again')
    } finally {
      setIsExportingDOCX(false)
    }
  }

  const isExporting = isExportingPDF || isExportingDOCX

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Download className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Export as:</span>
      </div>

      {/* PDF Export Button */}
      <button
        onClick={exportToPDF}
        disabled={disabled || isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExportingPDF ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>{isExportingPDF ? 'Exporting...' : 'PDF'}</span>
      </button>

      {/* DOCX Export Button */}
      <button
        onClick={exportToDOCX}
        disabled={disabled || isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExportingDOCX ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <File className="w-4 h-4" />
        )}
        <span>{isExportingDOCX ? 'Exporting...' : 'DOCX'}</span>
      </button>
    </div>
  )
}

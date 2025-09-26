"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  FileText, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react'

interface ResumePreviewProps {
  generatedHtml: string
  isGenerating: boolean
  error?: string
  onRetry?: () => void
  className?: string
}

export function ResumePreview({ 
  generatedHtml, 
  isGenerating, 
  error, 
  onRetry,
  className = ""
}: ResumePreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))
  const handleResetZoom = () => setZoom(100)

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-muted rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-4/6"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-4/5"></div>
          <div className="h-3 bg-muted rounded w-3/5"></div>
        </div>
      </div>
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className="flex items-center justify-center h-[600px] text-muted-foreground">
      <div className="text-center space-y-4">
        <FileText className="h-16 w-16 mx-auto opacity-50" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">Ready to create your resume?</h3>
          <p className="text-sm max-w-sm">Fill in your information and click "Generate AI Resume" to see your professional resume come to life.</p>
        </div>
      </div>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className="flex items-center justify-center h-[600px] text-center">
      <div className="space-y-4">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">Generation Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error || "We couldn't generate your resume. Please check your information and try again."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}
      </div>
    </div>
  )

  // Generating state component
  const GeneratingState = () => (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 mx-auto text-primary-500 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">Generating Your Resume</h3>
          <p className="text-sm text-muted-foreground">Our AI is crafting your professional resume...</p>
        </div>
        <LoadingSkeleton />
      </div>
    </div>
  )

  const PreviewContent = () => {
    if (isGenerating) return <GeneratingState />
    if (error) return <ErrorState />
    if (!generatedHtml) return <EmptyState />

    return (
      <div 
        className="w-full h-full overflow-auto bg-white"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
      >
        <div 
          className="p-6 text-sm leading-relaxed text-gray-900 [&_*]:text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-900 [&_li]:text-gray-900 [&_span]:text-gray-900"
          dangerouslySetInnerHTML={{ __html: generatedHtml }}
        />
      </div>
    )
  }

  return (
    <div className={`bg-card rounded-xl border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
        </div>
        
        {generatedHtml && !isGenerating && (
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1 hover:bg-background rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium px-2 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 150}
                className="p-1 hover:bg-background rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            
            {/* Reset Zoom */}
            {zoom !== 100 && (
              <button
                onClick={handleResetZoom}
                className="btn-secondary text-xs px-3 py-1"
                title="Reset Zoom"
              >
                Reset
              </button>
            )}
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="relative">
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-[600px]'} overflow-hidden`}>
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsFullscreen(false)}
                className="btn-secondary"
              >
                Exit Fullscreen
              </button>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isGenerating ? 'generating' : error ? 'error' : generatedHtml ? 'content' : 'empty'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <PreviewContent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      {generatedHtml && !isGenerating && !error && (
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Resume generated successfully</span>
            <span>Use export buttons to download</span>
          </div>
        </div>
      )}
    </div>
  )
}

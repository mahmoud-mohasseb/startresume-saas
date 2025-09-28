"use client"

import { useState, useEffect, useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { createClient } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { Save, FileText } from 'lucide-react'

interface EditorProps {
  initialContent?: string
  onContentChange?: (content: string) => void
  onSave?: (content: string) => Promise<void>
  placeholder?: string
  autoSaveInterval?: number
  className?: string
}

export function Editor({
  initialContent = '',
  onContentChange,
  onSave,
  placeholder = 'Start writing...',
  autoSaveInterval = 5000,
  className = ''
}: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const { user } = useUser()
  const editorRef = useRef<any>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize Supabase client
  const [supabase, setSupabase] = useState<any>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabase(createClient())
    }
  }, [])

  // Initialize content when initialContent changes
  useEffect(() => {
    if (initialContent && initialContent !== content) {
      setContent(initialContent)
      setWordCount(calculateWordCount(initialContent))
      
      // Update CKEditor content if editor is ready
      if (editorRef.current) {
        editorRef.current.setData(initialContent)
      }
    }
  }, [initialContent])

  // Auto-save functionality
  useEffect(() => {
    if (!onSave || !content || content === initialContent) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        await onSave(content)
        setLastSaved(new Date())
        toast.success('Auto-saved successfully')
      } catch (error) {
        console.error('Auto-save failed:', error)
        toast.error('Auto-save failed')
      } finally {
        setIsSaving(false)
      }
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content, onSave, autoSaveInterval, initialContent])

  // Word count calculation
  const calculateWordCount = (htmlContent: string) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim()
    return textContent ? textContent.split(/\s+/).length : 0
  }

  // Handle content change
  const handleContentChange = (event: any, editor: any) => {
    const data = editor.getData()
    setContent(data)
    setWordCount(calculateWordCount(data))
    onContentChange?.(data)
  }

  // Image upload adapter
  const uploadAdapter = (loader: any) => {
    return {
      upload: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const file = await loader.file
            
            if (!supabase || !user) {
              reject('Authentication required for image upload')
              return
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
              .from('editor-images')
              .upload(fileName, file)

            if (error) {
              reject(error.message)
              return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('editor-images')
              .getPublicUrl(fileName)

            resolve({
              default: publicUrl
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    }
  }

  // Force text visibility with JavaScript intervention
  useEffect(() => {
    const forceTextVisibility = () => {
      // Target all CKEditor elements
      const editors = document.querySelectorAll('.ck-editor__editable, .ck-content')
      
      editors.forEach(editor => {
        // Force background and text color
        if (editor instanceof HTMLElement) {
          editor.style.setProperty('background-color', '#ffffff', 'important')
          editor.style.setProperty('color', '#000000', 'important')
          
          // Force all child elements
          const allElements = editor.querySelectorAll('*')
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.setProperty('color', '#000000', 'important')
              el.style.setProperty('opacity', '1', 'important')
              el.style.setProperty('visibility', 'visible', 'important')
              
              // Remove any problematic styles
              el.style.removeProperty('text-shadow')
              el.style.removeProperty('background-color')
              
              // Force specific elements
              if (el.tagName.match(/^H[1-6]$/)) {
                el.style.setProperty('font-weight', 'bold', 'important')
                el.style.setProperty('color', '#000000', 'important')
              }
            }
          })
        }
      })
    }

    // Run immediately
    forceTextVisibility()
    
    // Run on content changes
    const observer = new MutationObserver(forceTextVisibility)
    const editorElements = document.querySelectorAll('.ck-editor__editable, .ck-content')
    
    editorElements.forEach(el => {
      observer.observe(el, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    })

    // Run periodically as fallback
    const interval = setInterval(forceTextVisibility, 1000)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [content])

  // Inject CSS directly into document head
  useEffect(() => {
    const styleId = 'ckeditor-force-visibility'
    let existingStyle = document.getElementById(styleId)
    
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      /* FORCE CKEDITOR TEXT VISIBILITY - NUCLEAR APPROACH */
      .ck-editor__editable,
      .ck-content,
      .ck-editor__editable *,
      .ck-content * {
        color: #000000 !important;
        background-color: transparent !important;
        opacity: 1 !important;
        visibility: visible !important;
        text-shadow: none !important;
      }
      
      .ck-editor__editable,
      .ck-content {
        background-color: #ffffff !important;
        border: 1px solid #e5e7eb !important;
      }
      
      .ck-content h1, .ck-content h2, .ck-content h3, 
      .ck-content h4, .ck-content h5, .ck-content h6,
      .ck-editor__editable h1, .ck-editor__editable h2, .ck-editor__editable h3,
      .ck-editor__editable h4, .ck-editor__editable h5, .ck-editor__editable h6 {
        color: #000000 !important;
        font-weight: bold !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
      }
      
      .ck-content p, .ck-content div, .ck-content span,
      .ck-editor__editable p, .ck-editor__editable div, .ck-editor__editable span {
        color: #000000 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Override any inline styles */
      .ck-content [style*="color"],
      .ck-editor__editable [style*="color"] {
        color: #000000 !important;
      }
      
      /* Dark mode overrides */
      .dark .ck-editor__editable,
      .dark .ck-content,
      .dark .ck-editor__editable *,
      .dark .ck-content * {
        color: #000000 !important;
        background-color: transparent !important;
      }
      
      .dark .ck-editor__editable,
      .dark .ck-content {
        background-color: #ffffff !important;
      }
    `
    
    document.head.appendChild(style)
    
    return () => {
      const styleToRemove = document.getElementById(styleId)
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [])

  // CKEditor configuration
  const editorConfig: any = {
    placeholder,
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'alignment',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      'imageUpload',
      'mediaEmbed',
      '|',
      'sourceEditing',
      '|',
      'undo',
      'redo'
    ],
    fontColor: {
      colors: [
        {
          color: '#000000',
          label: 'Black'
        },
        {
          color: '#333333',
          label: 'Dark Gray'
        }
      ]
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
      ]
    },
    image: {
      upload: {
        types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
        allowMultipleFiles: false
      },
      toolbar: [
        'imageTextAlternative',
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ]
    },
    link: {
      decorators: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file'
          }
        }
      }
    },
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true
        }
      ]
    },
    editorConfig: {
      contentsCss: [
        'body { color: #000000 !important; background: #ffffff !important; font-family: system-ui, -apple-system, sans-serif !important; }',
        '* { color: #000000 !important; }'
      ]
    }
  }

  // Manual save function
  const handleManualSave = async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      await onSave(content)
      setLastSaved(new Date())
      toast.success('Saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-t-xl dark:bg-gray-800/50 dark:border-gray-600">
        <div className="flex items-center space-x-4">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Words: <span className="font-medium text-gray-900 dark:text-white">{wordCount}</span>
          </div>
          {lastSaved && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isSaving && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin dark:border-blue-400"></div>
              <span>Saving...</span>
            </div>
          )}
          
          {onSave && (
            <button
              onClick={handleManualSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>

      {/* CKEditor */}
      <div className="border border-gray-200 rounded-b-xl overflow-hidden bg-white dark:border-gray-600 dark:bg-gray-800">
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={content}
          onChange={handleContentChange}
          onReady={(editor) => {
            editorRef.current = editor

            // Setup image upload adapter
            editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
              return uploadAdapter(loader)
            }
          }}
          onError={(error, { willEditorRestart }) => {
            console.error('CKEditor error:', error)
            if (!willEditorRestart) {
              toast.error('Editor error occurred')
            }
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="text-xs text-gray-500 px-4 dark:text-gray-400">
        Auto-save every {autoSaveInterval / 1000} seconds • Images uploaded to secure storage
      </div>
    </div>
  )
}

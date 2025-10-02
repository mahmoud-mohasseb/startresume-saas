import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('resumeId')
    const format = searchParams.get('format') || 'pdf'

    if (!resumeId) {
      return NextResponse.json({ 
        error: 'Resume ID is required' 
      }, { status: 400 })
    }

    // Fetch resume from database
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single()

    if (error || !resume) {
      return NextResponse.json({ 
        error: 'Resume not found' 
      }, { status: 404 })
    }

    // Handle PDF export directly
    if (format === 'pdf') {
      const htmlContent = resume.html_content || resume.content

      if (!htmlContent) {
        return NextResponse.json({ 
          error: 'No content available for export' 
        }, { status: 400 })
      }

      // Clean and optimize HTML for PDF generation
      let cleanHtml = htmlContent
        // Remove any script tags
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        // Optimize CSS for print
        .replace(/@media\s+screen[^{]*\{[^}]*\}/gi, '')
        // Ensure proper print styles
        .replace('</style>', `
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            h1, h2, h3 { page-break-after: avoid; }
            .page-break { page-break-before: always; }
          }
          </style>`)

      // Launch Puppeteer with optimized settings
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      })

      const page = await browser.newPage()
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 })
      
      // Set content and wait for it to load completely
      await page.setContent(cleanHtml, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      })
      
      // Generate PDF with professional settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        scale: 0.8
      })

      await browser.close()

      const filename = `${resume.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'resume'}_resume.pdf`

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
    }

    if (format === 'docx') {
      // For DOCX, we can still delegate since it doesn't use Puppeteer
      const { htmlToDocx } = await import('html-docx-js')
      
      const htmlContent = resume.html_content || resume.content
      if (!htmlContent) {
        return NextResponse.json({ 
          error: 'No content available for export' 
        }, { status: 400 })
      }

      const docxBuffer = htmlToDocx(htmlContent)
      const filename = `${resume.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'resume'}_resume.docx`
      
      return new NextResponse(docxBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': docxBuffer.byteLength.toString(),
        },
      })
    }

    // Handle other formats in the future
    return NextResponse.json({ 
      error: `Unsupported export format: ${format}. Supported formats: pdf, docx` 
    }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

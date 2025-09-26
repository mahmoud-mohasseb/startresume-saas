import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { html, filename = 'document.pdf' } = body

    if (!html) {
      return NextResponse.json({ 
        error: 'HTML content is required' 
      }, { status: 400 })
    }

    // Clean and optimize HTML for PDF generation
    let cleanHtml = html
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

    // Return the PDF file directly
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

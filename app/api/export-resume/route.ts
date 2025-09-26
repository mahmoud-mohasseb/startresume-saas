import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { html, format, filename } = await request.json()

    if (!html || !format) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (format === 'pdf') {
      // Return enhanced HTML for client-side printing
      const printableHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${filename || 'Resume'}</title>
            <style>
              @page {
                margin: 0.5in;
                size: A4;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 20px;
                background: white;
              }
              * { box-sizing: border-box; }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 0;
                margin-bottom: 0.5em;
              }
              p { margin: 0 0 0.5em 0; }
              ul, ol {
                margin: 0 0 0.5em 0;
                padding-left: 1.2em;
              }
            </style>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `
      
      return new NextResponse(printableHtml, {
        headers: {
          'Content-Type': 'text/html',
        }
      })
    } else if (format === 'docx') {
      // For DOCX, return a simple text version
      const textContent = html
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim()

      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${filename || 'resume'}.txt"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error exporting resume:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

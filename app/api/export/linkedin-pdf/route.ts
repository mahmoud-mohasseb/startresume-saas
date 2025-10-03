import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { profile, userName } = await request.json()

    // Ensure we have profile data
    if (!profile) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 })
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>LinkedIn Profile - ${userName || 'User'}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: #f8fafc; 
          color: #1f2937;
          line-height: 1.6;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%); 
          height: 180px; 
          position: relative; 
        }
        .profile-section { 
          padding: 40px; 
          position: relative; 
        }
        .profile-photo { 
          width: 120px; 
          height: 120px; 
          background: #e5e7eb; 
          border-radius: 50%; 
          border: 4px solid white; 
          position: absolute; 
          top: -60px; 
          left: 40px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 48px; 
          color: #6b7280; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .profile-info { 
          margin-top: 80px; 
        }
        .name { 
          font-size: 32px; 
          font-weight: bold; 
          color: #1f2937; 
          margin-bottom: 12px; 
        }
        .headline { 
          font-size: 18px; 
          color: #4b5563; 
          margin-bottom: 20px; 
          line-height: 1.5; 
          font-weight: 500;
        }
        .meta { 
          display: flex; 
          gap: 24px; 
          color: #6b7280; 
          margin-bottom: 32px; 
          font-size: 14px; 
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section { 
          margin-bottom: 32px; 
        }
        .section-title { 
          font-size: 20px; 
          font-weight: bold; 
          color: #1f2937; 
          margin-bottom: 16px; 
          border-bottom: 2px solid #e5e7eb; 
          padding-bottom: 8px; 
        }
        .summary { 
          color: #4b5563; 
          line-height: 1.7; 
          white-space: pre-wrap; 
          font-size: 15px;
        }
        .skills { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
        }
        .skill { 
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
          color: #1e40af; 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 14px; 
          font-weight: 600; 
          border: 1px solid #93c5fd;
        }
        .score-section { 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
          padding: 24px; 
          border-radius: 12px; 
          text-align: center; 
          margin-top: 24px;
          border: 1px solid #e2e8f0;
        }
        .score { 
          font-size: 42px; 
          font-weight: bold; 
          color: #0077b5; 
          margin-bottom: 8px;
        }
        .score-label { 
          color: #6b7280; 
          font-size: 16px;
          font-weight: 500;
        }
        .empty-state {
          color: #9ca3af;
          font-style: italic;
          padding: 20px;
          text-align: center;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #d1d5db;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"></div>
        <div class="profile-section">
          <div class="profile-photo">👤</div>
          <div class="profile-info">
            <h1 class="name">${userName || 'Professional Profile'}</h1>
            <p class="headline">${profile.headline || 'Professional seeking new opportunities'}</p>
            <div class="meta">
              ${profile.location ? `<div class="meta-item">📍 ${profile.location}</div>` : ''}
              ${profile.industry ? `<div class="meta-item">🏢 ${profile.industry}</div>` : ''}
              ${profile.currentRole ? `<div class="meta-item">💼 ${profile.currentRole}</div>` : ''}
            </div>
            
            <div class="section">
              <h2 class="section-title">About</h2>
              ${profile.summary ? 
                `<div class="summary">${profile.summary}</div>` : 
                `<div class="empty-state">Professional summary not provided</div>`
              }
            </div>
            
            <div class="section">
              <h2 class="section-title">Skills</h2>
              ${profile.skills && profile.skills.length > 0 ? 
                `<div class="skills">
                  ${profile.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
                </div>` :
                `<div class="empty-state">No skills listed</div>`
              }
            </div>
            
            <div class="score-section">
              <div class="score">✓ Optimized</div>
              <div class="score-label">LinkedIn Profile Ready for Export</div>
            </div>
            
            <div class="footer">
              Generated on ${new Date().toLocaleDateString()} • LinkedIn Profile Optimizer
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport and wait for content
    await page.setViewport({ width: 1200, height: 800 })
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    
    // Generate PDF with better options
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    })
    
    await browser.close()

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="linkedin-profile-${userName?.replace(/\s+/g, '-') || 'optimized'}.pdf"`,
        'Content-Length': pdf.length.toString()
      }
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ 
      error: 'Failed to export PDF', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

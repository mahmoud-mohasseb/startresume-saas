import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { brandData, analysis, strategy } = body

    if (!brandData || !analysis || !strategy) {
      return NextResponse.json({ 
        error: 'Brand data, analysis, and strategy are required' 
      }, { status: 400 })
    }

    // Generate professional HTML for the brand strategy
    const brandStrategyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Personal Brand Strategy Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 32px;
            color: #1e40af;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .header .subtitle {
            font-size: 18px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 24px;
            color: #1e40af;
            margin-bottom: 15px;
            font-weight: 600;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
          }
          
          .subsection {
            margin-bottom: 20px;
          }
          
          .subsection-title {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .score-container {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 20px 0;
          }
          
          .score {
            font-size: 48px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .score-label {
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
          }
          
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin: 20px 0;
          }
          
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
          }
          
          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
          }
          
          .card-title::before {
            content: "●";
            margin-right: 8px;
            font-size: 12px;
          }
          
          .strengths .card-title::before { color: #10b981; }
          .opportunities .card-title::before { color: #f59e0b; }
          .weaknesses .card-title::before { color: #ef4444; }
          .threats .card-title::before { color: #8b5cf6; }
          
          ul {
            list-style: none;
            padding: 0;
          }
          
          li {
            margin-bottom: 8px;
            padding-left: 15px;
            position: relative;
            font-size: 14px;
            line-height: 1.5;
          }
          
          li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-weight: bold;
          }
          
          .strategy-content {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .action-plan {
            background: #dbeafe;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
          }
          
          .action-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
          }
          
          .action-number {
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          @media print {
            body { padding: 20px; }
            .page-break { page-break-before: always; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Personal Brand Strategy Report</h1>
          <div class="subtitle">AI-Generated Professional Brand Analysis & Strategy</div>
          <div style="margin-top: 10px; font-size: 14px; color: #9ca3af;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Brand Assessment Overview</div>
          <div class="grid">
            <div>
              <div class="subsection-title">Industry & Role</div>
              <p><strong>Industry:</strong> ${brandData.industry}</p>
              <p><strong>Current Role:</strong> ${brandData.role}</p>
            </div>
            <div>
              <div class="subsection-title">Career Goals</div>
              <p>${brandData.goals || 'Not specified'}</p>
            </div>
          </div>
          <div class="subsection">
            <div class="subsection-title">Key Strengths</div>
            <p>${brandData.strengths || 'Not specified'}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Brand Analysis Results</div>
          <div class="score-container">
            <div class="score">${analysis.brandScore}</div>
            <div class="score-label">Brand Strength Score (out of 100)</div>
          </div>
          
          <div class="grid">
            <div class="card strengths">
              <div class="card-title">Strengths</div>
              <ul>
                ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
              </ul>
            </div>
            <div class="card opportunities">
              <div class="card-title">Opportunities</div>
              <ul>
                ${analysis.opportunities.map(opportunity => `<li>${opportunity}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          ${analysis.weaknesses && analysis.weaknesses.length > 0 ? `
          <div class="grid">
            <div class="card weaknesses">
              <div class="card-title">Areas for Improvement</div>
              <ul>
                ${analysis.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
              </ul>
            </div>
            <div class="card threats">
              <div class="card-title">Potential Challenges</div>
              <ul>
                ${analysis.threats?.map(threat => `<li>${threat}</li>`).join('') || '<li>No specific threats identified</li>'}
              </ul>
            </div>
          </div>
          ` : ''}
        </div>

        <div class="page-break"></div>

        <div class="section">
          <div class="section-title">Brand Strategy</div>
          
          <div class="subsection">
            <div class="subsection-title">Brand Positioning</div>
            <div class="strategy-content">
              ${strategy.positioning}
            </div>
          </div>
          
          <div class="subsection">
            <div class="subsection-title">Value Proposition</div>
            <div class="strategy-content">
              ${strategy.valueProposition}
            </div>
          </div>
          
          <div class="grid">
            <div>
              <div class="subsection-title">Target Audience</div>
              <p>${strategy.targetAudience}</p>
            </div>
            <div>
              <div class="subsection-title">Key Messages</div>
              <ul>
                ${strategy.keyMessages.map(message => `<li>${message}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Implementation Action Plan</div>
          <div class="action-plan">
            ${strategy.actionPlan.map((action, index) => `
              <div class="action-item">
                <div class="action-number">${index + 1}</div>
                <div>${action}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="footer">
          <p><strong>Personal Brand Strategy Report</strong></p>
          <p>This AI-generated report provides strategic insights for building your professional brand.</p>
          <p>Generated by StartResume.io - Your AI-Powered Career Partner</p>
        </div>
      </body>
      </html>
    `

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
    await page.setContent(brandStrategyHtml, { 
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
      scale: 0.9
    })

    await browser.close()

    const filename = `Personal_Brand_Strategy_${brandData.industry?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`

    // Return the PDF file directly
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Brand strategy PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

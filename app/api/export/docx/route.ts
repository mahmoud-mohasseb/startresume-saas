import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { html, filename, templateStyle } = await request.json()

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 })
    }

    // Enhanced template style with better defaults
    const finalTemplateStyle = templateStyle || {
      primaryColor: "1F4E79",
      secondaryColor: "2F5496", 
      accentColor: "666666",
      fontFamily: "Calibri",
      templateType: "modern"
    }

    // Parse HTML content to extract structured data
    const parseHtmlContent = (htmlContent: string) => {
      // Clean HTML and extract text content
      let cleanText = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<\/li>/gi, '\n')

      // Extract sections
      const sections = {
        name: '',
        contact: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        other: []
      }

      // Extract name (usually in h1 or first prominent text)
      const nameMatch = cleanText.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                       cleanText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
      if (nameMatch) {
        sections.name = nameMatch[1].replace(/<[^>]+>/g, '').trim()
      }

      // Extract contact info (email, phone patterns)
      const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)
      const phoneMatch = cleanText.match(/(\+?[\d\s\-\(\)]{10,})/g)
      if (emailMatch || phoneMatch) {
        sections.contact = [emailMatch?.[0], phoneMatch?.[0]].filter(Boolean).join(' | ')
      }

      // Split content into paragraphs for processing
      const paragraphs = cleanText
        .replace(/<[^>]+>/g, ' ')
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      return { sections, paragraphs }
    }

    const { sections, paragraphs } = parseHtmlContent(html)

    // Create DOCX document
    const docParagraphs: Paragraph[] = []

    // Add name as title
    if (sections.name) {
      docParagraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: sections.name,
            bold: true,
            size: 32,
            color: finalTemplateStyle.primaryColor,
            font: finalTemplateStyle.fontFamily
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      }))
    }

    // Add contact info
    if (sections.contact) {
      docParagraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: sections.contact,
            size: 20,
            color: finalTemplateStyle.accentColor,
            font: finalTemplateStyle.fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      }))
    }

    // Process remaining content
    paragraphs.forEach(paragraph => {
      if (paragraph.length < 3) return

      // Detect if this looks like a section header
      const isHeader = paragraph.length < 50 && 
                      (paragraph.toUpperCase() === paragraph || 
                       paragraph.includes(':') ||
                       /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)/i.test(paragraph))

      if (isHeader) {
        docParagraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: paragraph.toUpperCase(),
              bold: true,
              size: 24,
              color: finalTemplateStyle.primaryColor,
              font: finalTemplateStyle.fontFamily
            })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 160 }
        }))
      } else {
        // Regular content paragraph
        docParagraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: paragraph,
              size: 20,
              font: finalTemplateStyle.fontFamily
            })
          ],
          spacing: { after: 120 }
        }))
      }
    })

    // Fallback if no content was processed
    if (docParagraphs.length === 0) {
      const fallbackText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      docParagraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: fallbackText || "Resume content",
            size: 20,
            font: finalTemplateStyle.fontFamily
          })
        ]
      }))
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,    // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docParagraphs,
        },
      ]
    })

    // Generate buffer
    const buffer = await Packer.toBuffer(doc)
    const safeFilename = (filename || 'resume').replace(/[^a-zA-Z0-9-_]/g, '_')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('DOCX export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate DOCX file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

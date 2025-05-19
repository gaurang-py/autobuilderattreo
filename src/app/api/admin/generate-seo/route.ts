import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createCanvas, loadImage } from 'canvas';
import ColorThief from 'colorthief';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface SeoContent {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export async function POST(request: Request) {
  try {
    const { companyName, industry, colors, logoUrl } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Extract colors from logo if logoUrl is provided and no colors are specified
    let extractedColors = colors || [];
    if (logoUrl && (!colors || colors.length === 0)) {
      try {
        // Load the image
        const image = await loadImage(logoUrl);
        
        // Create a canvas to draw the image
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        // Extract colors using ColorThief
        const colorThief = new ColorThief();
        const palette = await colorThief.getPalette(canvas, 5);

        // Convert RGB arrays to hex colors
        extractedColors = palette.map((rgb: [number, number, number]) => {
          return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        });
      } catch (error) {
        console.error('Error extracting colors from logo:', error);
        // Continue with empty colors if extraction fails
      }
    }

    // Generate SEO content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Create SEO content for a company website with the following details:
    Company Name: ${companyName}
    ${industry ? `Industry: ${industry}` : ''}
    ${extractedColors.length > 0 ? `Brand Colors: ${extractedColors.join(', ')}` : ''}
    
    Please provide:
    1. SEO Title (max 60 characters)
    2. SEO Description (max 160 characters)
    3. SEO Keywords (comma-separated, max 10 keywords)
    
    Also, create realistic and engaging website content based on this information. The content should be professional and relevant to the ${industry || 'business'} industry.
    
    Format the response as JSON with keys: seoTitle, seoDescription, seoKeywords`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let seoContent: SeoContent = {};
    
    if (jsonMatch) {
      try {
        seoContent = JSON.parse(jsonMatch[0]) as SeoContent;
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response:', e);
      }
    }

    return NextResponse.json({
      seoTitle: seoContent.seoTitle || companyName,
      seoDescription: seoContent.seoDescription || '',
      seoKeywords: seoContent.seoKeywords || '',
      extractedColors: extractedColors,
      primaryColor: extractedColors[0] || '#0f172a',
      secondaryColor: extractedColors[1] || '#1e40af',
      accentColor: extractedColors[2] || '#3b82f6',
    });
  } catch (error) {
    console.error('Error generating SEO content:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO content' },
      { status: 500 }
    );
  }
} 
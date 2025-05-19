import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('logo') as File;
    const industry = data.get('industry') as string || 'AC services';

    if (!file) {
      return NextResponse.json(
        { error: 'No logo file provided' },
        { status: 400 }
      );
    }

    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempFilePath, buffer);
    
    // Convert the image to base64 for Gemini
    const base64Image = buffer.toString('base64');
    
    // Generate analysis using Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Analyze this logo image and extract the following information:
    1. Company name (if visible in the logo)
    2. Industry or business type the logo suggests
    3. Main colors used in the logo (provide at least 3-5 hex codes for the primary, secondary, and accent colors)
    4. Style of the logo (minimalist, modern, classic, etc.)
    5. Any symbols or icons present and their meaning
    
    For the colors, please provide:
    - Primary color (the main color of the logo)
    - Secondary color (complementary to the primary)
    - Accent color (for highlights and emphasis)
    - Text color (best color for text to complement the logo)
    - Background color (best background color to showcase the logo)
    
    Format the response as JSON with keys: companyName, industry, colors (object with primary, secondary, accent, text, background keys and hex values), style, symbols`;

    const result = await model.generateContent([
      {
        text: prompt
      },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let logoAnalysis = {
      companyName: '',
      industry: '',
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#cccccc',
        text: '#333333',
        background: '#ffffff'
      },
      style: '',
      symbols: ''
    };
    
    if (jsonMatch) {
      try {
        logoAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response:', e);
      }
    }

    // Generate AC company services and tagline
    const servicesPrompt = `Create content for an AC (Air Conditioning) company website. Include:
    1. A catchy tagline for the company
    2. 3-5 services with titles and descriptions that the company would offer
    
    The services should be realistic and specific to an AC company, covering installation, repair, maintenance, etc.
    Format the response as JSON with keys: tagline, services (array of objects with title and description)`;

    const servicesResult = await model.generateContent(servicesPrompt);
    const servicesResponse = await servicesResult.response;
    const servicesText = servicesResponse.text();
    console.log(servicesText);
    // Extract JSON from the services response
    const servicesJsonMatch = servicesText.match(/\{[\s\S]*\}/);
    let servicesData = {
      tagline: "Keeping you cool when it matters most",
      services: [
        {
          title: "AC Installation",
          description: "Professional installation of new air conditioning systems."
        },
        {
          title: "AC Repair",
          description: "Fast and reliable repair services for all AC models."
        },
        {
          title: "AC Maintenance",
          description: "Regular maintenance to keep your AC running efficiently."
        }
      ]
    };
    
    if (servicesJsonMatch) {
      try {
        servicesData = JSON.parse(servicesJsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini services response:', e);
      }
    }

    // Combine the logo analysis and services data
    const combinedResponse = {
      ...logoAnalysis,
      tagline: servicesData.tagline,
      services: servicesData.services
    };
    console.log(combinedResponse);
    return NextResponse.json(combinedResponse);
  } catch (error) {
    console.error('Error analyzing logo:', error);
    return NextResponse.json(
      { error: 'Failed to analyze logo' },
      { status: 500 }
    );
  }
} 
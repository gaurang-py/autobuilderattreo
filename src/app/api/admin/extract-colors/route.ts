import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import ColorThief from 'colorthief';

export async function POST(request: Request) {
  try {
    const { logoUrl } = await request.json();

    if (!logoUrl) {
      return NextResponse.json(
        { error: 'Logo URL is required' },
        { status: 400 }
      );
    }

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
    const colors = palette.map((rgb: [number, number, number]) => {
      return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
    });

    return NextResponse.json({
      success: true,
      colors,
      primaryColor: colors[0],
      secondaryColor: colors[1],
      accentColor: colors[2],
    });
  } catch (error) {
    console.error('Error extracting colors:', error);
    return NextResponse.json(
      { error: 'Failed to extract colors from logo' },
      { status: 500 }
    );
  }
} 
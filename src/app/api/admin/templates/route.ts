import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'src', 'templates');
    const templateFolders = fs.readdirSync(templatesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const templates = templateFolders.map(folder => {
      try {
        const configPath = path.join(templatesDir, folder, 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config;
      } catch (error) {
        console.error(`Error loading template ${folder}:`, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
} 
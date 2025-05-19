# AutoWebBuilder

A Next.js TypeScript multi-tenant site builder for AC service companies.

## Features

- Multi-tenant architecture with subdomain support
- Admin panel for creating new sites
- AI-powered content generation
- Responsive templates
- File upload handling

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add:
   ```
   DATABASE_URL="postgresql://..."
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Admin Panel & AI Content

The admin panel allows you to create new tenant sites with AI-generated content:

1. Access the admin panel at `/admin`
2. Fill out the form with:
   - Subdomain (slug)
   - Company Name
   - Template selection
   - Company Logo

The system will:
- Validate all inputs
- Save the logo to `/public/uploads/{slug}/logo.png`
- Generate AI content using Google Gemini
- Create the tenant record and associated page content
- Redirect to the new site at `{slug}.yourdomain.com`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- `Tenant` - Stores tenant information
- `PageContent` - Stores AI-generated content for each tenant

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key for content generation

## License

MIT

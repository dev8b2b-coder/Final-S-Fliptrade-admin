# Admin Panel - Fliptrade Group

Modern admin panel built with React, TypeScript, and Supabase for managing staff, deposits, and activities.

## Features

- 🔐 **Authentication**: Secure login/signup with Supabase Auth
- 👥 **Staff Management**: Add, edit, and manage staff members with role-based permissions
- 💰 **Deposits Management**: Track and manage deposits with filters and search
- 🏦 **Bank Deposits**: Manage bank transactions and deposits
- 📊 **Dashboard**: Real-time analytics and metrics with date filtering
- 📝 **Activity Logs**: Track all user activities and operations
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Vercel Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional, for emails)

## Environment Variables

Required for backend server functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

Optional (for email functionality):
- `RESEND_API_KEY` - Resend API key for sending emails
- `SENDGRID_API_KEY` - SendGrid API key (alternative)
- Or SMTP configuration (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`)

## Project Structure

```
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # UI components (shadcn/ui)
│   │   └── ...         # Feature components
│   ├── utils/          # Utility functions
│   ├── supabase/       # Supabase functions
│   └── database/       # Database schemas and SQL files
├── index.html          # Entry point
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

For issues or questions, please contact the development team.

---

**Note**: This project uses Supabase for backend services. Make sure to configure your Supabase project properly before deployment.

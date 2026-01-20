# ForesTracker

A comprehensive forest management application for tracking, monitoring, and managing forest inventory and resources.

## 🌲 Features

- **Dashboard** - Real-time overview of forest metrics and statistics
- **Forest Map** - Interactive map visualization of forest areas
- **Inventory Management** - Track and manage forest inventory
- **Reports** - Generate detailed reports on forest activities
- **Schedule Management** - Plan and schedule forest operations
- **User Management** - Manage system users and permissions
- **Settings** - Configure application settings

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Node.js web framework
- **Drizzle ORM** - TypeScript ORM
- **PostgreSQL** - Database (via Neon)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and configure your database

# Push database schema
npm run db:push
```

### Development

```bash
# Start development server (runs both frontend and backend)
npm run dev

# Type checking
npm run check
```

### Building

```bash
# Build for production (includes both frontend and backend)
npm run build

# Build frontend only for GitHub Pages
npm run build:gh

# Start production server
npm start
```

## 📦 Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

#### Setup (One-time)

1. Push code to GitHub:
   ```bash
   git push origin main
   ```

2. Enable GitHub Pages in repository Settings:
   - Go to **Settings** → **Pages**
   - Set **Source** to "GitHub Actions"

#### Automatic Deployment

Every push to `main` branch automatically triggers a deployment via GitHub Actions.

**Live URL**: `https://lokeshpuma.github.io/ForesTracker-0/`

#### Local Testing

```bash
# Build and test locally
npm run build:gh

# Preview build
cd dist/public
npx http-server
```

## 📁 Project Structure

```
ForesTracker-0/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # UI components (shadcn/ui)
│   │   │   ├── layouts/   # Layout components
│   │   │   ├── error-boundary.tsx
│   │   │   └── api-error-handler.tsx
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage logic
├── shared/                 # Shared code
│   └── schema.ts          # Database schema and types
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions deployment workflow
```

## 🔧 Error Handling

The application includes comprehensive error handling:

- **Error Boundary** - Catches React component errors with fallback UI
- **API Error Handler** - Displays API errors as toast notifications
- **Retry Logic** - Automatic retry for failed requests

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your_neon_database_url
NODE_ENV=development
```

## 📝 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (full stack) |
| `npm run build:gh` | Build for GitHub Pages (frontend only) |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Repository**: [ForesTracker-0](https://github.com/lokeshpuma/ForesTracker-0)  
**Live Demo**: [ForesTracker on GitHub Pages](https://lokeshpuma.github.io/ForesTracker-0/)

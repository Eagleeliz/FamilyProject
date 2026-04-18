# Lineage - Family Lineage Tracking System

A full-stack genealogy platform for building and visualizing family trees.

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary

## Features

- User authentication with JWT
- Role-based access (user/admin)
- Create and join family trees
- Add family members with relationships
- Interactive family tree visualization
- Dynamic cousin calculation
- Search across all families
- Admin dashboard for moderation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:

   **Server** (`server/.env`):
   ```
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/lineage
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   **Client** (`client/.env`):
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=lineage-upload
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API at http://localhost:5000
   - Frontend at http://localhost:3000

## Project Structure

```
├── server/           # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/  # Database and Cloudinary config
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
├── client/           # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   └── package.json
│
├── SPEC.md          # Full technical specification
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Families
- `GET /api/families` - List user's families
- `POST /api/families` - Create family
- `GET /api/families/:id` - Get family details
- `POST /api/families/:id/join` - Join family request

### Persons
- `POST /api/persons` - Create person
- `GET /api/persons/search` - Search persons
- `GET /api/persons/:id/tree` - Get family tree

### Relationships
- `POST /api/relationships` - Create relationship
- `GET /api/relationships/person/:id/relatives` - Get relatives
- `GET /api/relationships/person/:id/cousins` - Get cousins

### Admin
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/families/:id/approve` - Approve family

## Design System

- **Colors**: White (background), Black (text), Blue #2563EB (accent)
- **Font**: Inter
- **Animations**: Framer Motion

## License

MIT

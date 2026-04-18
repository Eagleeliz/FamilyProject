# Family Lineage Tracking System - Technical Specification

## 1. Project Overview

### Project Name
**Lineage** - Family Lineage Tracking System

### Project Type
Full-stack web application with graph-based family tree visualization

### Core Functionality
A genealogy platform where users create/join family trees, add members, define relationships (parent, child, sibling, spouse), visualize family trees across generations, and dynamically compute relationships like cousins.

### Target Users
- **Normal Users**: Individuals wanting to track their family history
- **Administrators**: System moderators who approve families, users, and manage data quality

---

## 2. Architecture Overview

### Technology Stack

**Frontend:**
- Vite + React 18 + TypeScript
- React Router v6 for routing
- Framer Motion for animations
- React Query for data fetching
- D3.js or React Flow for graph visualization
- Axios for API calls
- Cloudinary React SDK for image uploads

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL 14+ with UUID extension
- JWT for authentication
- bcrypt for password hashing
- multer + cloudinary for image uploads
- express-validator for input validation

**Infrastructure:**
- Cloudinary for image storage
- PostgreSQL for data persistence

### Architecture Pattern
- REST API with role-based access control
- Graph-based data model for relationships
- JWT authentication with refresh tokens

---

## 3. Database Design (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### Families Table
```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  root_person_id UUID,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_families_status ON families(status);
CREATE INDEX idx_families_name ON families(name);
```

### Persons Table
```sql
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  profile_image_url TEXT,
  family_id UUID REFERENCES families(id),
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_persons_family ON persons(family_id);
CREATE INDEX idx_persons_name ON persons(first_name, last_name);
CREATE INDEX idx_persons_status ON persons(status);
```

### Relationships Table
```sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  related_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('parent', 'child', 'sibling', 'spouse')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id, related_person_id, relationship_type)
);
CREATE INDEX idx_relationships_person ON relationships(person_id);
CREATE INDEX idx_relationships_related ON relationships(related_person_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

### Family Members Table
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, family_id)
);
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_family ON family_members(family_id);
```

---

## 4. API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/logout | User logout | User |
| GET | /api/auth/me | Get current user | User |
| PATCH | /api/auth/profile | Update profile | User |

### Families
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/families | List user's families | User |
| POST | /api/families | Create family | User |
| GET | /api/families/:id | Get family details | User |
| PATCH | /api/families/:id | Update family | User (admin) |
| DELETE | /api/families/:id | Delete family | User (owner) |
| POST | /api/families/:id/join | Request to join | User |
| PATCH | /api/families/:id/leave | Leave family | User |

### Persons
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/persons | List persons (filtered) | User |
| POST | /api/persons | Create person | User |
| GET | /api/persons/:id | Get person details | User |
| PATCH | /api/persons/:id | Update person | User |
| DELETE | /api/persons/:id | Delete person | User |
| GET | /api/persons/search | Search persons | Public |
| GET | /api/persons/:id/tree | Get family tree | User |

### Relationships
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/relationships | Create relationship | User |
| DELETE | /api/relationships/:id | Delete relationship | User |
| GET | /api/persons/:id/relatives | Get direct relatives | User |
| GET | /api/persons/:id/cousins | Get cousins | User |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/users | List all users | Admin |
| PATCH | /api/admin/users/:id | Update user | Admin |
| GET | /api/admin/families | List all families | Admin |
| PATCH | /api/admin/families/:id | Update family | Admin |
| GET | /api/admin/persons | List pending persons | Admin |
| PATCH | /api/admin/persons/:id | Approve/reject person | Admin |
| GET | /api/admin/analytics | System analytics | Admin |

### Upload
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/upload | Upload image | User |

---

## 5. Core System Rules

### 5.1 Graph-Based System
- **Relationships are primary**: The entire family tree is built using relationship edges
- **Persons are nodes**: Each person is a node in the graph
- **Relationship types**: parent, child, sibling, spouse
- **Bidirectional storage**: For parent relationship A→B, also store child relationship B→A

### 5.2 Family Containers
- Families are organizational containers only
- NOT used for defining relationships
- Users can belong to multiple families
- Family membership is role-based (admin/member)

### 5.3 Cousin Computation (Dynamic)
Cousins are NOT stored in database. Computed dynamically:
1. Find person's parents
2. Find parents' siblings (aunts/uncles)
3. Get siblings' children (first cousins)
4. Extend for k-degree cousins

### 5.4 Relationship Validation
- No circular loops (person cannot be their own ancestor)
- Consistency checks before storing
- Prevent duplicate relationships

---

## 6. Frontend Pages

### Public Pages (No Login)
1. **Landing Page** (`/`)
   - Hero section with tagline
   - Feature highlights
   - CTA buttons: Login, Register, Explore Demo
   - Preview of family tree visualization

2. **Public Search** (`/search`)
   - Search input for name
   - Results: Name, Profile image, Family name
   - Pagination

3. **Family Preview** (`/families/:id/preview`)
   - Read-only family tree view
   - Limited depth (3 generations)

4. **About Page** (`/about`)
   - Explain genealogy system
   - How lineage tracking works
   - Technology stack

5. **Contact Page** (`/contact`)
   - Contact form
   - Email, Social links

### Auth Pages
6. **Login** (`/login`)
   - Email/Password form
   - Remember me option
   - Link to register

7. **Register** (`/register`)
   - Full name, Email, Password, Confirm password
   - Terms acceptance

### User Dashboard (`/dashboard`)
8. **My Family Trees**
   - List of user's families
   - Create new family button
   - Join family button

9. **Family Tree View** (`/dashboard/family/:id`)
   - Interactive graph visualization
   - Add member button (modal)
   - Edit/Delete member
   - Zoom/Pan controls
   - Legend for relationship types

10. **Add/Edit Member Modal**
    - First name, Last name (required)
    - Date of birth, Date of death
    - Profile image upload
    - Relationship selection
    - Related person selection

11. **Search Page** (`/dashboard/search`)
    - Full search access
    - Filter by family
    - Results with full details

12. **Relatives View** (`/dashboard/person/:id/relatives`)
    - Parents, Children, Siblings, Spouses
    - Cousins (dynamically computed)
    - Visual relationship display

13. **Profile Page** (`/dashboard/profile`)
    - Edit name, email
    - Change password
    - Profile image

### Admin Dashboard (`/admin`)
14. **User Management** (`/admin/users`)
    - List all users
    - Block/Activate toggle
    - Role change
    - Filter by status

15. **Family Management** (`/admin/families`)
    - List all families
    - Approve/Reject pending
    - Delete families
    - Merge duplicate families

16. **Person Moderation** (`/admin/persons`)
    - List pending persons
    - Approve/Reject
    - Edit person details

17. **System Analytics** (`/admin/analytics`)
    - Total users, families, persons
    - Growth charts
    - Active users vs blocked

---

## 7. Design System

### Color Palette
```
Background:     #FFFFFF (white)
Primary Text:   #000000 (black)
Accent:         #2563EB (blue-600)
Accent Hover:   #1D4ED8 (blue-700)
Accent Light:   #DBEAFE (blue-100)
Surface:        #F9FAFB (gray-50)
Border:         #E5E7EB (gray-200)
Text Secondary: #6B7280 (gray-500)
Error:          #DC2626 (red-600)
Success:        #16A34A (green-600)
```

### Typography
- Font Family: Inter (Google Fonts)
- Headings: 700 weight
- Body: 400 weight
- Scale: 12px, 14px, 16px, 18px, 24px, 32px, 48px

### Components
- **Cards**: White background, subtle shadow, rounded corners (8px)
- **Buttons**: 
  - Primary: Blue background, white text
  - Secondary: White background, blue border, blue text
  - Danger: Red background, white text
- **Inputs**: White background, gray border, blue focus ring
- **Modals**: Centered, white background, overlay backdrop

### Spacing
- Base unit: 4px
- Common: 8px, 12px, 16px, 24px, 32px, 48px

---

## 8. Animations (Framer Motion)

### Page Transitions
- Fade in with slight scale (0.95 → 1)
- Duration: 300ms
- Easing: ease-out

### Modal
- Fade in backdrop
- Scale + fade content (0.9 → 1)
- Duration: 200ms

### Cards
- Staggered fade in on list render
- Delay: 50ms between items
- Hover: slight scale (1.02) + shadow increase

### Search Results
- Staggered slide in from bottom
- Duration: 200ms per item

### Family Tree Nodes
- Expand/collapse animations
- Connection line drawing animation
- Node highlight on hover

---

## 9. Cloudinary Integration

### Configuration
- Cloud name from env
- Upload preset for unsigned uploads
- Image transformations for optimization

### Upload Flow
1. Frontend uploads directly to Cloudinary (unsigned)
2. Get secure_url back
3. Send URL to backend for storage
4. Store URL in PostgreSQL

### Image Sizes
- Thumbnail: 100x100
- Small: 200x200
- Medium: 400x400
- Large: 800x800

---

## 10. Authentication Flow

### Registration
1. User submits form (name, email, password)
2. Backend validates input
3. Hash password with bcrypt
4. Create user record
5. Generate JWT token
6. Return user + token

### Login
1. User submits (email, password)
2. Find user by email
3. Compare password hash
4. Generate JWT (access + refresh)
5. Return tokens + user

### JWT Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Protected Routes
- User: Dashboard, personal family data
- Admin: Admin panel, moderation APIs

---

## 11. Performance Requirements

### Database
- Indexes on: users(email), persons(first_name, last_name), families(name)
- Relationship queries optimized with indexes
- Pagination on all list endpoints

### Search
- Full-text search on person names
- Debounced search input (300ms)
- Limited results per page (20)

### Family Tree
- Lazy loading of distant relatives
- Virtualization for large trees
- Cache tree structure client-side

### Validation
- Prevent duplicate persons (check firstName + lastName + dateOfBirth)
- Prevent invalid relationships
- Input sanitization

---

## 12. Folder Structure

### Backend (`/server`)
```
server/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── family.controller.ts
│   │   ├── person.controller.ts
│   │   ├── relationship.controller.ts
│   │   ├── admin.controller.ts
│   │   └── upload.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── family.routes.ts
│   │   ├── person.routes.ts
│   │   ├── relationship.routes.ts
│   │   ├── admin.routes.ts
│   │   └── upload.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── family.service.ts
│   │   ├── person.service.ts
│   │   ├── relationship.service.ts
│   │   └── analytics.service.ts
│   ├── utils/
│   │   ├── errors.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── app.ts
├── package.json
└── tsconfig.json
```

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── tree/
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── user/
│   │   └── admin/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── tsconfig.json
```

---

## 13. Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/lineage
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=lineage-upload
```

---

## 14. Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User can login and receive JWT
- [ ] Protected routes redirect to login
- [ ] Admin routes restricted to admin role

### Family Management
- [ ] User can create a family
- [ ] User can join existing family
- [ ] Admin can approve/reject family requests
- [ ] Family has root person auto-created

### Person Management
- [ ] User can add family members
- [ ] User can edit member details
- [ ] User can upload profile image
- [ ] Admin can moderate pending persons

### Relationships
- [ ] User can add parent/child/sibling/spouse
- [ ] Relationships stored bidirectionally
- [ ] User can view relatives
- [ ] Cousins computed dynamically

### Search
- [ ] Public search works without login
- [ ] User search has full access
- [ ] Results paginated
- [ ] Returns name, image, family

### Visualization
- [ ] Family tree renders as graph
- [ ] User can add/edit nodes
- [ ] Connections show relationship types
- [ ] Pan/zoom controls work

### Design
- [ ] White/black/blue color scheme
- [ ] Framer Motion animations on pages
- [ ] Responsive layout
- [ ] Clean minimal UI

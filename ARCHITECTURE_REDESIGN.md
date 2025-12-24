# Real Estate Management System - Architecture Redesign Plan

## Executive Summary
This document outlines the complete architectural redesign for a public-first Real Estate Management System with role-based features, secure authentication, and clear separation between public and authenticated user experiences.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Technology Stack
- **Backend**: Express.js (existing) + JWT Authentication
- **Frontend**: React + Vite + MobX (existing)
- **Database**: MySQL + Sequelize ORM (existing)
- **Auth Method**: JWT with httpOnly cookies (production best practice)
- **UI Framework**: Tailwind CSS (existing)

### 1.2 Core Principles
1. **Public-First**: Default to unauthenticated public access
2. **Role-Based**: Different UI/capabilities based on authentication state
3. **Security**: Contact info protected, sensitive operations require login
4. **Scalability**: Clear separation of concerns
5. **User Experience**: Seamless transition between public and authenticated

---

## 2. DATA MODEL UPDATES

### 2.1 New/Updated Tables

#### Users Table (Replaces/Enhances Person)
```sql
users (
  user_id INT PRIMARY KEY AUTO_INCREMENT
  username VARCHAR(100) UNIQUE NOT NULL
  email VARCHAR(100) UNIQUE NOT NULL
  password_hash VARCHAR(255) NOT NULL
  full_name VARCHAR(100) NOT NULL
  phone VARCHAR(50) NOT NULL
  profile_picture VARCHAR(255)
  bio TEXT
  address VARCHAR(255)
  national_id VARCHAR(50)
  is_active BOOLEAN DEFAULT true
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

#### Properties Table (Enhanced)
```sql
properties (
  -- Existing columns
  property_id INT PRIMARY KEY AUTO_INCREMENT
  owner_id INT NOT NULL (FOREIGN KEY to users)
  property_type VARCHAR(50) NOT NULL
  purpose VARCHAR(20) NOT NULL
  sale_price DECIMAL(18, 2)
  rent_price DECIMAL(18, 2)
  location VARCHAR(255) NOT NULL
  city VARCHAR(100) NOT NULL
  area_size VARCHAR(50) NOT NULL
  bedrooms INT
  bathrooms INT
  description TEXT
  latitude DECIMAL(10, 8)
  longitude DECIMAL(11, 8)
  photos JSON DEFAULT '[]'
  attachments JSON DEFAULT '[]'
  videos JSON DEFAULT '[]'
  
  -- NEW: Visibility & Status
  visibility ENUM('PRIVATE', 'DRAFT', 'PUBLIC') DEFAULT 'PRIVATE'
  status VARCHAR(20) DEFAULT 'available'
  is_available_for_sale BOOLEAN DEFAULT false
  is_available_for_rent BOOLEAN DEFAULT false
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
)
```

#### Deals Table (Enhanced)
```sql
deals (
  deal_id INT PRIMARY KEY AUTO_INCREMENT
  property_id INT NOT NULL
  deal_type ENUM('SALE', 'RENT') NOT NULL
  owner_id INT NOT NULL (user_id of seller/landlord)
  buyer_id INT (user_id of new owner/tenant, nullable until deal completes)
  tenant_id INT (for rent deals)
  price DECIMAL(18, 2) NOT NULL
  start_date DATE
  end_date DATE (for rent deals)
  notes TEXT
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'
  deal_completed_at DATETIME
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  FOREIGN KEY (property_id) REFERENCES properties(property_id)
  FOREIGN KEY (owner_id) REFERENCES users(user_id)
  FOREIGN KEY (buyer_id) REFERENCES users(user_id)
  FOREIGN KEY (tenant_id) REFERENCES users(user_id)
)
```

#### PropertyHistory Table (NEW)
```sql
property_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT
  property_id INT NOT NULL
  previous_owner_id INT
  new_owner_id INT
  change_type ENUM('CREATED', 'TRANSFERRED_SALE', 'RENTED', 'RETURN') NOT NULL
  change_date DATETIME DEFAULT CURRENT_TIMESTAMP
  details JSON
  FOREIGN KEY (property_id) REFERENCES properties(property_id)
  FOREIGN KEY (previous_owner_id) REFERENCES users(user_id)
  FOREIGN KEY (new_owner_id) REFERENCES users(user_id)
)
```

### 2.2 Deprecated Tables
- **person_property_roles**: Replace with visibility flags on properties
- **owner**: Consolidate into users table
- **client**: Consolidate into users table with role indicator

---

## 3. BACKEND ARCHITECTURE

### 3.1 Directory Structure
```
backend/
├── config/
│   ├── db.js
│   ├── auth.js (NEW - JWT configuration)
│   └── schema.sql (updated)
├── controllers/
│   ├── auth.js (NEW)
│   ├── property.js (refactored)
│   ├── user.js (NEW)
│   ├── deal.js (updated)
│   └── [other existing]
├── middleware/
│   ├── auth.js (NEW - JWT verification)
│   ├── validateRequest.js (NEW)
│   └── errorHandler.js (NEW)
├── models/
│   ├── User.js (NEW - replaces Person)
│   ├── Property.js (updated)
│   ├── Deal.js (updated)
│   ├── PropertyHistory.js (NEW)
│   └── [cleanup old models]
├── routes/
│   ├── public/ (NEW - no auth required)
│   │   ├── properties.js (public property listing & details)
│   │   ├── users.js (public user profile)
│   │   └── search.js (public search & filters)
│   ├── auth.js (NEW - login, register, logout)
│   ├── protected/ (NEW - auth required)
│   │   ├── properties.js (user's own properties)
│   │   ├── deals.js (user's deals)
│   │   ├── profile.js (user profile management)
│   │   └── dashboard.js (user dashboard)
│   └── [existing routes refactored]
├── utils/
│   ├── jwt.js (NEW)
│   ├── password.js (NEW)
│   ├── validators.js (NEW)
│   └── [existing]
└── server.js (updated)
```

### 3.2 Key Controllers & Routes

#### 1. Auth Controller (`controllers/auth.js`)
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - User login (returns JWT)
POST /api/auth/logout            - User logout (clears token)
POST /api/auth/refresh           - Refresh JWT token
GET  /api/auth/me                - Current user info (protected)
```

#### 2. Public Routes
```
GET  /api/public/properties      - List all public properties (with filters)
GET  /api/public/properties/:id  - Property details
GET  /api/public/users/:id       - User profile (contact hidden)
GET  /api/public/search          - Advanced search/filters
GET  /api/public/filters/options - Filter options (cities, types, etc)
```

#### 3. Protected Routes - Properties
```
GET    /api/properties           - User's all properties (private + public)
GET    /api/properties/:id       - User's property details
POST   /api/properties           - Create new property (starts as PRIVATE)
PUT    /api/properties/:id       - Update property
PATCH  /api/properties/:id/visibility - Change visibility tier
DELETE /api/properties/:id       - Delete property
GET    /api/properties/:id/history - Property ownership history
```

#### 4. Protected Routes - Deals
```
GET    /api/deals               - User's deal history
GET    /api/deals/:id           - Deal details
POST   /api/deals               - Create new deal (mark property as sold/rented)
PUT    /api/deals/:id           - Update deal
GET    /api/deals/:id/history   - Deal history
```

#### 5. Protected Routes - Profile
```
GET    /api/profile             - Current user profile
PUT    /api/profile             - Update user profile
PUT    /api/profile/password    - Change password
GET    /api/profile/properties  - User's properties (my listings)
```

### 3.3 Authentication Flow

#### JWT Strategy (Production Best Practice)
1. User registers/logs in → Password hashed with bcrypt
2. Server generates JWT (access token: 15min, refresh token: 7days)
3. Refresh token stored in httpOnly secure cookie
4. Access token returned in response body (used by frontend)
5. Each protected request includes Authorization: Bearer [access_token]
6. Middleware validates JWT signature & expiry
7. Logout: Clear refresh token cookie

#### Middleware Structure
```javascript
// Public routes - no middleware
app.get('/api/public/*', publicRoutes)

// Auth routes - no middleware
app.use('/api/auth', authRoutes)

// Protected routes - auth middleware required
app.use('/api/properties', authMiddleware, protectedPropertyRoutes)
app.use('/api/deals', authMiddleware, protectedDealRoutes)
app.use('/api/profile', authMiddleware, profileRoutes)
```

### 3.4 Business Logic

#### Property Visibility Rules
```
PRIVATE
  - Only visible to owner
  - Not shown on public dashboard
  - Use case: Properties under preparation

DRAFT
  - Only visible to owner
  - Not shown on public dashboard
  - Use case: Properties being configured before going public
  
PUBLIC
  - Visible to all users (logged in or not)
  - Shown on public dashboard
  - Requires is_available_for_sale OR is_available_for_rent = true
  - Contact info visible only to logged-in users
```

#### Deal Completion Logic
1. Create deal record with buyer_id and deal_type
2. When deal is marked COMPLETED:
   - If SALE: Update property.owner_id to buyer_id
   - If RENT: property stays with owner, record tenant_id
   - Create PropertyHistory entry
   - Update property status if necessary
3. Property can only have ONE active RENT tenant
4. Previous tenants are preserved in PropertyHistory

#### Property Deletion Rules
- User can only delete PRIVATE/DRAFT properties
- Cannot delete if has completed deals
- If deleted with pending deals, mark deals as CANCELLED

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Directory Structure
```
frontend/src/
├── api/
│   ├── auth.js (NEW)
│   ├── property.js (refactored)
│   ├── user.js (NEW)
│   ├── deal.js (updated)
│   └── axiosInstance.js (updated with auth)
├── components/
│   ├── public/ (NEW)
│   │   ├── Header.jsx (public header with login button)
│   │   ├── PropertyCard.jsx (public property card)
│   │   ├── FilterSidebar.jsx (public filters)
│   │   └── [other public components]
│   ├── authenticated/ (NEW)
│   │   ├── Sidebar.jsx (navigation drawer)
│   │   ├── DashboardCard.jsx
│   │   └── [other authenticated components]
│   ├── shared/ (NEW)
│   │   ├── LoginModal.jsx
│   │   ├── RegisterModal.jsx
│   │   ├── PropertyFilterPanel.jsx
│   │   └── [shared components]
│   └── [existing components]
├── hooks/
│   ├── useAuth.js (NEW)
│   ├── useProtectedRoute.js (NEW)
│   └── [existing]
├── layouts/
│   ├── PublicLayout.jsx (NEW - no sidebar)
│   ├── AuthenticatedLayout.jsx (NEW - with sidebar)
│   └── MainLayout.jsx (dispatch to correct layout)
├── pages/
│   ├── public/ (NEW)
│   │   ├── PublicDashboard.jsx
│   │   ├── PublicPropertyDetails.jsx
│   │   ├── PublicUserProfile.jsx
│   │   └── SearchProperties.jsx
│   ├── protected/ (NEW)
│   │   ├── MyDashboard.jsx
│   │   ├── MyProperties.jsx
│   │   ├── MyPropertiesForSale.jsx
│   │   ├── MyPropertiesForRent.jsx
│   │   ├── AddProperty.jsx
│   │   ├── MyDealHistory.jsx
│   │   ├── ProfileManagement.jsx
│   │   └── PropertyDetails.jsx
│   └── [other pages]
├── stores/
│   ├── AuthStore.js (NEW - auth state)
│   ├── PropertyStore.js (updated)
│   ├── UserStore.js (NEW)
│   ├── DealStore.js (updated)
│   └── [existing]
├── router/
│   └── routes.jsx (NEW - route configuration)
├── utils/
│   ├── auth.js (NEW - token management)
│   ├── constants.js (NEW - visibility enums, etc)
│   └── [existing]
└── App.jsx (refactored)
```

### 4.2 Authentication Flow (Frontend)

#### AuthStore (MobX)
```javascript
class AuthStore {
  user = null
  token = null
  isLoading = false
  isAuthenticated = computed(() => !!this.user)
  
  // Actions
  register(credentials)
  login(credentials)
  logout()
  refreshToken()
  fetchCurrentUser()
  updateProfile(data)
}
```

#### Token Management
1. Login: Store access_token in AuthStore
2. Axios interceptor adds token to all requests
3. Token refresh: Use refresh token automatically
4. Logout: Clear token and user state
5. Persist minimal auth state in sessionStorage (optional)

### 4.3 Routing Structure

#### Public Routes (No Auth Required)
```
/                          - Redirect to /dashboard
/login                     - Login page
/register                  - Registration page
/dashboard                 - Public property dashboard
/properties/:id            - Public property details
/users/:id                 - Public user profile
/search                    - Advanced property search
```

#### Protected Routes (Auth Required)
```
/authenticated/dashboard       - User's dashboard
/authenticated/properties      - All user's properties
/authenticated/properties/sale - Only properties for sale
/authenticated/properties/rent - Only properties for rent
/authenticated/properties/add  - Add new property
/authenticated/properties/:id  - Edit property
/authenticated/deals           - Deal history
/authenticated/profile         - User profile management
```

### 4.4 Component Layout

#### PublicLayout
```
┌─────────────────────────────────────────┐
│  Header (Logo | Search | Login Button)  │
├─────────────────────────────────────────┤
│  Filters Sidebar | Main Content Area    │
│                  |                      │
│                  | Property Cards/List  │
│                  |                      │
└─────────────────────────────────────────┘
```

#### AuthenticatedLayout
```
┌──────────────────────────────────────────┐
│  Header (Logo | User Avatar | Logout)    │
├──────────────┬──────────────────────────┤
│              │                          │
│  Sidebar     │  Main Content Area       │
│ (Navigation) │                          │
│              │  - Dashboard             │
│  - My Props  │  - Properties            │
│  - For Sale  │  - Forms                 │
│  - For Rent  │  - Deals                 │
│  - Add New   │  - Profile               │
│  - Deals     │                          │
│  - Profile   │                          │
│  - Logout    │                          │
└──────────────┴──────────────────────────┘
```

---

## 5. FEATURE BREAKDOWN

### 5.1 Public Dashboard
**URL**: `/dashboard` (default public page)
- Display all PUBLIC properties
- Property cards show: photo, type, price, location, bedrooms/baths
- Card includes owner avatar/name (clickable to public profile)
- Search bar at top
- Filter sidebar (type, price range, location, owner, availability)
- Pagination or infinite scroll
- Click property → Public Property Details Page

### 5.2 Public Property Details
**URL**: `/properties/:id`
- Full property information
- Photo carousel
- Owner profile summary (name, avatar, rating if applicable)
- Owner name/avatar clickable → Public User Profile
- Contact info: "Login to see contact information" button
- Available features: View details, See owner profile
- Cannot deal with property (Login to Create Deal button)

### 5.3 Public User Profile
**URL**: `/users/:id`
- User avatar, name, bio
- All PUBLIC properties they own for sale/rent
- Contact information: "Login to contact this user" message
- Properties filterable by type (sale/rent)
- Same property cards as dashboard

### 5.4 Login / Registration
**URL**: `/login` and `/register`
- Forms integrated in modals or dedicated pages
- Registration: email, password, full_name, phone, optional: bio, photo
- Login: email, password
- "Forgot password" link (optional for phase 2)
- Success → Redirect to authenticated dashboard

### 5.5 Authenticated Dashboard
**URL**: `/authenticated/dashboard`
- Welcome message with user's name
- Stats cards:
  - Total properties owned
  - Properties for sale
  - Properties for rent
  - Pending deals
  - Completed deals
- Quick actions:
  - Add New Property
  - View all properties
  - View deal history
- Recent activity

### 5.6 My Properties Management
**URL**: `/authenticated/properties`
Three views available:
1. **All Properties**: All private + public + draft properties
2. **For Sale**: Only properties marked as available for sale
3. **For Rent**: Only properties marked as available for rent

Each view shows:
- Property cards with:
  - Thumbnail
  - Name, location, price
  - Status badge (PRIVATE, DRAFT, PUBLIC)
  - Visibility indicator
  - Action buttons: Edit, Delete, Toggle Visibility, View Details
- Filters: Status, Type, City
- Bulk actions: Delete multiple, Change visibility

### 5.7 Add / Edit Property
**URL**: `/authenticated/properties/add` and `/authenticated/properties/:id`
- Form with sections:
  1. Basic Info (type, purpose, price)
  2. Location (address, city, coords)
  3. Details (beds, baths, area)
  4. Description
  5. Photos (upload, reorder, delete)
  6. Attachments (documents, PDFs)
  7. Videos (upload or URL)
  8. Visibility (PRIVATE/DRAFT/PUBLIC toggle)
  9. Availability (For Sale / For Rent checkboxes)
- Save as draft or publish
- Auto-save drafts

### 5.8 Deal Management
**URL**: `/authenticated/deals`
- Show all deals (sales, rentals, history)
- Deal records:
  - Property, buyer/tenant, price, date, status
  - Status: PENDING, COMPLETED, CANCELLED
- Filter: Deal type (SALE/RENT), Status, Date range
- Create new deal button
- View deal details
- Complete deal action (if owner)

### 5.9 Property History
**URL**: `/authenticated/properties/:id/history`
- Timeline of property ownership
- Show:
  - Creation date and original owner
  - Each sale/rent transfer
  - Who transferred to whom
  - When transfers occurred
  - Current status

### 5.10 User Profile Management
**URL**: `/authenticated/profile`
- View/Edit:
  - Full name, email, phone
  - Bio, profile picture
  - Address, national ID
- Change password section
- View all public properties
- Account settings
- Delete account (optional)

---

## 6. SECURITY CONSIDERATIONS

### 6.1 Authentication & Authorization
- ✅ Password hashing with bcrypt (10+ salt rounds)
- ✅ JWT tokens with short expiry (15 min access, 7 day refresh)
- ✅ Refresh tokens in httpOnly secure cookies
- ✅ CORS configured for production domain
- ✅ Rate limiting on auth endpoints

### 6.2 Data Protection
- ✅ Contact info only visible when authenticated
- ✅ Users can only edit/delete their own properties
- ✅ Users can only complete their own deals
- ✅ Email uniqueness enforced at database level
- ✅ Username uniqueness enforced at database level

### 6.3 API Security
- ✅ Input validation on all endpoints
- ✅ Sanitize file uploads
- ✅ Prevent SQL injection (using Sequelize parameterized queries)
- ✅ HTTPS enforced in production
- ✅ No sensitive data in JWT payload
- ✅ Environment variables for secrets (.env not in git)

### 6.4 Frontend Security
- ✅ No sensitive data in localStorage (use httpOnly cookies + state)
- ✅ Token not exposed in URL or page source
- ✅ Protected routes check auth state before rendering
- ✅ Logout clears all auth data

---

## 7. DATABASE MIGRATION STRATEGY

### Phase 1: Preparation
1. Backup existing database
2. Create new `users` table from `person` table
3. Add new columns to `properties` table
4. Create `property_history` table
5. Create `sessions` table (for refresh tokens, optional)

### Phase 2: Data Migration
1. Migrate `person` records to `users` (set temp passwords)
2. Migrate `owner` records to `users` (deduplicate)
3. Migrate `client` records to `users` (deduplicate)
4. Set default values for new columns (all PRIVATE initially)
5. Create property history for existing properties

### Phase 3: Cleanup
1. Keep old tables for reference
2. Update models to use new schema
3. Update all controllers and routes
4. Test thoroughly
5. Remove old tables (after validation period)

---

## 8. IMPLEMENTATION PHASES

### Phase 0: Foundation (Week 1)
- [ ] Database schema updates & migrations
- [ ] User model setup
- [ ] JWT auth setup
- [ ] Auth controller (register, login)
- [ ] Auth middleware
- [ ] Basic frontend AuthStore

### Phase 1: Public Experience (Week 2)
- [ ] Public property listing API
- [ ] Public property details API
- [ ] Public user profile API (no contact)
- [ ] Public frontend pages
- [ ] Public layout & navigation
- [ ] Login modal/page

### Phase 2: Authenticated Experience (Week 3)
- [ ] Protected property routes
- [ ] Protected user profile routes
- [ ] Property visibility management
- [ ] Authenticated dashboard
- [ ] Authenticated layout & sidebar
- [ ] My properties management

### Phase 3: Deal Management (Week 4)
- [ ] Deal creation/management APIs
- [ ] Deal history tracking
- [ ] Property ownership transfer logic
- [ ] PropertyHistory entries
- [ ] Deal management UI
- [ ] Deal history pages

### Phase 4: Polish & Testing (Week 5)
- [ ] Filters & search enhancement
- [ ] Error handling & edge cases
- [ ] Performance optimization
- [ ] Security audit
- [ ] End-to-end testing
- [ ] Documentation

---

## 9. TESTING STRATEGY

### Backend Testing
- Auth flow: register, login, token refresh, logout
- Public routes: no auth required, proper data filtering
- Protected routes: auth required, user isolation
- Deal completion: ownership transfer, history tracking
- Edge cases: deleted properties, invalid deals

### Frontend Testing
- Auth flow: registration, login, logout
- Route protection: redirects for unauthenticated users
- Visibility: proper UI shown based on auth state
- Token management: auto-refresh, error handling
- Component behavior: filters, forms, data display

### Integration Testing
- End-to-end: Register → Login → Add Property → Make Public → View → Create Deal → Check ownership
- Public dashboard: Filter, search, view details, see contact prompt
- User profile: Create account → Update profile → List properties → Deal history

---

## 10. SUCCESS CRITERIA

✅ Public users can browse all public properties  
✅ Public users cannot see contact information  
✅ Authenticated users see their own private properties  
✅ Property visibility properly controlled (PRIVATE/DRAFT/PUBLIC)  
✅ Deals complete and transfer ownership correctly  
✅ Property history preserved  
✅ All authentication flows secure  
✅ Clear separation between public/authenticated UI  
✅ Responsive design on mobile/tablet/desktop  
✅ Performance: Page load < 2 seconds  

---

## 11. NOTES & ASSUMPTIONS

- JWT tokens in production should use RS256 (asymmetric) not HS256
- Environment variables: JWT_SECRET, DB credentials, CORS_ORIGIN
- File uploads: Use CDN in production (not local filesystem)
- Email notifications: Not included in this phase (Phase 2)
- Password reset: Not included in this phase (Phase 2)
- User ratings/reviews: Not included in this phase (Phase 2)
- Admin dashboard: Not included in this phase (Phase 2)


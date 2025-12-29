# Technical Specification: User Profile Navigation

## Technical Context
- **Frontend**: React 19, Vite, Tailwind CSS, MobX, React Router DOM v7.
- **Backend**: Node.js, Express, Sequelize (PostgreSQL/MySQL).
- **Authentication**: JWT based (existing).
- **Existing Components**: `PropertyCard`, `PublicPropertyDetails`.

## Technical Implementation Brief

The feature involves creating a public profile page for users (property owners) and linking to it from the property details page.

**Backend**:
1.  **New API Endpoint for User Profile**: We need a public endpoint to fetch basic user information (name, bio, avatar, contact info).
2.  **Secure Property Listing**: The existing `getPropertiesByOwner` returns *all* properties. We must ensure the public profile only shows `PUBLIC` and `available` properties. We will introduce a new controller method `getPublicPropertiesByOwner` for this purpose.

**Frontend**:
1.  **New Route**: `/profile/:id` mapping to a new page component `PublicUserProfile`.
2.  **Page Implementation**: `PublicUserProfile` will fetch user data and their public properties. It will display the user's info in a header and a grid of properties using the existing property card logic.
3.  **Navigation**: Update `PublicPropertyDetails` to link the owner's name/avatar to the new profile page.

## Source Code Structure

### Backend
- `backend/controllers/public/userController.js` (New): Handles public user data fetching.
- `backend/routes/public/userRoutes.js` (New): Defines routes for public user access.
- `backend/controllers/propertyController.js` (Modify): Add `getPublicPropertiesByOwner`.
- `backend/routes/public/propertyRoutes.js` (Modify): Update `/owner/:id` to use `getPublicPropertiesByOwner` (or add new route if backward compatibility is a concern - checking usages suggests we can switch it for the public route).

### Frontend
- `frontend/src/pages/PublicUserProfile.jsx` (New): The main profile page.
- `frontend/src/App.jsx` (Modify): Add route definition.
- `frontend/src/pages/PublicPropertyDetails.jsx` (Modify): Add links to profile.

## Contracts

### API: Get Public User Profile
- **Endpoint**: `GET /api/public/users/:id`
- **Response (200)**:
  ```json
  {
    "user_id": 1,
    "full_name": "John Doe",
    "profile_picture": "url/to/image",
    "bio": "Experienced agent...",
    "phone": "123-456-7890",
    "email": "john@example.com",
    "createdAt": "..."
  }
  ```
- **Response (404)**: `{"error": "User not found"}`

### API: Get Public Properties by Owner
- **Endpoint**: `GET /api/public/properties/owner/:id`
- **Logic**:
  - `owner_id` = `:id`
  - `visibility` = 'PUBLIC'
  - `status` = 'available' (or checks `is_available_for_sale` / `is_available_for_rent`)

## Delivery Phases

### Phase 1: Backend Implementation
- Implement `userController.getPublicUserProfile`
- Implement `userRoutes` and mount in `server.js`
- Implement `propertyController.getPublicPropertiesByOwner`
- Update `public/propertyRoutes.js`

### Phase 2: Frontend Implementation
- Create `PublicUserProfile.jsx`
- Add route in `App.jsx`
- Update `PublicPropertyDetails.jsx` linking

## Verification Strategy

### Automated Verification
- **Backend Tests**:
  - Use `curl` to fetch a user profile. Verify sensitive fields (password_hash) are missing.
  - Use `curl` to fetch properties for an owner. Verify only public properties are returned.
  
- **Frontend Verification**:
  - Since we don't have E2E tests set up, we will verify by checking file existence and content validity (lint).

### Helper Scripts
- `scripts/verify_api.sh`: A bash script using `curl` to hit the new endpoints and check for 200 OK and expected JSON structure.

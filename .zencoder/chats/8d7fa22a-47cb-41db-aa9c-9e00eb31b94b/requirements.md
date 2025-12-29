# Feature Specification: User Profile Navigation

## User Stories

### User Story 1 - View User Profile
**Acceptance Scenarios**:
1. **Given** a user is on the Property Details page, **When** they click the owner's name or avatar, **Then** they are navigated to the User Profile page for that owner.
2. **Given** a visitor navigates to `/user/:userId`, **When** the user exists, **Then** the page displays the user's name, avatar, bio, and allowed contact info.
3. **Given** a visitor navigates to `/user/:userId`, **When** the user does not exist, **Then** a 404 or "User not found" message is displayed.

### User Story 2 - View User's Properties
**Acceptance Scenarios**:
1. **Given** a visitor is on the User Profile page, **When** the page loads, **Then** a list of properties owned by that user is displayed.
2. **Given** the property list is displayed, **When** a property is for sale, **Then** it is clearly marked as "For Sale".
3. **Given** the property list is displayed, **When** a property is for rent, **Then** it is clearly marked as "For Rent".
4. **Given** a visitor clicks on a property card in the profile page, **When** the click occurs, **Then** they are navigated to the Property Details page for that property.
5. **Given** the user has no active properties, **When** the profile page loads, **Then** a friendly message indicating no properties is shown.

---

## Requirements

1. **Profile Page Accessibility**: Publicly accessible to all users (authenticated or guest).
2. **Profile Information**: Display `full_name`, `profile_picture`, `bio`, `phone` (if public), `email` (if public). *Note: Assuming phone/email are public for property owners as per real estate context, unless specified otherwise.*
3. **Property Listing**:
    - Fetch properties where `owner_id` matches the profile user.
    - Filter for `visibility` = 'PUBLIC' and `status` = 'available' (or equivalent).
    - Display using the existing Property Card component.
4. **Routing**: New route `/user/:userId` (or similar).
5. **Privacy**: Do not return sensitive data like `password_hash`, `national_id`, `role` (unless relevant), `created_at`, `updated_at` (unless relevant) in the API response.

## Success Criteria

1. Users can successfully navigate from Property Details to User Profile.
2. User Profile page loads correct user information.
3. User Profile page lists all active properties for that user.
4. Property cards on the profile page function correctly (link to details).
5. No sensitive user data is exposed in the API.

# Real Estate Property Management System - Setup Guide

## Prerequisites
- Node.js (v14+)
- MySQL Server
- npm or yarn

## Installation & Setup

### 1. Database Setup

First, create the MySQL database and tables:

```bash
# Connect to MySQL
mysql -u root -p

# Run the schema script
source backend/config/schema.sql
```

Or copy and paste the SQL from `backend/config/schema.sql` into your MySQL client.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created with default values)
# Update the database credentials in .env if needed

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Owners
- `POST /api/owners` - Create owner
- `GET /api/owners` - Get all owners
- `GET /api/owners/:id` - Get owner by ID
- `PUT /api/owners/:id` - Update owner
- `DELETE /api/owners/:id` - Delete owner

### Properties
- `POST /api/properties` - Create property
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/search` - Search properties with filters
- `PUT /api/properties/:id` - Update property
- `PATCH /api/properties/:id/status` - Update property status
- `DELETE /api/properties/:id` - Delete property

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `DELETE /api/clients/:id` - Delete client

### Deals
- `POST /api/deals` - Create deal
- `GET /api/deals` - Get all deals
- `GET /api/deals/:id` - Get deal by ID

## Frontend Pages

- **Dashboard** - Overview of system statistics
- **Owners** - Manage property owners
- **Properties** - Manage properties
- **Search Properties** - Search properties with filters
- **Clients** - Manage client requirements
- **Deals** - Manage deals between clients and properties
- **Settings** - System settings

## Project Structure

```
realEstatePMS/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── schema.sql
│   ├── controllers/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── validation/
│   │   ├── api/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── SETUP.md
```

## Database Schema

### owners
- owner_id (INT, Primary Key)
- owner_name (VARCHAR)
- phone (VARCHAR)
- cnic (VARCHAR)
- address (VARCHAR)

### properties
- property_id (INT, Primary Key)
- owner_id (INT, Foreign Key)
- property_type (VARCHAR)
- purpose (VARCHAR - rent/sale)
- price (DECIMAL)
- location (VARCHAR)
- city (VARCHAR)
- area_size (VARCHAR)
- bedrooms (INT)
- bathrooms (INT)
- description (TEXT)
- status (VARCHAR - available/sold/rented)

### clients
- client_id (INT, Primary Key)
- client_name (VARCHAR)
- phone (VARCHAR)
- requirement_type (VARCHAR - rent/sale)
- property_type (VARCHAR)
- min_price (DECIMAL)
- max_price (DECIMAL)
- preferred_location (VARCHAR)

### deals
- deal_id (INT, Primary Key)
- property_id (INT, Foreign Key)
- client_id (INT, Foreign Key)
- final_price (DECIMAL)
- deal_type (VARCHAR - rent/sale)
- status (VARCHAR)
- date (DATETIME)

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL
- express-validator
- dotenv

### Frontend
- React
- MobX (State Management)
- Axios (HTTP Client)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Formik (Form Management)
- Yup (Validation)

## Features

✓ Owner Management
✓ Property Management
✓ Client Requirements Tracking
✓ Deal Management with Automatic Status Updates
✓ Property Search with Filters
✓ Dashboard with Statistics
✓ Form Validation
✓ Error Handling
✓ Responsive UI

## Default Database Connection

```
Host: localhost
User: root
Password: root
Database: real_estate_pms
```

## Notes

- Replace default database credentials in `backend/.env` with your actual MySQL credentials
- The frontend proxy is configured to forward API calls to `http://localhost:5000`
- All forms include validation using Yup
- MobX is used for state management on the frontend

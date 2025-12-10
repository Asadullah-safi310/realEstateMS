# Real Estate PMS - Quick Start Guide

## 🚀 Start the System in 3 Steps

### Step 1: Create & Setup Database
```bash
mysql -u root -p < backend/config/schema.sql
```

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend will run on: **http://localhost:5000**

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend will run on: **http://localhost:3000**

---

## 📱 Access the Application

Open your browser and go to: **http://localhost:3000**

You'll see:
- 📊 Dashboard with statistics
- 👥 Owner management
- 🏠 Property listing & search
- 👤 Client requirements
- 💼 Deal tracking

---

## 🔧 Database Configuration

**File**: `backend/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mysql@4405
DB_NAME=real_estate_pms
```

Update the credentials to match your MySQL setup.

---

## 📍 Available Routes

### Dashboard
- `http://localhost:3000/dashboard`

### Owners
- `http://localhost:3000/owners` - List all owners
- `http://localhost:3000/owners/add` - Add new owner
- `http://localhost:3000/owners/:id` - Edit owner

### Properties
- `http://localhost:3000/properties` - List all properties
- `http://localhost:3000/properties/add` - Add new property
- `http://localhost:3000/properties/:id` - Edit property
- `http://localhost:3000/properties/search` - Search properties

### Clients
- `http://localhost:3000/clients` - List all clients
- `http://localhost:3000/clients/add` - Add new client

### Deals
- `http://localhost:3000/deals` - List all deals
- `http://localhost:3000/deals/add` - Create new deal

### Settings
- `http://localhost:3000/settings`

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Owners
- `POST /owners` - Create owner
- `GET /owners` - Get all owners
- `GET /owners/:id` - Get owner by ID
- `PUT /owners/:id` - Update owner
- `DELETE /owners/:id` - Delete owner

#### Properties
- `POST /properties` - Create property
- `GET /properties` - Get all properties
- `GET /properties/:id` - Get property by ID
- `GET /properties/search?city=&type=&purpose=` - Search
- `PUT /properties/:id` - Update property
- `PATCH /properties/:id/status` - Update status
- `DELETE /properties/:id` - Delete property

#### Clients
- `POST /clients` - Create client
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get client by ID
- `DELETE /clients/:id` - Delete client

#### Deals
- `POST /deals` - Create deal
- `GET /deals` - Get all deals
- `GET /deals/:id` - Get deal by ID

---

## 📊 Sample Data Included

**Owners** (3):
- Ali Khan (Karachi)
- Fatima Ahmed (Lahore)
- Hassan Ali (Islamabad)

**Properties** (5):
- 2 Houses (1 sale, 1 rent)
- 1 Flat (rent)
- 1 Plot (sale)
- 1 Shop (rent)

**Clients** (3):
- Various requirements and preferences

---

## ✨ Key Features

✅ **Owner Management** - Add, edit, delete owners  
✅ **Property Listing** - Manage properties with multiple filters  
✅ **Advanced Search** - Filter by city, type, purpose, price, bedrooms, status  
✅ **Client Tracking** - Store client requirements and preferences  
✅ **Deal Management** - Create deals and auto-update property status  
✅ **Dashboard Analytics** - View real-time statistics  
✅ **Form Validation** - Yup-based client-side validation  
✅ **Responsive Design** - Works on all devices with Tailwind CSS  

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MySQL
- Express-validator
- CORS enabled

**Frontend:**
- React 19
- MobX for state management
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling
- Formik + Yup for forms
- Vite as build tool

---

## 📝 Sample API Request

### Create Owner
```bash
curl -X POST http://localhost:5000/api/owners \
  -H "Content-Type: application/json" \
  -d '{
    "owner_name": "John Doe",
    "phone": "03001234567",
    "cnic": "42101-1234567-1",
    "address": "Karachi"
  }'
```

### Search Properties
```bash
curl "http://localhost:5000/api/properties/search?city=Karachi&purpose=sale&min_price=1000000&max_price=10000000"
```

---

## ❓ Troubleshooting

### Port Already in Use
- Backend (5000): Check if another app is using port 5000
  ```bash
  netstat -ano | findstr :5000
  ```
- Frontend (3000): Check if another app is using port 3000

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `backend/.env`
- Ensure database `real_estate_pms` exists
- Run schema script: `mysql -u root -p < backend/config/schema.sql`

### Frontend Shows Blank Page
- Check browser console for errors (F12)
- Clear browser cache
- Ensure backend is running on port 5000

---

## 📚 Documentation Files

- **SETUP.md** - Detailed setup instructions
- **TEST_REPORT.md** - Complete testing & audit report
- **backend/config/schema.sql** - Database schema

---

**Happy Managing! 🎉**

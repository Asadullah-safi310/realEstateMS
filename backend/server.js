const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./config/db');
require('./models');

const ownerRoutes = require('./routes/ownerRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dealRoutes = require('./routes/dealRoutes');
const personRoutes = require('./routes/personRoutes');
const personPropertyRoleRoutes = require('./routes/personPropertyRoleRoutes');

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initDB();

app.use('/api/owners', ownerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/person-property-roles', personPropertyRoleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

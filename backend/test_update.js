const axios = require('axios');

async function testUpdateProperty() {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
    full_name: 'Test User',
    phone: '1234567890'
  };

  try {
    // 1. Register a new user
    console.log('Registering new user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', testUser);
    const token = registerResponse.data.token;
    const cookies = registerResponse.headers['set-cookie'];
    console.log('Registration successful. Token obtained.');

    // 2. Create a test property
    // ... rest of the code ...
    const createResponse = await axios.post('http://localhost:5000/api/properties', {
      property_type: 'House',
      purpose: 'SALE',
      province_id: 1, 
      district_id: 1,
      area_id: 1,
      area_size: '1000',
      location: 'Original Location',
      city: 'Kabul',
      latitude: 34.5,
      longitude: 69.2
    }, {
      headers: {
        'Cookie': cookies,
        'Authorization': `Bearer ${token}`
      }
    });

    const propertyId = createResponse.data.property_id;
    console.log(`Property created with ID: ${propertyId}`);

    // 3. Update the property
    const updateResponse = await axios.put(`http://localhost:5000/api/properties/${propertyId}`, {
      property_type: 'House',
      purpose: 'SALE',
      province_id: 1,
      district_id: 1,
      area_id: 1,
      area_size: '1000',
      location: 'Updated Location', // This is what we want to test
      city: 'Kabul',
      latitude: 34.5,
      longitude: 69.2
    }, {
      headers: {
        'Cookie': cookies,
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Update response:', updateResponse.data);

    // 4. Fetch the property to verify changes
    // Use the public endpoint to fetch by ID since protected doesn't expose it
    const fetchResponse = await axios.get(`http://localhost:5000/api/public/properties/${propertyId}`);

    const updatedProperty = fetchResponse.data;
    console.log('Fetched Property Location:', updatedProperty.location);

    if (updatedProperty.location === 'Updated Location') {
      console.log('SUCCESS: Property location updated correctly.');
    } else {
      console.log('FAILURE: Property location did NOT update.');
    }

  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testUpdateProperty();

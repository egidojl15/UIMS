const axios = require('axios');

async function testDeactivateAPI() {
  try {
    console.log('Testing deactivate API with query parameters...');
    
    // Test the API directly
    const response = await axios.delete('http://localhost:5000/api/residents/37?new_address=Test%20Address%20123', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but we can see if query params are received
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testDeactivateAPI();

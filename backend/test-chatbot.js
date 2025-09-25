// Debug script to test chatbot API
const https = require('http');

// Test payload
const data = JSON.stringify({
  message: "Hello, I have a headache",
  conversationId: null
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chatbot/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // Replace with actual token - get from frontend localStorage or use Postman
    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

// Write data to request body
req.write(data);
req.end();

console.log('Testing Chatbot API...');
console.log('Payload:', data);
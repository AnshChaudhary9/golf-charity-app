const http = require('http');

function request(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => resolve({ status: res.statusCode, data: body ? JSON.parse(body) : {} }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('--- Running API Tests ---');
  try {
    // 1. Register User
    console.log('1. Registering User...');
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Test Golfer',
      email: 'golfer@test.com',
      password: 'password123'
    });
    console.log('Register Response:', regRes.status, regRes.data);
    let token = regRes.data.access_token;

    // If duplicate, try logging in
    if (regRes.status === 409 || !token) {
      console.log('User might exist. Logging in...');
      const loginRes = await request('/api/auth/login', 'POST', {
        email: 'golfer@test.com',
        password: 'password123'
      });
      console.log('Login Response:', loginRes.status, loginRes.data);
      token = loginRes.data.access_token;
    }

    if (!token) throw new Error("Could not get token.");

    // 2. Add Score
    console.log('\n2. Adding Score...');
    const scoreRes = await request('/api/scores/add', 'POST', { score: 42 }, token);
    console.log('Add Score Response:', scoreRes.status, scoreRes.data);

    // 3. Get Scores
    console.log('\n3. Getting Scores...');
    const getScoreRes = await request('/api/scores/me', 'GET', null, token);
    console.log('Get Scores Response:', getScoreRes.status, getScoreRes.data);

  } catch (err) {
    console.error('Test script error:', err);
  }
}

// Ensure tests run only after 2 seconds
setTimeout(runTests, 2000);

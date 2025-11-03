const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// VULNERABILITY 1: Security Misconfiguration - Weak session secret
app.use(session({
  secret: '12345', // Hardcoded weak secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Not using HTTPS
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static('public'));

// VULNERABILITY 2: Sensitive Data Exposure - Hardcoded credentials
const DB_PASSWORD = 'admin123';
const JWT_SECRET = 'supersecret';
const API_KEY = 'sk_live_51234567890abcdef';

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, role TEXT)");
  db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL, description TEXT)");
  
  // Insert default users with weak passwords
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@example.com', 'admin')");
  db.run("INSERT INTO users VALUES (2, 'user', 'password', 'user@example.com', 'user')");
  
  db.run("INSERT INTO products VALUES (1, 'Laptop', 999.99, 'High-end laptop')");
  db.run("INSERT INTO products VALUES (2, 'Mouse', 29.99, 'Wireless mouse')");
});

// VULNERABILITY 3: Broken Authentication - No rate limiting or account lockout
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABILITY 4: SQL Injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (user) {
      // VULNERABILITY 5: Insecure JWT - Weak algorithm and secret
      const token = jwt.sign({ 
        id: user.id, 
        username: user.username,
        role: user.role 
      }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
      
      req.session.userId = user.id;
      req.session.role = user.role;
      
      res.json({ 
        success: true, 
        token,
        message: 'Login successful',
        user: user // VULNERABILITY 6: Exposing sensitive data
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// VULNERABILITY 7: Broken Access Control - Missing authorization checks
app.get('/admin/users', (req, res) => {
  // No check if user is actually admin!
  db.all("SELECT * FROM users", (err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users); // Exposes passwords!
  });
});

// VULNERABILITY 8: XXE (XML External Entity) - If XML parser was used
// VULNERABILITY 9: Insecure Deserialization simulation
app.post('/import-data', (req, res) => {
  try {
    // Dangerous: eval with user input
    const data = req.body.data;
    const result = eval(data); // CRITICAL VULNERABILITY
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// VULNERABILITY 10: Command Injection
app.post('/ping', (req, res) => {
  const { host } = req.body;
  
  // No input validation - direct command injection
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }
    res.json({ output: stdout });
  });
});

// VULNERABILITY 11: Path Traversal
app.get('/download', (req, res) => {
  const { file } = req.query;
  
  // No path validation - allows ../../../etc/passwd
  const filePath = path.join(__dirname, 'uploads', file);
  
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// VULNERABILITY 12: XSS (Cross-Site Scripting)
app.get('/search', (req, res) => {
  const { q } = req.query;
  
  // Directly rendering user input without sanitization
  res.send(`
    <html>
      <head><title>Search Results</title></head>
      <body>
        <h1>Search Results for: ${q}</h1>
        <p>No results found</p>
      </body>
    </html>
  `);
});

// VULNERABILITY 13: SSRF (Server-Side Request Forgery)
app.post('/fetch-url', (req, res) => {
  const { url } = req.body;
  
  // No URL validation - can access internal services
  const https = require('https');
  https.get(url, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => res.json({ data }));
  }).on('error', (e) => {
    res.status(500).json({ error: e.message });
  });
});

// VULNERABILITY 14: Insufficient Logging & Monitoring
// No logging of security events, failed logins, etc.

// VULNERABILITY 15: Using Components with Known Vulnerabilities
// Check package.json for outdated dependencies

// VULNERABILITY 16: Mass Assignment
app.post('/register', (req, res) => {
  const { username, password, email, role } = req.body;
  
  // User can set their own role to 'admin'!
  const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [username, password, email, role || 'user'], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, userId: this.lastID });
  });
});

// VULNERABILITY 17: CORS Misconfiguration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allows any origin!
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// VULNERABILITY 18: Information Disclosure
app.get('/debug', (req, res) => {
  res.json({
    env: process.env, // Exposes environment variables
    config: {
      dbPassword: DB_PASSWORD,
      jwtSecret: JWT_SECRET,
      apiKey: API_KEY
    }
  });
});

// VULNERABILITY 19: Crypto Failure - Weak hashing
app.post('/hash-password', (req, res) => {
  const { password } = req.body;
  
  // Using MD5 which is cryptographically broken
  const hash = crypto.createHash('md5').update(password).digest('hex');
  res.json({ hash });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'running', vulnerabilities: 'many' });
});

app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://localhost:${PORT}`);
  console.log('⚠️  WARNING: This application is intentionally vulnerable!');
  console.log('⚠️  DO NOT deploy in production or expose to the internet!');
});
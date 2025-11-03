// VULNERABLE JavaScript - For Educational Purposes Only!
// This file contains intentional security vulnerabilities

// VULNERABILITY 1: Hardcoded credentials in client-side code
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // Never do this in real applications!
const API_KEY = "sk_live_51234567890abcdef";
const SECRET_TOKEN = "super_secret_token_12345";

// VULNERABILITY 2: Insecure client-side storage
function storeApiKey() {
    // Storing sensitive data in localStorage (VULNERABLE!)
    localStorage.setItem('apiKey', API_KEY);
    localStorage.setItem('secretToken', SECRET_TOKEN);
    localStorage.setItem('userRole', 'admin');
    sessionStorage.setItem('sessionToken', 'session_' + Date.now());
    
    showStoredData();
    alert('API Key stored in localStorage! (This is a security vulnerability)');
}

function showStoredData() {
    const output = document.getElementById('storage-output');
    const data = {
        localStorage: {
            apiKey: localStorage.getItem('apiKey'),
            secretToken: localStorage.getItem('secretToken'),
            userRole: localStorage.getItem('userRole')
        },
        sessionStorage: {
            sessionToken: sessionStorage.getItem('sessionToken')
        }
    };
    
    output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// VULNERABILITY 3: Reflected XSS
function searchReflected(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input').value;
    const resultsDiv = document.getElementById('search-results');
    
    // VULNERABLE: Directly inserting user input into innerHTML
    resultsDiv.innerHTML = `
        <div class="message message-success fade-in">
            <strong>Search Results for:</strong> ${searchInput}
            <br><br>
            <p>You searched for: ${searchInput}</p>
            <p>No results found.</p>
        </div>
    `;
    
    return false;
}

// VULNERABILITY 4: Stored XSS
let comments = [];

function postComment(event) {
    event.preventDefault();
    const commentInput = document.getElementById('comment-input').value;
    
    if (!commentInput.trim()) {
        alert('Please enter a comment');
        return false;
    }
    
    // VULNERABLE: Storing unsanitized user input
    const comment = {
        text: commentInput,
        timestamp: new Date().toLocaleString(),
        user: 'Anonymous'
    };
    
    comments.push(comment);
    displayComments();
    
    // Send to server (also vulnerable)
    fetch('/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentInput })
    });
    
    document.getElementById('comment-input').value = '';
    return false;
}

function displayComments() {
    const commentsList = document.getElementById('comments-list');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #999;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    // VULNERABLE: Directly inserting stored user input
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item fade-in">
            <div>${comment.text}</div>
            <div class="comment-meta">Posted by ${comment.user} on ${comment.timestamp}</div>
        </div>
    `).join('');
}

// VULNERABILITY 5: DOM-based XSS
function setName(event) {
    event.preventDefault();
    const nameInput = document.getElementById('name-input').value;
    const welcomeDiv = document.getElementById('welcome-message');
    
    // VULNERABLE: Using innerHTML with user input
    welcomeDiv.innerHTML = `
        <div class="message message-success fade-in">
            <h3>Welcome, ${nameInput}!</h3>
            <p>Your name has been set to: ${nameInput}</p>
        </div>
    `;
    
    return false;
}

// Check URL parameters for DOM-based XSS
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    
    if (name) {
        const welcomeDiv = document.getElementById('welcome-message');
        // VULNERABLE: Using URL parameter directly in innerHTML
        welcomeDiv.innerHTML = `
            <div class="message message-warning fade-in">
                <h3>Welcome back, ${name}!</h3>
            </div>
        `;
    }
    
    // Load existing comments
    displayComments();
});

// VULNERABILITY 6: HTML Injection
function injectHTML(event) {
    event.preventDefault();
    const htmlInput = document.getElementById('html-input').value;
    const outputDiv = document.getElementById('html-output');
    
    // VULNERABLE: Directly inserting HTML
    outputDiv.innerHTML = htmlInput;
    
    return false;
}

// VULNERABILITY 7: Client-side authentication (easily bypassed)
function clientLogin(event) {
    event.preventDefault();
    const username = document.getElementById('client-username').value;
    const password = document.getElementById('client-password').value;
    const resultDiv = document.getElementById('client-auth-result');
    
    // VULNERABLE: Authentication logic in client-side JavaScript
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        resultDiv.innerHTML = `
            <div class="message message-success fade-in">
                <strong>✅ Login Successful!</strong>
                <p>Welcome, ${username}!</p>
                <p>Your secret token: ${SECRET_TOKEN}</p>
                <button onclick="showAdminPanel()" class="btn btn-primary">Access Admin Panel</button>
            </div>
        `;
        
        // VULNERABLE: Setting authentication state in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('role', 'admin');
    } else {
        resultDiv.innerHTML = `
            <div class="message message-error fade-in">
                <strong>❌ Login Failed!</strong>
                <p>Invalid credentials. Try checking the source code! 😉</p>
            </div>
        `;
    }
    
    return false;
}

// VULNERABILITY 8: Exposing sensitive functions
function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.style.display = 'block';
    adminPanel.scrollIntoView({ behavior: 'smooth' });
}

// VULNERABILITY 9: Command Injection (via server)
async function pingHost(event) {
    event.preventDefault();
    const host = document.getElementById('ping-host').value;
    const resultsDiv = document.getElementById('ping-results');
    
    resultsDiv.innerHTML = '<div class="loading"></div> Pinging...';
    
    try {
        const response = await fetch('/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host: host })
        });
        
        const data = await response.text();
        
        // VULNERABLE: Displaying server response without sanitization
        resultsDiv.innerHTML = `<pre>${data}</pre>`;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
    }
    
    return false;
}

// VULNERABILITY 10: SSRF (via server)
async function fetchURL(event) {
    event.preventDefault();
    const url = document.getElementById('fetch-url').value;
    const resultsDiv = document.getElementById('fetch-results');
    
    resultsDiv.innerHTML = '<div class="loading"></div> Fetching...';
    
    try {
        const response = await fetch('/fetch-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.text();
        
        // VULNERABLE: Displaying fetched content
        resultsDiv.innerHTML = `<pre>${data}</pre>`;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="message message-error">Error: ${error.message}</div>`;
    }
    
    return false;
}

// VULNERABILITY 11: Exposing source code
function viewSource() {
    const sourceWindow = window.open('', 'Source Code', 'width=800,height=600');
    sourceWindow.document.write('<pre>' + document.documentElement.innerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
}

// VULNERABILITY 12: Insecure eval usage
function executeCode(code) {
    // NEVER USE EVAL WITH USER INPUT!
    try {
        eval(code);
    } catch (e) {
        console.error('Error executing code:', e);
    }
}

// VULNERABILITY 13: Exposing sensitive data in console
console.log('=== SENSITIVE INFORMATION (DO NOT EXPOSE IN PRODUCTION) ===');
console.log('Admin Username:', ADMIN_USERNAME);
console.log('Admin Password:', ADMIN_PASSWORD);
console.log('API Key:', API_KEY);
console.log('Secret Token:', SECRET_TOKEN);
console.log('==========================================================');

// VULNERABILITY 14: No CSRF protection
// All forms submit without CSRF tokens

// VULNERABILITY 15: Insecure cookie handling
document.cookie = "sessionId=12345; path=/"; // No HttpOnly, No Secure flags
document.cookie = "userRole=admin; path=/";
document.cookie = "apiKey=" + API_KEY + "; path=/";

// VULNERABILITY 16: Client-side validation only
function validateInput(input) {
    // Client-side validation can be bypassed!
    if (input.length < 3) {
        return false;
    }
    return true;
}

// VULNERABILITY 17: Timing attack vulnerability
function checkPassword(input) {
    const correctPassword = ADMIN_PASSWORD;
    
    // VULNERABLE: Character-by-character comparison allows timing attacks
    for (let i = 0; i < correctPassword.length; i++) {
        if (input[i] !== correctPassword[i]) {
            return false;
        }
    }
    return input.length === correctPassword.length;
}

// VULNERABILITY 18: Information disclosure through error messages
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Detailed Error Information:');
    console.error('Message:', msg);
    console.error('URL:', url);
    console.error('Line:', lineNo);
    console.error('Column:', columnNo);
    console.error('Error object:', error);
    return false;
};

// VULNERABILITY 19: Prototype pollution
function merge(target, source) {
    for (let key in source) {
        // VULNERABLE: No check for __proto__, constructor, or prototype
        target[key] = source[key];
    }
    return target;
}

// VULNERABILITY 20: Insecure random number generation
function generateToken() {
    // VULNERABLE: Math.random() is not cryptographically secure
    return 'token_' + Math.random().toString(36).substr(2, 9);
}

// VULNERABILITY 21: Open redirect
function redirect(url) {
    // VULNERABLE: No validation of redirect URL
    window.location.href = url;
}

// Auto-execute some vulnerable code on page load
(function() {
    // Store some "sensitive" data
    localStorage.setItem('debugMode', 'true');
    localStorage.setItem('apiEndpoint', 'https://api.example.com/v1');
    
    // Log page load
    console.log('Page loaded at:', new Date());
    console.log('User Agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    console.log('Referrer:', document.referrer);
})();

// VULNERABILITY 22: Clickjacking - No frame busting
// Missing: if (top !== self) { top.location = self.location; }

// VULNERABILITY 23: Insecure WebSocket (if implemented)
// Example: const ws = new WebSocket('ws://example.com'); // Should use wss://

// VULNERABILITY 24: No Content Security Policy
// Missing CSP headers allow inline scripts and eval

// Helper function to demonstrate XSS
function demonstrateXSS() {
    alert('This is a demonstration of XSS vulnerability!');
    console.log('XSS executed successfully');
}

// Export functions for testing (VULNERABLE: Exposing internal functions)
window.vulnerableFunctions = {
    executeCode,
    checkPassword,
    merge,
    generateToken,
    redirect,
    demonstrateXSS
};

console.log('%c⚠️ WARNING: This application is intentionally vulnerable!', 
    'color: red; font-size: 20px; font-weight: bold;');
console.log('%cDo not use any code from this application in production!', 
    'color: orange; font-size: 16px;');

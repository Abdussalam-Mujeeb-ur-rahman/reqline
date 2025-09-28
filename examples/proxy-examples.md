# Localhost Proxy Examples for Reqline

This document provides practical examples of how to use the new proxy functionality in Reqline to test your local development APIs from the deployed application.

## 🎯 Why Use Proxy?

The proxy functionality solves a common problem: **You can't test localhost APIs from a deployed web application** due to browser security restrictions. With Reqline's proxy, you can:

- Test your local development server from the deployed Reqline app
- Debug API issues without deploying
- Use the same interface for both local and remote APIs
- Maintain all FormData and other features for local testing

## 🚀 Basic Proxy Usage

### Simple GET Request to Localhost

**Request:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}
```

**What happens:**

- Original URL: `https://api.example.com/users`
- Proxied to: `http://localhost:3000/users`
- Request is sent to your local server running on port 3000

### GET Request to Default Localhost Port

**Request:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost"
}
```

**What happens:**

- Original URL: `https://api.example.com/users`
- Proxied to: `http://localhost/users` (defaults to port 80)
- Request is sent to your local server running on the default HTTP port

### HTTPS Localhost Request

**Request:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "https://localhost:8443"
}
```

**What happens:**

- Original URL: `https://api.example.com/users`
- Proxied to: `https://localhost:8443/users`
- Request is sent to your local HTTPS server running on port 8443

### POST Request with JSON Body

**Request:**

```json
{
  "reqline": "HTTP POST | URL https://api.example.com/users | BODY {\"name\": \"John Doe\", \"email\": \"john@example.com\"}",
  "proxy_target": "http://localhost:8080"
}
```

**What happens:**

- Original URL: `https://api.example.com/users`
- Proxied to: `http://localhost:8080/users`
- JSON body is sent to your local server

## 📁 FormData with Proxy

### File Upload to Local Server

**Request:**

```json
{
  "reqline": "HTTP POST | URL https://api.example.com/upload | FORMDATA {\"profile_picture\": {\"type\": \"file\", \"path\": \"/Users/username/Pictures/profile.jpg\"}, \"name\": \"John Doe\"}",
  "proxy_target": "http://localhost:5000"
}
```

**What happens:**

- Original URL: `https://api.example.com/upload`
- Proxied to: `http://localhost:5000/upload`
- File and form data are sent to your local server

### Multiple Files with Proxy

**Request:**

```json
{
  "reqline": "HTTP POST | URL https://api.example.com/documents | FORMDATA {\"resume\": {\"type\": \"file\", \"path\": \"/Users/username/Documents/resume.pdf\"}, \"cover_letter\": {\"type\": \"file\", \"path\": \"/Users/username/Documents/cover.pdf\"}, \"name\": \"Jane Smith\"}",
  "proxy_target": "http://localhost:4000"
}
```

## 🔧 Advanced Proxy Examples

### With Query Parameters

**Request:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users | QUERY {\"page\": 1, \"limit\": 10, \"search\": \"john\"}",
  "proxy_target": "http://localhost:3000"
}
```

**Proxied URL:** `http://localhost:3000/users?page=1&limit=10&search=john`

### With Custom Headers

**Request:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users | HEADERS {\"Authorization\": \"Bearer local-token\", \"X-API-Version\": \"v2\"}",
  "proxy_target": "http://localhost:3000"
}
```

### Complex API Paths

**Request:**

```json
{
  "reqline": "HTTP PUT | URL https://api.example.com/api/v1/users/123/profile",
  "proxy_target": "http://localhost:3000"
}
```

**Proxied URL:** `http://localhost:3000/api/v1/users/123/profile`

## 🛠️ Development Workflow

### 1. Start Your Local Server

```bash
# Example: Start a Node.js server
npm run dev

# Example: Start a Python server
python -m http.server 3000

# Example: Start a React development server
npm start
```

### 2. Test with Proxy

Use the Reqline proxy endpoint to test your local API:

```bash
curl -X POST http://localhost:8811/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "reqline": "HTTP GET | URL https://api.example.com/users",
    "proxy_target": "http://localhost:3000"
  }'
```

### 3. Debug and Iterate

The proxy response includes helpful information:

```json
{
  "request": { ... },
  "response": { ... },
  "proxy_info": {
    "original_url": "https://api.example.com/users",
    "proxy_target": "http://localhost:3000",
    "proxied_url": "http://localhost:3000/users"
  }
}
```

## 🔍 Common Use Cases

### Testing Different Environments

```json
// Development
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}

// Staging
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3001"
}

// Production (no proxy)
{
  "reqline": "HTTP GET | URL https://api.example.com/users"
}
```

### Testing Different API Versions

```json
// API v1
{
  "reqline": "HTTP GET | URL https://api.example.com/api/v1/users",
  "proxy_target": "http://localhost:3000"
}

// API v2
{
  "reqline": "HTTP GET | URL https://api.example.com/api/v2/users",
  "proxy_target": "http://localhost:3000"
}
```

### Testing Microservices

```json
// User Service
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3001"
}

// Order Service
{
  "reqline": "HTTP GET | URL https://api.example.com/orders",
  "proxy_target": "http://localhost:3002"
}

// Payment Service
{
  "reqline": "HTTP POST | URL https://api.example.com/payments",
  "proxy_target": "http://localhost:3003"
}
```

## ⚠️ Error Handling

### Connection Refused

```json
{
  "code": "ERR",
  "error": true,
  "message": "Connection refused to http://localhost:3000. Make sure your local server is running and accessible."
}
```

**Solution:** Start your local server on the specified port.

### Invalid Proxy Target

```json
{
  "code": "ERR",
  "error": true,
  "message": "Proxy target must be a localhost URL (http://localhost or https://localhost, with optional port)"
}
```

**Solution:** Use a valid localhost URL (e.g., `http://localhost`, `http://localhost:3000`).

### Missing Proxy Target

```json
{
  "code": "ERR",
  "error": true,
  "message": "Proxy target is required and must be a string"
}
```

**Solution:** Include the `proxy_target` parameter in your request.

## 🎯 Best Practices

### 1. Use Descriptive URLs

```json
// Good - Clear what the endpoint does
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}

// Better - Include versioning
{
  "reqline": "HTTP GET | URL https://api.example.com/api/v1/users",
  "proxy_target": "http://localhost:3000"
}
```

### 2. Test Different HTTP Methods

```json
// Test all your endpoints
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}

{
  "reqline": "HTTP POST | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}

{
  "reqline": "HTTP PUT | URL https://api.example.com/users/123",
  "proxy_target": "http://localhost:3000"
}

{
  "reqline": "HTTP DELETE | URL https://api.example.com/users/123",
  "proxy_target": "http://localhost:3000"
}
```

### 3. Test Error Scenarios

```json
// Test 404 errors
{
  "reqline": "HTTP GET | URL https://api.example.com/nonexistent",
  "proxy_target": "http://localhost:3000"
}

// Test validation errors
{
  "reqline": "HTTP POST | URL https://api.example.com/users | BODY {\"invalid\": \"data\"}",
  "proxy_target": "http://localhost:3000"
}
```

### 4. Use Environment Variables

```bash
# Set your local server URL
export LOCAL_API_URL="http://localhost:3000"

# Use in your requests
curl -X POST http://localhost:8811/proxy \
  -H "Content-Type: application/json" \
  -d "{
    \"reqline\": \"HTTP GET | URL https://api.example.com/users\",
    \"proxy_target\": \"$LOCAL_API_URL\"
  }"
```

## 🔧 Integration Examples

### With JavaScript/Node.js

```javascript
const axios = require('axios');

async function testLocalAPI() {
  try {
    const response = await axios.post('http://localhost:8811/proxy', {
      reqline: 'HTTP GET | URL https://api.example.com/users',
      proxy_target: 'http://localhost:3000',
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

testLocalAPI();
```

### With Python

```python
import requests

def test_local_api():
    try:
        response = requests.post('http://localhost:8811/proxy', json={
            'reqline': 'HTTP GET | URL https://api.example.com/users',
            'proxy_target': 'http://localhost:3000'
        })

        print('Response:', response.json())
    except requests.exceptions.RequestException as e:
        print('Error:', e)

test_local_api()
```

### With cURL

```bash
# Test GET request
curl -X POST http://localhost:8811/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "reqline": "HTTP GET | URL https://api.example.com/users",
    "proxy_target": "http://localhost:3000"
  }'

# Test POST with body
curl -X POST http://localhost:8811/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "reqline": "HTTP POST | URL https://api.example.com/users | BODY {\"name\": \"John Doe\"}",
    "proxy_target": "http://localhost:3000"
  }'

# Test FormData
curl -X POST http://localhost:8811/proxy \
  -H "Content-Type: application/json" \
  -d '{
    "reqline": "HTTP POST | URL https://api.example.com/upload | FORMDATA {\"file\": {\"type\": \"file\", \"path\": \"/path/to/file.txt\"}}",
    "proxy_target": "http://localhost:3000"
  }'
```

## 🎉 Summary

The proxy functionality makes Reqline a powerful tool for local development:

- ✅ **Test local APIs** from deployed applications
- ✅ **Maintain all features** (FormData, headers, query params)
- ✅ **Easy debugging** with clear error messages
- ✅ **Flexible workflow** for different environments
- ✅ **Production-ready** with proper error handling

Start using the proxy today to streamline your local development workflow! 🚀

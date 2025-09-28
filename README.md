# Reqline Parser

A simple parser for curl-like tool called reqline

## Features

- Parse HTTP requests in a simple, readable format
- Support for GET, POST, PUT, DELETE, and PATCH methods
- Query parameters, headers, and body support
- **NEW: FormData support with file uploads** (similar to Postman)
- **NEW: Localhost Proxy Support** (test local APIs from deployed app)
- Cookie management across requests
- Error handling with helpful messages

## Usage

### Basic Request Format

```
HTTP <METHOD> | URL <url> | [HEADERS <json>] | [QUERY <json>] | [BODY <json>] | [FORMDATA <json>]
```

### Examples

#### Simple GET Request

```
HTTP GET | URL https://api.example.com/users
```

#### GET Request with Query Parameters

```
HTTP GET | URL https://api.example.com/users | QUERY {"page": 1, "limit": 10}
```

#### POST Request with JSON Body

```
HTTP POST | URL https://api.example.com/users | BODY {"name": "John Doe", "email": "john@example.com"}
```

#### POST Request with Headers

```
HTTP POST | URL https://api.example.com/users | HEADERS {"Authorization": "Bearer token123", "Content-Type": "application/json"} | BODY {"name": "John Doe"}
```

### FormData Support (NEW!)

Reqline now supports FormData with file uploads, similar to Postman's functionality. This is perfect for:

- Profile picture uploads
- Document uploads
- File attachments
- Any multipart/form-data requests

#### FormData with Regular Fields

```
HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John Doe", "email": "john@example.com"}
```

#### FormData with File Upload

```
HTTP POST | URL https://api.example.com/upload | FORMDATA {"profile_picture": {"type": "file", "path": "/path/to/image.jpg", "filename": "profile.jpg", "contentType": "image/jpeg"}, "name": "John Doe"}
```

#### FormData with Multiple Files

```
HTTP POST | URL https://api.example.com/upload | FORMDATA {"profile_picture": {"type": "file", "path": "/path/to/image.jpg"}, "document": {"type": "file", "path": "/path/to/document.pdf", "filename": "resume.pdf", "contentType": "application/pdf"}, "name": "John Doe"}
```

### Localhost Proxy Support (NEW!)

Reqline now supports proxying requests to localhost URLs, allowing you to test your local development APIs from the deployed application!

#### Basic Proxy Request

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}
```

#### Proxy with FormData

```json
{
  "reqline": "HTTP POST | URL https://api.example.com/upload | FORMDATA {\"file\": {\"type\": \"file\", \"path\": \"/path/to/file.txt\"}}",
  "proxy_target": "http://localhost:8080"
}
```

#### How Proxy Works

1. **URL Transformation**: The original URL path and query parameters are preserved
2. **Request Forwarding**: The request is sent to your local server instead
3. **Response Handling**: Responses from your local server are returned with proxy metadata

**Example Transformation:**

- Original: `https://api.example.com/users?page=1`
- Proxy Target: `http://localhost:3000`
- Proxied URL: `http://localhost:3000/users?page=1`

#### Proxy Response Format

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

### File Upload Configuration

When uploading files in FormData, you can specify:

- **`type`**: Must be `"file"` to indicate this is a file field
- **`path`**: **Required** - The absolute path to the file on your system
- **`filename`**: Optional - The filename to send to the server (defaults to the field name)
- **`contentType`**: Optional - The MIME type (defaults to `"application/octet-stream"`)

### Important Notes

1. **File Paths**: Use absolute paths to your files (e.g., `/Users/username/Documents/image.jpg`)
2. **File Existence**: The system will verify that the file exists before attempting to upload
3. **Mutual Exclusivity**: You cannot use both `BODY` and `FORMDATA` in the same request
4. **Content-Type**: When using FormData, the system automatically sets the correct `multipart/form-data` content type with boundary
5. **Proxy Targets**: Only localhost URLs are allowed (e.g., `http://localhost`, `http://localhost:3000`, `https://localhost:8080`)
6. **Local Server**: Make sure your local development server is running before using proxy

### Error Handling

The parser provides helpful error messages for common issues:

- Missing required keywords (HTTP, URL)
- Invalid HTTP methods
- Invalid JSON format
- File not found errors
- Invalid file paths
- Duplicate keywords
- Connection refused errors (for proxy requests)
- Invalid proxy target URLs

## API Endpoints

### POST /

Parse and execute a reqline statement

**Request Body:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users"
}
```

**Response:**

```json
{
  "request": {
    "query": {},
    "body": {},
    "headers": {},
    "full_url": "https://api.example.com/users",
    "cookies_sent": []
  },
  "response": {
    "http_status": 200,
    "duration": 245,
    "request_start_timestamp": 1640995200000,
    "request_stop_timestamp": 1640995200245,
    "response_data": { ... },
    "cookies_received": []
  }
}
```

### POST /proxy

Proxy a reqline statement to a localhost URL

**Request Body:**

```json
{
  "reqline": "HTTP GET | URL https://api.example.com/users",
  "proxy_target": "http://localhost:3000"
}
```

**Response:**

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

### GET /health

Health check endpoint

## Installation

```bash
npm install
```

## Running Tests

```bash
npm test
```

## Development

```bash
npm run dev
```

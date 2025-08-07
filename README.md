# Reqline Parser API

A curl-like tool that parses and executes HTTP requests using custom syntax, built with Node.js and Express using the Resilience17 Backend Assessment Scaffold.

## 🚀 Features

- **Custom Reqline Syntax**: Parse HTTP requests using a custom, regex-free syntax
- **HTTP Request Execution**: Execute GET and POST requests with axios
- **Comprehensive Error Handling**: Detailed error messages for syntax validation
- **Response Timing**: Track request duration and timestamps
- **Scaffold Compliant**: Built using the Resilience17 Backend Assessment Scaffold architecture

## 📋 Reqline Syntax

### Basic Format

```
HTTP [method] | URL [URL value] | HEADERS [header json value] | QUERY [query value json] | BODY [body value json]
```

### Syntax Rules

- All keywords must be **UPPERCASE**: `HTTP`, `HEADERS`, `QUERY`, `BODY`
- Single delimiter: pipe `|`
- Exactly one space on each side of keywords and delimiters
- HTTP methods: `GET` or `POST` only (uppercase)
- `HTTP` and `URL` are required and must be in fixed order
- Other keywords (`HEADERS`, `QUERY`, `BODY`) can appear in any order or be omitted

### Examples

```bash
# Simple GET request
HTTP GET | URL https://dummyjson.com/quotes/3

# GET with query parameters
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}

# POST with body
HTTP POST | URL https://jsonplaceholder.typicode.com/posts | BODY {"title": "Test", "body": "Test body", "userId": 1}

# Complete request with all parameters
HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Authorization": "Bearer token"} | QUERY {"refid": 1920933} | BODY {"filter": "active"}
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm

### Local Installation

```bash
# Clone the repository
git clone <repository-url>
cd reqline

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:8811`

### 🌐 Live Deployment

**Your reqline parser is now live and ready to use!**

- **Production URL**: https://reqline-cgup.onrender.com/
- **Health Check**: https://reqline-cgup.onrender.com/health
- **Frontend Application**: https://reqline-frontend.vercel.app/
- **Postman Documentation**: https://documenter.getpostman.com/view/23410424/2sB3BDJqdi

### Deploy to Render Cloud

This project is ready for deployment to Render Cloud with the included `render.yaml` configuration.

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Render**: Go to [Render Dashboard](https://dashboard.render.com/)
3. **Create Web Service**: Select your repository and Render will auto-detect the configuration
4. **Deploy**: Your API will be live at `https://your-app-name.onrender.com`

**Environment Variables** (automatically set by Render):

- `NODE_ENV`: `production`
- `PORT`: Provided by Render
- `CAN_LOG_ENDPOINT_INFORMATION`: `false`

## 🎨 Frontend Application

A modern React frontend is available for easy testing and interaction with the reqline parser API.

- **Live Frontend**: https://reqline-frontend.vercel.app/
- **Features**: 
  - Interactive reqline statement builder
  - Real-time syntax validation
  - Request/response visualization
  - Example templates
  - Error handling display

## 📡 API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "OK",
  "message": "Reqline parser is running"
}
```

### Parse and Execute Reqline

```http
POST /
Content-Type: application/json

{
  "reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"
}
```

**Success Response (HTTP 200):**

```json
{
  "request": {
    "query": { "refid": 1920933 },
    "body": {},
    "headers": {},
    "full_url": "https://dummyjson.com/quotes/3?refid=1920933"
  },
  "response": {
    "http_status": 200,
    "duration": 347,
    "request_start_timestamp": 1691234567890,
    "request_stop_timestamp": 1691234568237,
    "response_data": {
      "id": 3,
      "quote": "Thinking is the capital, Enterprise is the way, Hard Work is the solution.",
      "author": "Abdul Kalam"
    }
  }
}
```

**Error Response (HTTP 400):**

```json
{
  "error": true,
  "message": "Specific reason for the error"
}
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

The project includes comprehensive test coverage:

- **Parser Tests**: 31 tests covering syntax parsing and error handling
- **Executor Tests**: 11 tests covering HTTP request execution
- **Service Tests**: 15 tests covering business logic
- **API Tests**: 20 tests covering endpoint functionality

**Total: 77 tests**

### Test Categories

- ✅ Valid reqline statements
- ✅ Error handling for invalid syntax
- ✅ HTTP request execution
- ✅ Response structure validation
- ✅ Edge cases and boundary conditions

## 🏗️ Project Structure

```
├── app.js                          # Main application entry point
├── package.json                    # Project dependencies and scripts
├── core/                          # Scaffold core modules
│   ├── errors/                    # Error handling
│   ├── express/                   # Express server setup
│   └── mongoose/                  # Database connection (unused)
├── endpoints/                     # API endpoints
│   └── reqline/                   # Reqline-specific endpoints
│       ├── parse.js              # Main parsing endpoint
│       └── health.js             # Health check endpoint
├── services/                      # Business logic
│   └── reqline/                   # Reqline-specific services
│       ├── parse.js              # Main parsing service
│       ├── parser.js             # Syntax parser
│       └── executor.js           # HTTP request executor
├── messages/                      # Error messages
│   └── reqline.js                # Reqline error messages
├── test/                         # Test files
│   ├── parser.test.js            # Parser unit tests
│   ├── executor.test.js          # Executor unit tests
│   ├── service.test.js           # Service unit tests
│   └── endpoints.test.js         # API integration tests
└── [scaffold files]              # Other scaffold template files
```

## 🔍 Error Handling

The API provides detailed error messages for various syntax issues:

- **Missing required keywords**: HTTP, URL
- **Invalid HTTP methods**: Only GET and POST supported
- **Case sensitivity**: Keywords and methods must be uppercase
- **Spacing issues**: Proper spacing around pipe delimiters
- **JSON parsing errors**: Invalid JSON in HEADERS, QUERY, BODY
- **Order validation**: HTTP must be first, URL must be second
- **Duplicate keywords**: Each keyword can only appear once

## 🚀 Usage Examples

### Using curl

```bash
# Health check
curl https://reqline-cgup.onrender.com/health

# Simple GET request
curl -X POST https://reqline-cgup.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{"reqline": "HTTP GET | URL https://dummyjson.com/quotes/3"}'

# GET with query parameters
curl -X POST https://reqline-cgup.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{"reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"}'

# POST with body
curl -X POST https://reqline-cgup.onrender.com/ \
  -H "Content-Type: application/json" \
  -d '{"reqline": "HTTP POST | URL https://jsonplaceholder.typicode.com/posts | BODY {\"title\": \"Test\", \"body\": \"Test body\", \"userId\": 1}"}'
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const response = await axios.post('https://reqline-cgup.onrender.com/', {
  reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
});

console.log(response.data);
```

## 📚 Technical Details

### Architecture

- **Framework**: Node.js with Express
- **Scaffold**: Resilience17 Backend Assessment Scaffold
- **HTTP Client**: Axios for request execution
- **Testing**: Mocha with Chai
- **Error Handling**: Custom error system integrated with scaffold

### Key Components

- **Parser**: Custom regex-free syntax parser
- **Executor**: HTTP request execution with axios
- **Service Layer**: Business logic and error handling
- **API Layer**: RESTful endpoints with proper error responses

### Performance

- **Response Time**: Includes request duration tracking
- **Error Handling**: Graceful handling of external API failures
- **Validation**: Comprehensive input validation
- **Logging**: Structured logging for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is part of the Resilience17 Backend Assessment.

---

**Ready to parse and execute HTTP requests with custom syntax!** 🚀

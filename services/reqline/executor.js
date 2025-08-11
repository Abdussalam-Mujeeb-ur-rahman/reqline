const axios = require('axios');

class ReqlineExecutor {
  constructor() {
    // Initialize cookie jar to store cookies across requests
    this.cookieJar = new Map();
  }

  async execute(parsedRequest) {
    const { method, url, headers, query, body } = parsedRequest;

    // Build the full URL with query parameters
    const fullUrl = this.buildFullUrl(url, query);

    // Get cookies for this domain
    const domain = this.extractDomain(url);
    const cookies = this.getCookiesForDomain(domain);

    // Prepare request configuration
    const config = {
      method: method.toLowerCase(),
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 30000, // 30 second timeout
    };

    // Add cookies to request if available
    if (cookies.length > 0) {
      config.headers.Cookie = cookies.join('; ');
    }

    // Add body for POST requests
    if (method === 'POST' && Object.keys(body).length > 0) {
      config.data = body;
    }

    const requestStartTimestamp = Date.now();

    try {
      const response = await axios(config);
      const requestStopTimestamp = Date.now();

      // Store cookies from response
      this.storeCookiesFromResponse(response, domain);

      return {
        request: {
          query,
          body,
          headers,
          full_url: fullUrl,
          cookies_sent: cookies.length > 0 ? cookies : undefined,
        },
        response: {
          http_status: response.status,
          duration: requestStopTimestamp - requestStartTimestamp,
          request_start_timestamp: requestStartTimestamp,
          request_stop_timestamp: requestStopTimestamp,
          response_data: response.data,
          cookies_received: this.getCookiesFromResponse(response),
        },
      };
    } catch (error) {
      const requestStopTimestamp = Date.now();

      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        return {
          request: {
            query,
            body,
            headers,
            full_url: fullUrl,
            cookies_sent: cookies.length > 0 ? cookies : undefined,
          },
          response: {
            http_status: error.response.status,
            duration: requestStopTimestamp - requestStartTimestamp,
            request_start_timestamp: requestStartTimestamp,
            request_stop_timestamp: requestStopTimestamp,
            response_data: error.response.data || {},
            cookies_received: this.getCookiesFromResponse(error.response),
          },
        };
      }
      if (error.request) {
        // Request was made but no response received
        throw new Error(`No response received from server: ${error.message}`);
      } else {
        // Error in request setup
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  buildFullUrl(baseUrl, queryParams) {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return baseUrl;
    }

    // Use URLSearchParams for better compatibility
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(baseUrl);

    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  // Extract domain from URL for cookie management
  extractDomain(url) {
    try {
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      // Fallback for invalid URLs
      return 'unknown';
    }
  }

  // Get cookies for a specific domain
  getCookiesForDomain(domain) {
    const cookies = this.cookieJar.get(domain) || [];
    return cookies.map((cookie) => `${cookie.name}=${cookie.value}`);
  }

  // Store cookies from response
  storeCookiesFromResponse(response, domain) {
    const setCookieHeaders = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    if (!setCookieHeaders) return;

    const domainCookies = this.cookieJar.get(domain) || [];

    setCookieHeaders.forEach((cookieHeader) => {
      const cookie = this.parseCookieHeader(cookieHeader);
      if (cookie) {
        // Update existing cookie or add new one
        const existingIndex = domainCookies.findIndex((c) => c.name === cookie.name);
        if (existingIndex >= 0) {
          domainCookies[existingIndex] = cookie;
        } else {
          domainCookies.push(cookie);
        }
      }
    });

    this.cookieJar.set(domain, domainCookies);
  }

  // Parse cookie header into cookie object
  parseCookieHeader(cookieHeader) {
    const parts = cookieHeader.split(';');
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');

    if (!name || !value) return null;

    const cookie = {
      name: name.trim(),
      value: value.trim(),
    };

    // Parse additional attributes
    parts.slice(1).forEach((part) => {
      const [attr, attrValue] = part.split('=');
      const attrName = attr.trim().toLowerCase();

      if (attrName === 'expires') {
        cookie.expires = attrValue;
      } else if (attrName === 'max-age') {
        cookie.maxAge = parseInt(attrValue, 10);
      } else if (attrName === 'domain') {
        cookie.domain = attrValue;
      } else if (attrName === 'path') {
        cookie.path = attrValue;
      } else if (attrName === 'secure') {
        cookie.secure = true;
      } else if (attrName === 'httponly') {
        cookie.httpOnly = true;
      }
    });

    return cookie;
  }

  // Get cookies from response headers (case-insensitive)
  getCookiesFromResponse(response) {
    const setCookieHeaders = response.headers['set-cookie'] || response.headers['Set-Cookie'];
    if (!setCookieHeaders) return [];

    return setCookieHeaders
      .map((header) => {
        const cookie = this.parseCookieHeader(header);
        return cookie ? `${cookie.name}=${cookie.value}` : null;
      })
      .filter(Boolean);
  }

  // Clear cookies for a specific domain
  clearCookiesForDomain(domain) {
    this.cookieJar.delete(domain);
  }

  // Clear all cookies
  clearAllCookies() {
    this.cookieJar.clear();
  }
}

module.exports = new ReqlineExecutor();

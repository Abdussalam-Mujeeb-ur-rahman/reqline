const axios = require('axios');

class ReqlineExecutor {
  async execute(parsedRequest) {
    const { method, url, headers, query, body } = parsedRequest;

    // Build the full URL with query parameters
    const fullUrl = this.buildFullUrl(url, query);

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

    // Add body for POST requests
    if (method === 'POST' && Object.keys(body).length > 0) {
      config.data = body;
    }

    const requestStartTimestamp = Date.now();

    try {
      const response = await axios(config);
      const requestStopTimestamp = Date.now();

      return {
        request: {
          query,
          body,
          headers,
          full_url: fullUrl,
        },
        response: {
          http_status: response.status,
          duration: requestStopTimestamp - requestStartTimestamp,
          request_start_timestamp: requestStartTimestamp,
          request_stop_timestamp: requestStopTimestamp,
          response_data: response.data,
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
          },
          response: {
            http_status: error.response.status,
            duration: requestStopTimestamp - requestStartTimestamp,
            request_start_timestamp: requestStartTimestamp,
            request_stop_timestamp: requestStopTimestamp,
            response_data: error.response.data || {},
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
}

module.exports = new ReqlineExecutor();

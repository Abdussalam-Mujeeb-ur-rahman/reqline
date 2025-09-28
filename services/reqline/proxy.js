const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ReqlineMessages = require('@app-core/messages/reqline');
const reqlineParser = require('./parser');
const reqlineExecutor = require('./executor');

async function proxyReqline(serviceData) {
  const { reqline, proxy_target: proxyTarget } = serviceData;

  if (!reqline || typeof reqline !== 'string') {
    throwAppError(ReqlineMessages.MISSING_OR_INVALID_REQLINE, ERROR_CODE.BADREQUEST);
  }

  if (!proxyTarget || typeof proxyTarget !== 'string') {
    throwAppError('Proxy target is required and must be a string', ERROR_CODE.BADREQUEST);
  }

  // Validate proxy target format
  if (!proxyTarget.startsWith('http://localhost') && !proxyTarget.startsWith('https://localhost')) {
    throwAppError(
      'Proxy target must be a localhost URL (http://localhost or https://localhost, with optional port)',
      ERROR_CODE.BADREQUEST
    );
  }

  try {
    // Parse the reqline statement
    const parsedRequest = reqlineParser.parse(reqline);

    // Replace the URL with the proxy target
    const originalUrl = parsedRequest.url;
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const urlPath = new URL(originalUrl).pathname + new URL(originalUrl).search;
    parsedRequest.url = proxyTarget + urlPath;

    // Execute the HTTP request through proxy
    const response = await reqlineExecutor.execute(parsedRequest);

    // Add proxy information to the response
    response.proxy_info = {
      original_url: originalUrl,
      proxy_target: proxyTarget,
      proxied_url: parsedRequest.url,
    };

    return response;
  } catch (error) {
    if (error.isParserError) {
      // Add helpful suggestion to parser errors
      const errorMessage = error.message.includes('Check examples')
        ? error.message
        : `${error.message}. Check examples if you need help with the format`;
      throwAppError(errorMessage, ERROR_CODE.BADREQUEST);
    }

    // Handle executor errors (from axios)
    if (error.message && error.message.includes('No response received from server')) {
      throwAppError(
        `Connection refused to ${proxyTarget}. Make sure your local server is running and accessible.`,
        ERROR_CODE.BADREQUEST
      );
    }

    if (error.message && error.message.includes('Request setup error')) {
      // Check for specific axios error codes
      if (error.message.includes('ECONNREFUSED')) {
        throwAppError(
          `Connection refused to ${proxyTarget}. Make sure your local server is running and accessible.`,
          ERROR_CODE.BADREQUEST
        );
      }

      if (error.message.includes('ENOTFOUND')) {
        throwAppError(
          `Cannot resolve ${proxyTarget}. Check if the localhost URL is correct.`,
          ERROR_CODE.BADREQUEST
        );
      }

      if (error.message.includes('ETIMEDOUT')) {
        throwAppError(
          `Request to ${proxyTarget} timed out. The local server might be slow or unresponsive.`,
          ERROR_CODE.BADREQUEST
        );
      }

      // Generic request setup error
      throwAppError(`Request setup error: ${error.message}`, ERROR_CODE.BADREQUEST);
    }

    // Handle other errors
    throwAppError(ReqlineMessages.INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNALSERVERERROR);
  }
}

module.exports = proxyReqline;

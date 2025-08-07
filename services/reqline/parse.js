const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ReqlineMessages = require('@app-core/messages/reqline');
const reqlineParser = require('./parser');
const reqlineExecutor = require('./executor');

async function parseReqline(serviceData) {
  const { reqline } = serviceData;

  if (!reqline || typeof reqline !== 'string') {
    throwAppError(ReqlineMessages.MISSING_OR_INVALID_REQLINE, ERROR_CODE.BADREQUEST);
  }

  try {
    // Parse the reqline statement
    const parsedRequest = reqlineParser.parse(reqline);

    // Execute the HTTP request
    const response = await reqlineExecutor.execute(parsedRequest);

    return response;
  } catch (error) {
    if (error.isParserError) {
      // Add helpful suggestion to parser errors
      const errorMessage = error.message.includes('Check examples')
        ? error.message
        : `${error.message}. Check examples if you need help with the format`;
      throwAppError(errorMessage, ERROR_CODE.BADREQUEST);
    }

    // Handle other errors
    throwAppError(ReqlineMessages.INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNALSERVERERROR);
  }
}

module.exports = parseReqline;

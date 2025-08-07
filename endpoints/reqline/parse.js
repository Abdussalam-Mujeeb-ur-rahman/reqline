const { createHandler } = require('@app-core/server');
const parseReqlineService = require('../../services/reqline/parse');

module.exports = createHandler({
  path: '/',
  method: 'post',
  async handler(rc, helpers) {
    const payload = rc.body;
    payload.requestMeta = rc.properties;

    const response = await parseReqlineService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});

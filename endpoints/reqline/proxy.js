const { createHandler } = require('@app-core/server');
const proxyService = require('../../services/reqline/proxy');

module.exports = createHandler({
  path: '/proxy',
  method: 'post',
  async handler(rc, helpers) {
    const payload = rc.body;
    payload.requestMeta = rc.properties;

    // Always use proxy service - proxy_target is required
    const response = await proxyService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});

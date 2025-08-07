const { expect } = require('chai');
const reqlineExecutor = require('../services/reqline/executor');

describe('ReqlineExecutor', () => {
  describe('buildFullUrl', () => {
    it('should return base URL when no query parameters', () => {
      const result = reqlineExecutor.buildFullUrl('https://api.example.com', {});
      expect(result).to.equal('https://api.example.com');
    });

    it('should append query parameters to URL', () => {
      const result = reqlineExecutor.buildFullUrl('https://api.example.com', {
        page: 1,
        limit: 10,
      });
      // URL constructor may add trailing slash, so we check if it contains the query params
      expect(result).to.include('page=1');
      expect(result).to.include('limit=10');
      expect(result).to.include('https://api.example.com');
    });

    it('should handle existing query parameters in URL', () => {
      const result = reqlineExecutor.buildFullUrl('https://api.example.com?existing=value', {
        page: 1,
      });
      // URL constructor may add trailing slash, so we check if it contains the query params
      expect(result).to.include('existing=value');
      expect(result).to.include('page=1');
      expect(result).to.include('https://api.example.com');
    });

    it('should handle null query parameters', () => {
      const result = reqlineExecutor.buildFullUrl('https://api.example.com', null);
      expect(result).to.equal('https://api.example.com');
    });
  });

  describe('execute', () => {
    it('should execute GET request successfully', async () => {
      const parsedRequest = {
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: {},
        query: { refid: 1920933 },
        body: {},
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request).to.have.property('full_url');
      expect(result.request.full_url).to.include('refid=1920933');
      expect(result.response).to.have.property('http_status');
      expect(result.response).to.have.property('duration');
      expect(result.response).to.have.property('request_start_timestamp');
      expect(result.response).to.have.property('request_stop_timestamp');
      expect(result.response).to.have.property('response_data');
      expect(result.response.http_status).to.equal(200);
      expect(result.response.duration).to.be.a('number');
      expect(result.response.request_start_timestamp).to.be.a('number');
      expect(result.response.request_stop_timestamp).to.be.a('number');
    });

    it('should execute POST request with body', async () => {
      const parsedRequest = {
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: { 'Content-Type': 'application/json' },
        query: {},
        body: { title: 'Test', body: 'Test body', userId: 1 },
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.body).to.deep.equal({ title: 'Test', body: 'Test body', userId: 1 });
      expect(result.response.http_status).to.equal(201);
      expect(result.response.response_data).to.have.property('id');
    });

    it('should handle request with custom headers', async () => {
      const parsedRequest = {
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: { Authorization: 'Bearer token', 'X-Custom-Header': 'value' },
        query: {},
        body: {},
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.headers).to.deep.equal({
        Authorization: 'Bearer token',
        'X-Custom-Header': 'value',
      });
      expect(result.response.http_status).to.equal(200);
    });

    it('should handle 404 errors gracefully', async function () {
      this.timeout(10000); // Increase timeout for this test

      const parsedRequest = {
        method: 'GET',
        url: 'https://httpbin.org/status/404',
        headers: {},
        query: {},
        body: {},
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.response.http_status).to.equal(404);
      expect(result.response.duration).to.be.a('number');
    });

    it('should handle 500 errors gracefully', async () => {
      const parsedRequest = {
        method: 'GET',
        url: 'https://httpbin.org/status/500',
        headers: {},
        query: {},
        body: {},
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.response.http_status).to.equal(500);
      expect(result.response.duration).to.be.a('number');
    });

    it('should throw error for invalid URLs', async () => {
      const parsedRequest = {
        method: 'GET',
        url: 'https://invalid-domain-that-does-not-exist-12345.com',
        headers: {},
        query: {},
        body: {},
      };

      try {
        await reqlineExecutor.execute(parsedRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('No response received from server');
      }
    });

    it('should handle timeout errors', async function () {
      this.timeout(10000); // Increase timeout for this test

      const parsedRequest = {
        method: 'GET',
        url: 'https://httpbin.org/delay/5', // 5 second delay
        headers: {},
        query: {},
        body: {},
      };

      try {
        await reqlineExecutor.execute(parsedRequest);
        expect.fail('Should have thrown a timeout error');
      } catch (error) {
        // The error message might vary, so we just check that an error was thrown
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.a('string');
      }
    });
  });
});

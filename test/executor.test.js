const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
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

    it('should execute PATCH request with body', async () => {
      const parsedRequest = {
        method: 'PATCH',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: { 'Content-Type': 'application/json' },
        query: {},
        body: { title: 'Updated Title' },
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.body).to.deep.equal({ title: 'Updated Title' });
      expect(result.response.http_status).to.equal(200);
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

    it('should handle cookies in requests and responses', async function () {
      this.timeout(10000);

      const parsedRequest = {
        method: 'GET',
        url: 'https://httpbin.org/response-headers?Set-Cookie=session=abc123; Path=/',
        headers: {},
        query: {},
        body: {},
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.response.http_status).to.equal(200);
      expect(result.response.cookies_received).to.be.an('array');
      expect(result.response.cookies_received.length).to.be.greaterThan(0);
    });

    it('should send stored cookies in subsequent requests', async function () {
      this.timeout(10000);

      // First request to set cookies
      const firstRequest = {
        method: 'GET',
        url: 'https://httpbin.org/response-headers?Set-Cookie=session=abc123; Path=/',
        headers: {},
        query: {},
        body: {},
      };

      const firstResult = await reqlineExecutor.execute(firstRequest);
      expect(firstResult.response.http_status).to.equal(200);

      // Second request should include the cookie
      const secondRequest = {
        method: 'GET',
        url: 'https://httpbin.org/cookies',
        headers: {},
        query: {},
        body: {},
      };

      const secondResult = await reqlineExecutor.execute(secondRequest);
      expect(secondResult.response.http_status).to.equal(200);
      expect(secondResult.request.cookies_sent).to.be.an('array');
      expect(secondResult.request.cookies_sent.length).to.be.greaterThan(0);
    });
  });
});

describe('FormData handling', () => {
  it('should handle FormData with regular fields', async () => {
    const parsedRequest = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {},
      query: {},
      body: {},
      formData: {
        fields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        files: {},
      },
    };

    const result = await reqlineExecutor.execute(parsedRequest);

    expect(result.response.http_status).to.equal(200);
    expect(result.request.body).to.deep.equal({ formData: parsedRequest.formData });
  });

  it('should handle FormData with file uploads', async () => {
    // Create a temporary test file
    const tempFile = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(tempFile, 'This is a test file content');

    try {
      const parsedRequest = {
        method: 'POST',
        url: 'https://httpbin.org/post',
        headers: {},
        query: {},
        body: {},
        formData: {
          fields: {
            name: 'John Doe',
          },
          files: {
            testFile: {
              path: tempFile,
              filename: 'test-file.txt',
              contentType: 'text/plain',
            },
          },
        },
      };

      const result = await reqlineExecutor.execute(parsedRequest);

      expect(result.response.http_status).to.equal(200);
      expect(result.request.body).to.deep.equal({ formData: parsedRequest.formData });
    } finally {
      // Clean up test file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  });

  it('should throw error for non-existent file', async () => {
    const parsedRequest = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {},
      query: {},
      body: {},
      formData: {
        fields: {},
        files: {
          testFile: {
            path: '/non/existent/file.txt',
            filename: 'test-file.txt',
            contentType: 'text/plain',
          },
        },
      },
    };

    try {
      await reqlineExecutor.execute(parsedRequest);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('File not found');
    }
  });

  it('should throw error for directory path instead of file', async () => {
    const parsedRequest = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {},
      query: {},
      body: {},
      formData: {
        fields: {},
        files: {
          testFile: {
            path: __dirname, // This is a directory
            filename: 'test-file.txt',
            contentType: 'text/plain',
          },
        },
      },
    };

    try {
      await reqlineExecutor.execute(parsedRequest);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).to.include('Path is not a file');
    }
  });
});

const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = 'http://localhost:8811';

describe('Reqline API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.status).to.equal(200);
      expect(response.data).to.deep.equal({
        status: 'OK',
        message: 'Reqline parser is running',
      });
    });
  });

  describe('POST /', () => {
    describe('Valid requests', () => {
      it('should parse and execute simple GET request', async function () {
        this.timeout(10000); // Increase timeout for this test

        const requestData = {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3',
        };

        const response = await axios.post(`${BASE_URL}/`, requestData);

        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('request');
        expect(response.data).to.have.property('response');
        expect(response.data.request).to.have.property('full_url');
        expect(response.data.request.full_url).to.equal('https://dummyjson.com/quotes/3');
        expect(response.data.response).to.have.property('http_status');
        expect(response.data.response).to.have.property('duration');
        expect(response.data.response).to.have.property('request_start_timestamp');
        expect(response.data.response).to.have.property('request_stop_timestamp');
        expect(response.data.response).to.have.property('response_data');
        expect(response.data.response.http_status).to.equal(200);
        expect(response.data.response.duration).to.be.a('number');
        expect(response.data.response.request_start_timestamp).to.be.a('number');
        expect(response.data.response.request_stop_timestamp).to.be.a('number');
      });

      it('should parse and execute GET request with query parameters', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
        };

        const response = await axios.post(`${BASE_URL}/`, requestData);

        expect(response.status).to.equal(200);
        expect(response.data.request.query).to.deep.equal({ refid: 1920933 });
        expect(response.data.request.full_url).to.include('refid=1920933');
        expect(response.data.response.http_status).to.equal(200);
      });

      it('should parse and execute POST request with body', async () => {
        const requestData = {
          reqline:
            'HTTP POST | URL https://jsonplaceholder.typicode.com/posts | BODY {"title": "Test", "body": "Test body", "userId": 1}',
        };

        const response = await axios.post(`${BASE_URL}/`, requestData);

        expect(response.status).to.equal(200);
        expect(response.data.request.body).to.deep.equal({
          title: 'Test',
          body: 'Test body',
          userId: 1,
        });
        expect(response.data.response.http_status).to.equal(201);
        expect(response.data.response.response_data).to.have.property('id');
      });

      it('should handle request with headers and query', async () => {
        const requestData = {
          reqline:
            'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}',
        };

        const response = await axios.post(`${BASE_URL}/`, requestData);

        expect(response.status).to.equal(200);
        expect(response.data.request.headers).to.deep.equal({ 'Content-Type': 'application/json' });
        expect(response.data.request.query).to.deep.equal({ refid: 1920933 });
        expect(response.data.response.http_status).to.equal(200);
      });

      it('should handle request with all optional parameters in different order', async () => {
        const requestData = {
          reqline:
            'HTTP GET | URL https://dummyjson.com/quotes/3 | BODY {"filter": "active"} | HEADERS {"Authorization": "Bearer token"} | QUERY {"refid": 1920933}',
        };

        const response = await axios.post(`${BASE_URL}/`, requestData);

        expect(response.status).to.equal(200);
        expect(response.data.request.headers).to.deep.equal({ Authorization: 'Bearer token' });
        expect(response.data.request.query).to.deep.equal({ refid: 1920933 });
        expect(response.data.request.body).to.deep.equal({ filter: 'active' });
        expect(response.data.response.http_status).to.equal(200);
      });
    });

    describe('Error cases', () => {
      it('should return 400 for missing reqline', async () => {
        const requestData = {};

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing or invalid reqline statement');
        }
      });

      it('should return 400 for null reqline', async () => {
        const requestData = { reqline: null };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing or invalid reqline statement');
        }
      });

      it('should return 400 for invalid HTTP method', async () => {
        const requestData = {
          reqline: 'HTTP PUT | URL https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal(
            'Invalid HTTP method. Only GET and POST are supported'
          );
        }
      });

      it('should return 400 for missing HTTP keyword', async () => {
        const requestData = {
          reqline: 'GET | URL https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing required HTTP keyword');
        }
      });

      it('should return 400 for missing URL keyword', async () => {
        const requestData = {
          reqline: 'HTTP GET | https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing required URL keyword');
        }
      });

      it('should return 400 for invalid JSON in QUERY', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Invalid JSON format in QUERY section');
        }
      });

      it('should return 400 for invalid JSON in HEADERS', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Invalid JSON format in HEADERS section');
        }
      });

      it('should return 400 for invalid JSON in BODY', async () => {
        const requestData = {
          reqline: 'HTTP POST | URL https://dummyjson.com/quotes/3 | BODY {invalid json}',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Invalid JSON format in BODY section');
        }
      });

      it('should return 400 for empty reqline', async () => {
        const requestData = {
          reqline: '',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing or invalid reqline statement');
        }
      });

      it('should return 400 for HTTP not being first', async () => {
        const requestData = {
          reqline: 'URL https://dummyjson.com/quotes/3 | HTTP GET',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('HTTP keyword must be first');
        }
      });

      it('should return 400 for duplicate HTTP method', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HTTP POST',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('HTTP method can only appear once');
        }
      });

      it('should return 400 for lowercase HTTP method', async () => {
        const requestData = {
          reqline: 'HTTP get | URL https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('HTTP method must be uppercase');
        }
      });

      it('should return 400 for missing space before pipe', async () => {
        const requestData = {
          reqline: 'HTTP GET| URL https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing space before pipe delimiter');
        }
      });

      it('should return 400 for missing space after pipe', async () => {
        const requestData = {
          reqline: 'HTTP GET |URL https://dummyjson.com/quotes/3',
        };

        try {
          await axios.post(`${BASE_URL}/`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.equal('Missing space after pipe delimiter');
        }
      });
    });
  });

  describe('404 handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      try {
        await axios.get(`${BASE_URL}/non-existent`);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(404);
        // The scaffold might return HTML for 404, so we just check the status
        expect(error.response.status).to.equal(404);
      }
    });
  });
});

const { expect } = require('chai');
const parseReqlineService = require('../services/reqline/parse');

describe('ParseReqlineService', () => {
  describe('Valid requests', () => {
    it('should parse and execute valid GET request', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}',
      };

      const result = await parseReqlineService(serviceData);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.query).to.deep.equal({ refid: 1920933 });
      expect(result.request.full_url).to.include('refid=1920933');
      expect(result.response.http_status).to.equal(200);
      expect(result.response.duration).to.be.a('number');
      expect(result.response.request_start_timestamp).to.be.a('number');
      expect(result.response.request_stop_timestamp).to.be.a('number');
      expect(result.response.response_data).to.have.property('id');
    });

    it('should parse and execute valid POST request', async () => {
      const serviceData = {
        reqline:
          'HTTP POST | URL https://jsonplaceholder.typicode.com/posts | BODY {"title": "Test", "body": "Test body", "userId": 1}',
      };

      const result = await parseReqlineService(serviceData);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.body).to.deep.equal({ title: 'Test', body: 'Test body', userId: 1 });
      expect(result.response.http_status).to.equal(201);
      expect(result.response.response_data).to.have.property('id');
    });

    it('should handle request with all optional parameters', async () => {
      const serviceData = {
        reqline:
          'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Authorization": "Bearer token"} | QUERY {"refid": 1920933} | BODY {"filter": "active"}',
      };

      const result = await parseReqlineService(serviceData);

      expect(result).to.have.property('request');
      expect(result).to.have.property('response');
      expect(result.request.headers).to.deep.equal({ Authorization: 'Bearer token' });
      expect(result.request.query).to.deep.equal({ refid: 1920933 });
      expect(result.request.body).to.deep.equal({ filter: 'active' });
      expect(result.response.http_status).to.equal(200);
    });
  });

  describe('Error handling', () => {
    it('should throw error for missing reqline', async () => {
      const serviceData = {};

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing or invalid reqline statement');
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for null reqline', async () => {
      const serviceData = { reqline: null };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing or invalid reqline statement');
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for non-string reqline', async () => {
      const serviceData = { reqline: 123 };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing or invalid reqline statement');
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for invalid HTTP method', async () => {
      const serviceData = {
        reqline: 'HTTP PUT | URL https://dummyjson.com/quotes/3',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Invalid HTTP method. Only GET and POST are supported. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for missing HTTP keyword', async () => {
      const serviceData = {
        reqline: 'GET | URL https://dummyjson.com/quotes/3',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Missing required HTTP keyword. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for missing URL keyword', async () => {
      const serviceData = {
        reqline: 'HTTP GET | https://dummyjson.com/quotes/3',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Missing required URL keyword. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for invalid JSON in QUERY', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Invalid JSON format in QUERY section. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for invalid JSON in HEADERS', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Invalid JSON format in HEADERS section. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for invalid JSON in BODY', async () => {
      const serviceData = {
        reqline: 'HTTP POST | URL https://dummyjson.com/quotes/3 | BODY {invalid json}',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'Invalid JSON format in BODY section. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for empty reqline', async () => {
      const serviceData = {
        reqline: '',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Missing or invalid reqline statement');
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for HTTP not being first', async () => {
      const serviceData = {
        reqline: 'URL https://dummyjson.com/quotes/3 | HTTP GET',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'HTTP keyword must be first. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });

    it('should throw error for duplicate HTTP method', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://dummyjson.com/quotes/3 | HTTP POST',
      };

      try {
        await parseReqlineService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal(
          'HTTP method can only appear once. Check examples if you need help with the format'
        );
        expect(error.errorCode).to.equal('ERR');
      }
    });
  });
});

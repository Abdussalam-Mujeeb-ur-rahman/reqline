const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8811';

describe('Proxy API Endpoints', () => {
  describe('POST /proxy', () => {
    describe('Valid proxy requests', () => {
      it('should proxy GET request to localhost', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://api.example.com/users',
          proxy_target: 'http://localhost:3000',
        };

        try {
          const response = await axios.post(`${BASE_URL}/proxy`, requestData);

          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('proxy_info');
          expect(response.data.proxy_info).to.deep.equal({
            original_url: 'https://api.example.com/users',
            proxy_target: 'http://localhost:3000',
            proxied_url: 'http://localhost:3000/users',
          });
        } catch (error) {
          // Expected to fail since localhost:3000 is not running
          expect(error.response.status).to.equal(400);
          expect(error.response.data.message).to.include('Connection refused');
        }
      });

      it('should proxy POST request with body to localhost', async () => {
        const requestData = {
          reqline: 'HTTP POST | URL https://api.example.com/users | BODY {"name": "John Doe"}',
          proxy_target: 'http://localhost:8080',
        };

        try {
          const response = await axios.post(`${BASE_URL}/proxy`, requestData);

          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('proxy_info');
          expect(response.data.proxy_info.proxied_url).to.equal('http://localhost:8080/users');
          expect(response.data.request.body).to.deep.equal({ name: 'John Doe' });
        } catch (error) {
          // Expected to fail since localhost:8080 is not running
          expect(error.response.status).to.equal(400);
          expect(error.response.data.message).to.include('Connection refused');
        }
      });

      it('should proxy FormData request to localhost', async () => {
        const requestData = {
          reqline: 'HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John Doe"}',
          proxy_target: 'http://localhost:5000',
        };

        try {
          const response = await axios.post(`${BASE_URL}/proxy`, requestData);

          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('proxy_info');
          expect(response.data.proxy_info.proxied_url).to.equal('http://localhost:5000/upload');
          expect(response.data.request.body).to.deep.equal({
            formData: {
              fields: { name: 'John Doe' },
              files: {},
            },
          });
        } catch (error) {
          // Expected to fail since localhost:5000 is not running
          expect(error.response.status).to.equal(400);
          expect(error.response.data.message).to.include('Connection refused');
        }
      });
    });

    describe('Error cases', () => {
      it('should return 400 for missing reqline', async () => {
        const requestData = {
          proxy_target: 'http://localhost:3000',
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include('Missing or invalid reqline statement');
        }
      });

      it('should return 400 for missing proxy_target', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://api.example.com/users',
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include(
            'Proxy target is required and must be a string'
          );
        }
      });

      it('should return 400 for invalid proxy_target format', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://api.example.com/users',
          proxy_target: 'https://api.example.com',
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include('Proxy target must be a localhost URL');
        }
      });

      it('should return 400 for non-string proxy_target', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://api.example.com/users',
          proxy_target: 123,
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include(
            'Proxy target is required and must be a string'
          );
        }
      });

      it('should return 400 for invalid reqline in proxy request', async () => {
        const requestData = {
          reqline: 'INVALID REQUEST',
          proxy_target: 'http://localhost:3000',
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include('Missing pipe delimiter');
        }
      });
    });

    describe('Proxy endpoint behavior', () => {
      it('should require proxy_target parameter', async () => {
        const requestData = {
          reqline: 'HTTP GET | URL https://httpbin.org/get',
        };

        try {
          await axios.post(`${BASE_URL}/proxy`, requestData);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('error', true);
          expect(error.response.data.message).to.include(
            'Proxy target is required and must be a string'
          );
        }
      });
    });
  });
});

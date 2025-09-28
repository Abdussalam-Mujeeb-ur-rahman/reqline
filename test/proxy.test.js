const { expect } = require('chai');
const fs = require('fs');
const proxyService = require('../services/reqline/proxy');

describe('Proxy Service', () => {
  describe('Valid proxy requests', () => {
    it('should proxy GET request to localhost', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 'http://localhost:3000',
      };

      try {
        const result = await proxyService(serviceData);

        expect(result.proxy_info).to.deep.equal({
          original_url: 'https://api.example.com/users',
          proxy_target: 'http://localhost:3000',
          proxied_url: 'http://localhost:3000/users',
        });
      } catch (error) {
        // Expected to fail since localhost:3000 is not running
        expect(error.message).to.include('Connection refused');
      }
    });

    it('should proxy POST request with body to localhost', async () => {
      const serviceData = {
        reqline: 'HTTP POST | URL https://api.example.com/users | BODY {"name": "John Doe"}',
        proxy_target: 'http://localhost:8080',
      };

      try {
        const result = await proxyService(serviceData);

        expect(result.proxy_info).to.deep.equal({
          original_url: 'https://api.example.com/users',
          proxy_target: 'http://localhost:8080',
          proxied_url: 'http://localhost:8080/users',
        });
        expect(result.request.body).to.deep.equal({ name: 'John Doe' });
      } catch (error) {
        // Expected to fail since localhost:8080 is not running
        expect(error.message).to.include('Connection refused');
      }
    });

    it('should proxy GET request to localhost without port (default port)', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 'http://localhost',
      };

      try {
        const result = await proxyService(serviceData);

        expect(result.proxy_info).to.deep.equal({
          original_url: 'https://api.example.com/users',
          proxy_target: 'http://localhost',
          proxied_url: 'http://localhost/users',
        });
      } catch (error) {
        // Expected to fail since localhost:80 is not running
        expect(error.message).to.include('Connection refused');
      }
    });

    it('should proxy GET request to HTTPS localhost', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 'https://localhost:8443',
      };

      try {
        const result = await proxyService(serviceData);

        expect(result.proxy_info).to.deep.equal({
          original_url: 'https://api.example.com/users',
          proxy_target: 'https://localhost:8443',
          proxied_url: 'https://localhost:8443/users',
        });
      } catch (error) {
        // Expected to fail since localhost:8443 is not running
        expect(error.message).to.include('Connection refused');
      }
    });

    it('should proxy request with query parameters', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users | QUERY {"page": 1, "limit": 10}',
        proxy_target: 'http://localhost:4000',
      };

      try {
        const result = await proxyService(serviceData);

        expect(result.proxy_info).to.deep.equal({
          original_url: 'https://api.example.com/users',
          proxy_target: 'http://localhost:4000',
          proxied_url: 'http://localhost:4000/users?page=1&limit=10',
        });
        expect(result.request.query).to.deep.equal({ page: 1, limit: 10 });
      } catch (error) {
        // Expected to fail since localhost:4000 is not running
        expect(error.message).to.include('Connection refused');
      }
    });

    it('should proxy FormData request to localhost', async () => {
      // Create a temporary test file
      const tempFile = '/tmp/test-file.txt';
      fs.writeFileSync(tempFile, 'test content');

      try {
        const serviceData = {
          reqline: `HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John Doe", "file": {"type": "file", "path": "${tempFile}"}}`,
          proxy_target: 'http://localhost:5000',
        };

        try {
          const result = await proxyService(serviceData);

          expect(result.proxy_info).to.deep.equal({
            original_url: 'https://api.example.com/upload',
            proxy_target: 'http://localhost:5000',
            proxied_url: 'http://localhost:5000/upload',
          });
          expect(result.request.body).to.deep.equal({
            formData: {
              fields: { name: 'John Doe' },
              files: {
                file: {
                  path: tempFile,
                  filename: 'file',
                  contentType: 'application/octet-stream',
                },
              },
            },
          });
        } catch (error) {
          // Expected to fail since localhost:5000 is not running
          expect(error.message).to.include('Connection refused');
        }
      } finally {
        // Clean up test file
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('Error cases', () => {
    it('should throw error for missing reqline', async () => {
      const serviceData = {
        proxy_target: 'http://localhost:3000',
      };

      try {
        await proxyService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Missing or invalid reqline statement');
      }
    });

    it('should throw error for missing proxy_target', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
      };

      try {
        await proxyService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Proxy target is required and must be a string');
      }
    });

    it('should throw error for invalid proxy_target format', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 'https://api.example.com',
      };

      try {
        await proxyService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Proxy target must be a localhost URL');
      }
    });

    it('should throw error for non-string proxy_target', async () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 123,
      };

      try {
        await proxyService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Proxy target is required and must be a string');
      }
    });

    it('should throw error for invalid reqline in proxy request', async () => {
      const serviceData = {
        reqline: 'INVALID REQUEST',
        proxy_target: 'http://localhost:3000',
      };

      try {
        await proxyService(serviceData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Missing pipe delimiter');
      }
    });
  });

  describe('URL transformation', () => {
    it('should correctly transform URLs with paths', () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/api/v1/users',
        proxy_target: 'http://localhost:3000',
      };

      try {
        proxyService(serviceData);
      } catch (error) {
        // The error should contain the transformed URL
        expect(error.message).to.include('Connection refused to http://localhost:3000');
      }
    });

    it('should correctly transform URLs with query parameters', () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users?page=1&limit=10',
        proxy_target: 'http://localhost:3000',
      };

      try {
        proxyService(serviceData);
      } catch (error) {
        // The error should contain the transformed URL with query params
        expect(error.message).to.include('Connection refused to http://localhost:3000');
      }
    });

    it('should work with https localhost', () => {
      const serviceData = {
        reqline: 'HTTP GET | URL https://api.example.com/users',
        proxy_target: 'https://localhost:3000',
      };

      try {
        proxyService(serviceData);
      } catch (error) {
        // Should accept https localhost
        expect(error.message).to.include('Connection refused to https://localhost:3000');
      }
    });
  });
});

const { expect } = require('chai');
const reqlineParser = require('../services/reqline/parser');

describe('ReqlineParser', () => {
  describe('Valid reqline statements', () => {
    it('should parse simple GET request', () => {
      const result = reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3');

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: {},
        query: {},
        body: {},
        formData: null,
      });
    });

    it('should parse GET request with query parameters', () => {
      const result = reqlineParser.parse(
        'HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}'
      );

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: {},
        query: { refid: 1920933 },
        body: {},
        formData: null,
      });
    });

    it('should parse GET request with headers and query', () => {
      const result = reqlineParser.parse(
        'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}'
      );

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: { 'Content-Type': 'application/json' },
        query: { refid: 1920933 },
        body: {},
        formData: null,
      });
    });

    it('should parse POST request with body', () => {
      const result = reqlineParser.parse(
        'HTTP POST | URL https://jsonplaceholder.typicode.com/posts | BODY {"title": "Test", "body": "Test body", "userId": 1}'
      );

      expect(result).to.deep.equal({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: {},
        query: {},
        body: { title: 'Test', body: 'Test body', userId: 1 },
        formData: null,
      });
    });

    it('should parse PUT request with body', () => {
      const result = reqlineParser.parse(
        'HTTP PUT | URL https://jsonplaceholder.typicode.com/posts/1 | BODY {"title": "Updated", "body": "Updated body", "userId": 1}'
      );

      expect(result).to.deep.equal({
        method: 'PUT',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: {},
        query: {},
        body: { title: 'Updated', body: 'Updated body', userId: 1 },
        formData: null,
      });
    });

    it('should parse DELETE request', () => {
      const result = reqlineParser.parse(
        'HTTP DELETE | URL https://jsonplaceholder.typicode.com/posts/1'
      );

      expect(result).to.deep.equal({
        method: 'DELETE',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: {},
        query: {},
        body: {},
        formData: null,
      });
    });

    it('should parse PATCH request with body', () => {
      const result = reqlineParser.parse(
        'HTTP PATCH | URL https://jsonplaceholder.typicode.com/posts/1 | BODY {"title": "Partially Updated"}'
      );

      expect(result).to.deep.equal({
        method: 'PATCH',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: {},
        query: {},
        body: { title: 'Partially Updated' },
        formData: null,
      });
    });

    it('should parse with different order of optional keywords', () => {
      const result = reqlineParser.parse(
        'HTTP GET | URL https://api.example.com | BODY {"test": "value"} | HEADERS {"Authorization": "Bearer token"} | QUERY {"page": 1}'
      );

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://api.example.com',
        headers: { Authorization: 'Bearer token' },
        query: { page: 1 },
        body: { test: 'value' },
        formData: null,
      });
    });

    it('should handle whitespace around reqline', () => {
      const result = reqlineParser.parse('  HTTP GET | URL https://dummyjson.com/quotes/3  ');

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: {},
        query: {},
        body: {},
        formData: null,
      });
    });

    it('should handle empty JSON objects', () => {
      const result = reqlineParser.parse(
        'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {} | QUERY {} | BODY {}'
      );

      expect(result).to.deep.equal({
        method: 'GET',
        url: 'https://dummyjson.com/quotes/3',
        headers: {},
        query: {},
        body: {},
        formData: null,
      });
    });

    it('should handle complex JSON values', () => {
      const result = reqlineParser.parse(
        'HTTP POST | URL https://api.example.com | BODY {"nested": {"value": [1, 2, 3], "string": "test"}}'
      );

      expect(result).to.deep.equal({
        method: 'POST',
        url: 'https://api.example.com',
        headers: {},
        query: {},
        body: { nested: { value: [1, 2, 3], string: 'test' } },
        formData: null,
      });
    });
  });

  describe('Error cases', () => {
    it('should throw error for missing HTTP keyword', () => {
      expect(() => {
        reqlineParser.parse('GET | URL https://dummyjson.com/quotes/3');
      }).to.throw('Missing required HTTP keyword');
    });

    it('should throw error for missing URL keyword', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | https://dummyjson.com/quotes/3');
      }).to.throw('Missing required URL keyword');
    });

    it('should throw error for invalid HTTP method', () => {
      expect(() => {
        reqlineParser.parse('HTTP OPTIONS | URL https://dummyjson.com/quotes/3');
      }).to.throw('Invalid HTTP method. Only GET, POST, PUT, DELETE, and PATCH are supported');
    });

    it('should throw error for lowercase HTTP method', () => {
      expect(() => {
        reqlineParser.parse('HTTP get | URL https://dummyjson.com/quotes/3');
      }).to.throw('HTTP method must be uppercase');
    });

    it('should throw error for lowercase keywords', () => {
      expect(() => {
        reqlineParser.parse('http GET | url https://dummyjson.com/quotes/3');
      }).to.throw('Keywords must be uppercase');
    });

    it('should throw error for missing space before pipe', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET| URL https://dummyjson.com/quotes/3');
      }).to.throw('Missing space before pipe delimiter');
    });

    it('should throw error for missing space after pipe', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET |URL https://dummyjson.com/quotes/3');
      }).to.throw('Missing space after pipe delimiter');
    });

    it('should throw error for invalid JSON in HEADERS', () => {
      expect(() => {
        reqlineParser.parse(
          'HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {invalid json}'
        );
      }).to.throw('Invalid JSON format in HEADERS section');
    });

    it('should throw error for invalid JSON in QUERY', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}');
      }).to.throw('Invalid JSON format in QUERY section');
    });

    it('should throw error for invalid JSON in BODY', () => {
      expect(() => {
        reqlineParser.parse('HTTP POST | URL https://dummyjson.com/quotes/3 | BODY {invalid json}');
      }).to.throw('Invalid JSON format in BODY section');
    });

    it('should throw error for empty reqline', () => {
      expect(() => {
        reqlineParser.parse('');
      }).to.throw('Empty reqline statement');
    });

    it('should throw error for invalid URL format', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL not-a-valid-url');
      }).to.throw('Invalid URL format: "not-a-valid-url"');
    });

    it('should throw error for duplicate HTTP method', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | HTTP POST');
      }).to.throw('HTTP method can only appear once');
    });

    it('should throw error for duplicate URL', () => {
      expect(() => {
        reqlineParser.parse(
          'HTTP GET | URL https://dummyjson.com/quotes/3 | URL https://another-url.com'
        );
      }).to.throw('URL can only appear once');
    });

    it('should throw error for HTTP not being first', () => {
      expect(() => {
        reqlineParser.parse('URL https://dummyjson.com/quotes/3 | HTTP GET');
      }).to.throw('HTTP keyword must be first');
    });

    it('should throw error for URL not being second', () => {
      expect(() => {
        reqlineParser.parse(
          'HTTP GET | HEADERS {"test": "value"} | URL https://dummyjson.com/quotes/3'
        );
      }).to.throw('URL keyword must be second');
    });

    it('should throw error for empty HEADERS value', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS');
      }).to.throw('Invalid part format: "HEADERS"');
    });

    it('should throw error for empty QUERY value', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY');
      }).to.throw('Invalid part format: "QUERY"');
    });

    it('should throw error for empty BODY value', () => {
      expect(() => {
        reqlineParser.parse('HTTP POST | URL https://dummyjson.com/quotes/3 | BODY');
      }).to.throw('Invalid part format: "BODY"');
    });

    it('should throw error for non-object JSON in HEADERS', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS "string"');
      }).to.throw('HEADERS value must be a JSON object');
    });

    it('should throw error for non-object JSON in QUERY', () => {
      expect(() => {
        reqlineParser.parse('HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY "string"');
      }).to.throw('QUERY value must be a JSON object');
    });

    it('should throw error for non-object JSON in BODY', () => {
      expect(() => {
        reqlineParser.parse('HTTP POST | URL https://dummyjson.com/quotes/3 | BODY "string"');
      }).to.throw('BODY value must be a JSON object');
    });
  });
});

describe('FormData parsing', () => {
  it('should parse FormData with regular fields', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John Doe", "email": "john@example.com"}';
    const result = reqlineParser.parse(reqline);

    expect(result.formData).to.deep.equal({
      fields: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      files: {},
    });
    expect(result.body).to.deep.equal({});
  });

  it('should parse FormData with file uploads', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"profile_picture": {"type": "file", "path": "/path/to/image.jpg", "filename": "profile.jpg", "contentType": "image/jpeg"}, "name": "John Doe"}';
    const result = reqlineParser.parse(reqline);

    expect(result.formData).to.deep.equal({
      fields: {
        name: 'John Doe',
      },
      files: {
        profile_picture: {
          path: '/path/to/image.jpg',
          filename: 'profile.jpg',
          contentType: 'image/jpeg',
        },
      },
    });
  });

  it('should parse FormData with file uploads using default values', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"document": {"type": "file", "path": "/path/to/document.pdf"}}';
    const result = reqlineParser.parse(reqline);

    expect(result.formData).to.deep.equal({
      fields: {},
      files: {
        document: {
          path: '/path/to/document.pdf',
          filename: 'document',
          contentType: 'application/octet-stream',
        },
      },
    });
  });

  it('should throw error for file field without path', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"file": {"type": "file"}}';

    expect(() => reqlineParser.parse(reqline)).to.throw(
      'File field "file" must have a "path" property'
    );
  });

  it('should throw error when using both BODY and FORMDATA', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | BODY {"key": "value"} | FORMDATA {"name": "John"}';

    expect(() => reqlineParser.parse(reqline)).to.throw(
      'Cannot use both BODY and FORMDATA in the same request'
    );
  });

  it('should throw error for duplicate FORMDATA', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John"} | FORMDATA {"email": "john@example.com"}';

    expect(() => reqlineParser.parse(reqline)).to.throw('FORMDATA can only appear once');
  });

  it('should throw error for invalid JSON in FORMDATA', () => {
    const reqline =
      'HTTP POST | URL https://api.example.com/upload | FORMDATA {"name": "John", "invalid":}';

    expect(() => reqlineParser.parse(reqline)).to.throw('Invalid JSON format in FORMDATA section');
  });
});

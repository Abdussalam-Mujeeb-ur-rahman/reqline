// Parser implementation without external dependencies for better compatibility

class ParserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParserError';
    this.isParserError = true;
  }
}

class ReqlineParser {
  constructor() {
    this.keywords = ['HTTP', 'URL', 'HEADERS', 'QUERY', 'BODY'];
    this.validMethods = ['GET', 'POST'];
  }

  parse(reqline) {
    if (reqline === '') {
      throw new ParserError('Empty reqline statement');
    }

    if (!reqline || typeof reqline !== 'string') {
      throw new ParserError('Invalid reqline statement');
    }

    const trimmed = reqline.trim();
    if (trimmed === '') {
      throw new ParserError('Empty reqline statement');
    }

    // Split by pipe delimiter
    const parts = this.splitByDelimiter(trimmed);

    // Validate basic structure
    if (parts.length < 2) {
      // Check if this is a missing pipe delimiter case
      if (!trimmed.includes('|')) {
        throw new ParserError(
          'Missing pipe delimiter (|). Use format: HTTP GET | URL https://example.com'
        );
      }
      throw new ParserError(
        'Invalid reqline format. Expected at least HTTP and URL. Check examples if you need help with the format'
      );
    }

    // Check if first part starts with HTTP keyword
    if (parts.length > 0) {
      const firstPart = parts[0].trim();
      const firstWord = this.splitBySpaces(firstPart)[0];
      if (firstWord && firstWord.toUpperCase() !== 'HTTP') {
        // Check if it's a missing HTTP keyword case
        if (firstWord.toUpperCase() === 'GET' || firstWord.toUpperCase() === 'POST') {
          throw new ParserError('Missing required HTTP keyword');
        }
        throw new ParserError('HTTP keyword must be first');
      }
    }

    // Parse each part
    const parsed = {
      method: null,
      url: null,
      headers: {},
      query: {},
      body: {},
    };

    // Process each part
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) {
        // eslint-disable-next-line no-continue
        continue;
      }

      try {
        const parsedPart = this.parsePart(part, i);

        if (parsedPart.type === 'HTTP') {
          if (parsed.method !== null) {
            throw new ParserError('HTTP method can only appear once');
          }
          if (i !== 0) {
            throw new ParserError('HTTP keyword must be first');
          }
          parsed.method = parsedPart.value;
        } else if (parsedPart.type === 'URL') {
          if (parsed.url !== null) {
            throw new ParserError('URL can only appear once');
          }
          if (i !== 1) {
            throw new ParserError('URL keyword must be second');
          }
          parsed.url = parsedPart.value;
        } else if (parsedPart.type === 'HEADERS') {
          parsed.headers = { ...parsed.headers, ...parsedPart.value };
        } else if (parsedPart.type === 'QUERY') {
          parsed.query = { ...parsed.query, ...parsedPart.value };
        } else if (parsedPart.type === 'BODY') {
          parsed.body = { ...parsed.body, ...parsedPart.value };
        }
      } catch (error) {
        // Re-throw parser errors as-is
        if (error.isParserError) {
          throw error;
        }
        // For other errors, provide more specific messages
        throw new ParserError(`Error parsing part "${part}": ${error.message}`);
      }
    }

    // Validate required fields
    if (!parsed.method) {
      throw new ParserError('Missing required HTTP keyword');
    }
    if (!parsed.url) {
      throw new ParserError('Missing required URL keyword');
    }

    return parsed;
  }

  splitByDelimiter(reqline) {
    const parts = [];
    let currentPart = '';
    let i = 0;

    while (i < reqline.length) {
      if (reqline[i] === '|') {
        // Check for proper spacing around pipe
        if (i > 0 && reqline[i - 1] !== ' ') {
          throw new ParserError('Missing space before pipe delimiter');
        }
        if (i < reqline.length - 1 && reqline[i + 1] !== ' ') {
          throw new ParserError('Missing space after pipe delimiter');
        }

        parts.push(currentPart.trim());
        currentPart = '';
        i += 2; // Skip pipe and space
      } else {
        currentPart += reqline[i];
        i++;
      }
    }

    // Add the last part
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  parsePart(part, index) {
    const words = this.splitBySpaces(part);

    if (words.length < 2) {
      // Check if this is a missing keyword case
      if (index === 0 && words[0] !== 'HTTP') {
        throw new ParserError('Missing required HTTP keyword');
      }
      if (index === 1 && words[0] !== 'URL') {
        throw new ParserError('Missing required URL keyword');
      }
      throw new ParserError(`Invalid part format: "${part}"`);
    }

    const keyword = words[0];
    const value = words.slice(1).join(' ');

    // Validate keyword case first
    if (keyword !== keyword.toUpperCase()) {
      throw new ParserError('Keywords must be uppercase');
    }

    // Validate keyword
    if (!this.keywords.includes(keyword)) {
      throw new ParserError(
        `Unknown keyword: "${keyword}". Valid keywords are: ${this.keywords.join(', ')}`
      );
    }

    // Parse based on keyword type
    switch (keyword) {
      case 'HTTP':
        return this.parseHttpMethod(value);
      case 'URL':
        return this.parseUrl(value);
      case 'HEADERS':
        return this.parseJson(value, 'HEADERS');
      case 'QUERY':
        return this.parseJson(value, 'QUERY');
      case 'BODY':
        return this.parseJson(value, 'BODY');
      default:
        throw new ParserError(`Unhandled keyword: ${keyword}`);
    }
  }

  splitBySpaces(part) {
    const words = [];
    let currentWord = '';
    let i = 0;

    while (i < part.length) {
      if (part[i] === ' ') {
        if (currentWord) {
          words.push(currentWord);
          currentWord = '';
        }
        i++;
      } else {
        currentWord += part[i];
        i++;
      }
    }

    if (currentWord) {
      words.push(currentWord);
    }

    return words;
  }

  parseHttpMethod(value) {
    if (value !== value.toUpperCase()) {
      throw new ParserError('HTTP method must be uppercase');
    }

    if (!this.validMethods.includes(value)) {
      throw new ParserError('Invalid HTTP method. Only GET and POST are supported');
    }

    return { type: 'HTTP', value };
  }

  parseUrl(value) {
    if (!value || value.trim() === '') {
      throw new ParserError('URL value cannot be empty');
    }

    // Basic URL validation
    try {
      // eslint-disable-next-line node/no-unsupported-features/node-builtins, no-new
      new URL(value);
    } catch (error) {
      throw new ParserError(`Invalid URL format: "${value}"`);
    }

    return { type: 'URL', value };
  }

  parseJson(value, keyword) {
    if (!value || value.trim() === '') {
      throw new ParserError(`${keyword} value cannot be empty`);
    }

    try {
      const parsed = JSON.parse(value);

      if (typeof parsed !== 'object' || parsed === null) {
        throw new ParserError(`${keyword} value must be a JSON object`);
      }

      return { type: keyword, value: parsed };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ParserError(`Invalid JSON format in ${keyword} section`);
      }
      throw error;
    }
  }
}

module.exports = new ReqlineParser();

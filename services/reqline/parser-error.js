class ParserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParserError';
    this.isParserError = true;
  }
}

module.exports = ParserError;

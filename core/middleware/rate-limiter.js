const rateLimit = require('express-rate-limit');

// Create a rate limiter instance
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    error: true,
    message: 'Too many requests from this IP, please try again later. Check examples if you need help with the format',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (for proxy environments)
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      error: true,
      message: 'Too many requests from this IP, please try again later. Check examples if you need help with the format',
    });
  },
});

// Create a stricter limiter for the main reqline endpoint
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs for the main endpoint
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    error: true,
    message: 'Too many requests from this IP, please try again later. Check examples if you need help with the format',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (for proxy environments)
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      error: true,
      message: 'Too many requests from this IP, please try again later. Check examples if you need help with the format',
    });
  },
});

// Create a very strict limiter for potential abuse
const abuseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    code: 'ABUSE_LIMIT_EXCEEDED',
    error: true,
    message: 'Too many rapid requests from this IP, please slow down. Check examples if you need help with the format',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (for proxy environments)
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: 'ABUSE_LIMIT_EXCEEDED',
      error: true,
      message: 'Too many rapid requests from this IP, please slow down. Check examples if you need help with the format',
    });
  },
});

module.exports = {
  limiter,
  strictLimiter,
  abuseLimiter,
}; 
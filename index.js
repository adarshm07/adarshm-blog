const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Proxy configuration
const proxyOptions = {
  target: 'https://api.codeium.com',
  changeOrigin: true,
  secure: true,
  followRedirects: true,
  logLevel: 'debug',
  
  // Handle headers
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to https://api.codeium.com${req.url}`);
    
    // Preserve original headers
    Object.keys(req.headers).forEach(key => {
      if (key.toLowerCase() !== 'host') {
        proxyReq.setHeader(key, req.headers[key]);
      }
    });
    
    // Set proper host header for the target
    proxyReq.setHeader('host', 'api.codeium.com');
    
    // If there's a body, make sure it's properly forwarded
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  
  // Handle response
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from api.codeium.com: ${proxyRes.statusCode}`);
    
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  },
  
  // Handle errors
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Proxy error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Create proxy middleware
const apiProxy = createProxyMiddleware(proxyOptions);

// Route all requests to the proxy
app.use('/', apiProxy);

// Health check endpoint (accessible before proxy catches all routes)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    proxy_target: 'https://api.codeium.com'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Codeium API Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxying all requests to: https://api.codeium.com`);
  console.log(`🔗 Configure Windsurf to use: http://localhost:${PORT}`);
  console.log(`💚 Health check available at: http://localhost:${PORT}/health`);
});
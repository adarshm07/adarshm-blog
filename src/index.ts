import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Proxy configuration
const proxyOptions: Options = {
  target: 'https://api.codeium.com',
  changeOrigin: true,
  secure: true,
  followRedirects: true,
  logLevel: 'debug',
  
  // Handle headers
  onProxyReq: (proxyReq, req: IncomingMessage, res: ServerResponse) => {
    const request = req as Request;
    console.log(`Proxying ${request.method} ${request.url} to https://api.codeium.com${request.url}`);
    
    // Preserve original headers
    Object.keys(request.headers).forEach(key => {
      if (key.toLowerCase() !== 'host' && request.headers[key]) {
        proxyReq.setHeader(key, request.headers[key] as string);
      }
    });
    
    // Set proper host header for the target
    proxyReq.setHeader('host', 'api.codeium.com');
    
    // If there's a body, make sure it's properly forwarded
    if ((request as any).body && Object.keys((request as any).body).length > 0) {
      const bodyData = JSON.stringify((request as any).body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  
  // Handle response
  onProxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
    const request = req as Request;
    console.log(`Response from api.codeium.com: ${proxyRes.statusCode}`);
    
    // Add CORS headers to response
    if (proxyRes.headers) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
      proxyRes.headers['Access-Control-Allow-Headers'] = '*';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    }
  },
  
  // Handle errors
  onError: (err: Error, req: IncomingMessage, res: ServerResponse) => {
    const response = res as Response;
    console.error('Proxy error:', err);
    response.status(500).json({
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
app.get('/health', (req: Request, res: Response) => {
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
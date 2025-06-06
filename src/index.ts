import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import cors from "cors";
import { IncomingMessage, ServerResponse } from "http";

const app = express();
const PORT: number = parseInt(process.env.PORT || "3001", 10);

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["*"],
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// Log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Determine proxy target dynamically
const resolveTarget = (req: Request): string => {
  const { hostname, path } = req;

  const defaultTarget = "https://server.codeium.com";

  const targetMap: { [key: string]: string } = {
    "/unleash": "https://unleash.codeium.com",
    "/inference": "https://inference.codeium.com",
    "/server": "https://server.codeium.com",
    "/codeiumdata": "https://codeiumdata.com",
  };

  for (const prefix in targetMap) {
    if (req.url.startsWith(prefix)) {
      return targetMap[prefix]!;
    }
  }

  // Handle *.codeiumdata.com dynamically based on Host header
  if (req.headers.host && req.headers.host.endsWith(".codeiumdata.com")) {
    return `https://${req.headers.host}`;
  }

  return defaultTarget;
};

// Proxy handler
app.use(
  "/",
  (req, res, next) => {
    const dynamicTarget = resolveTarget(req);
    console.log(`🔀 Routing to: ${dynamicTarget}${req.url}`);

    return createProxyMiddleware({
      target: dynamicTarget,
      changeOrigin: true,
      secure: false,
      followRedirects: true,
      logLevel: "debug",

      onProxyReq: (proxyReq, req, res) => {
        const request = req as Request;
        Object.keys(request.headers).forEach((key) => {
          if (key.toLowerCase() !== "host" && request.headers[key]) {
            proxyReq.setHeader(key, request.headers[key] as string);
          }
        });

        proxyReq.setHeader("host", new URL(dynamicTarget).hostname);

        if ((request as any).body && Object.keys((request as any).body).length > 0) {
          const bodyData = JSON.stringify((request as any).body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },

      onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Response from ${resolveTarget(req)}: ${proxyRes.statusCode}`);
        if (proxyRes.headers) {
          proxyRes.headers["Access-Control-Allow-Origin"] = "*";
          proxyRes.headers["Access-Control-Allow-Methods"] =
            "GET, POST, PUT, DELETE, OPTIONS, PATCH";
          proxyRes.headers["Access-Control-Allow-Headers"] = "*";
          proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
        }
      },

      onError: (err, req, res) => {
        const response = res as Response;
        console.error("❌ Proxy error:", err);
        response.status(500).json({
          error: "Proxy error",
          message: err.message,
          timestamp: new Date().toISOString(),
        });
      },
    })(req, res, next);
  },
);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    proxy_targets: [
      "https://server.codeium.com",
      "https://unleash.codeium.com",
      "https://inference.codeium.com",
      "https://codeiumdata.com",
      "*.codeiumdata.com",
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Codeium Multi-Target Proxy Server running on port ${PORT}`);
  console.log(`🔗 Configure your app to use: http://localhost:${PORT}`);
});
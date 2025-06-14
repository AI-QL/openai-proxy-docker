#!/usr/bin/env node

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

// ========== Default Config ==========
const defaultPort = 9017;
const defaultTarget = 'https://api.openai.com';

// ========== Core Proxy App ==========
function createProxyApp(target) {
    const app = express();
    
    app.use('/', createProxyMiddleware({
        target: target,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req, res) => {
                proxyReq.removeHeader('x-forwarded-for');
                proxyReq.removeHeader('x-real-ip');
            },
            proxyRes: (proxyRes, req, res) => {
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
                proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            },
            error: (err, req, res) => {
                console.error('Proxy error:', err);
                res.status(500).send('Proxy error');
            },
        },
    }));
    
    return app;
}

// ========== Main App ==========
const parseArguments = () => {
  const args = process.argv.slice(2);
  const result = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--port=')) {
      result.port = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
      result.target = arg.split('=')[1];
    }
  });
  
  return result;
};

const validatePort = (port) => {
  const portNum = parseInt(port);
  if (isNaN(portNum)) throw new Error(`Invalid port: ${port}`);
  if (portNum < 1 || portNum > 65535) throw new Error(`Port out of range: ${port}`);
  return portNum;
};

const validateTarget = (target) => {
  try {
    new URL(target);
    return target;
  } catch {
    throw new Error(`Invalid target URL: ${target}`);
  }
};

const runProxy = () => {
  try {
    const args = parseArguments();
    const port = args.port || process.env.PORT || defaultPort;
    const target = args.target || process.env.TARGET || defaultTarget;
    
    const validatedPort = validatePort(port);
    const validatedTarget = validateTarget(target);
    
    const app = createProxyApp(validatedTarget);
    
    const server = app.listen(validatedPort, () => {
      console.log('API Proxy running:');
      console.log(`    Local:  http://localhost:${validatedPort}`);
      console.log(`    Target: ${validatedTarget}`);
      console.log('\nPress Ctrl+C to stop');
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${validatedPort} is already in use`);
      } else {
        console.error(`❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('\nShutting down proxy...');
      server.close(() => process.exit(0));
    });
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

runProxy();
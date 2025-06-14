const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function createProxyApp(target) {
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
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()
const port = process.env.PORT || 9017
const target = process.env.TARGET || 'https://api.openai.com'

app.use('/', createProxyMiddleware({
    target: target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.removeHeader('x-forwarded-for');
        proxyReq.removeHeader('x-real-ip');
    },
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
}));

app.listen(port, () => {
    console.log(`Proxy agent started: http://localhost:${port}`)
})

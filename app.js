const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()
const port = process.env.PORT || 9017
const target = process.env.TARGET || 'https://api.openai.com'

app.use('/', createProxyMiddleware({
    target: target,
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
          /* handle proxyReq */
          proxyReq.removeHeader('x-forwarded-for');
          proxyReq.removeHeader('x-real-ip');
        },
        proxyRes: (proxyRes, req, res) => {
          /* handle proxyRes */
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
          console.log(proxyRes)
        },
        error: (err, req, res) => {
          /* handle error */
        },
      },
}));

app.listen(port, () => {
    console.log(`Proxy agent started: http://localhost:${port}`)
})

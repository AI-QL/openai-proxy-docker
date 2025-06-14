const createProxyApp = require('./core');
const { defaultPort, defaultTarget } = require('./config');

const port = process.env.PORT || defaultPort;
const target = process.env.TARGET || defaultTarget;

const app = createProxyApp(target);

app.listen(port, () => {
    console.log(`Proxy agent started: http://localhost:${port}`);
    console.log(`Target: ${target}`);
});
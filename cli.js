#!/usr/bin/env node

const createProxyApp = require('./core');
const { defaultPort, defaultTarget } = require('./config');

const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const targetArg = args.find(arg => arg.startsWith('--target='));

const port = portArg ? portArg.split('=')[1] : defaultPort;
const target = targetArg ? targetArg.split('=')[1] : defaultTarget;

const app = createProxyApp(target);

app.listen(port, () => {
    console.log(`OpenAI Proxy running:`);
    console.log(`Local:   http://localhost:${port}`);
    console.log(`Target:  ${target}`);
    console.log(`\nPress Ctrl+C to stop`);
});
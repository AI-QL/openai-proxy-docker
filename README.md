# OpenAI Proxy Docker
openai-proxy-docker provides an OpenAI API proxy server image by [Docker](https://hub.docker.com/r/aiql/openai-proxy-docker)


## How to use
Just:

```shell
sudo docker run -d -p 9017:9017 aiql/openai-proxy-docker:latest
```

Then, you can use it by ```YOURIP:9017```

> For example, the proxied OpenAI Chat Completion API will be: ```YOURIP:9017/v1/chat/completions```
> 
> It should be the same as ```api.openai.com/v1/chat/completions```

For detailed usage of OpenAI API, please check: [OpenAI API Reference](https://platform.openai.com/docs/api-reference/introduction) or [RESTful OpenAPI](https://petstore.swagger.io/?url=https://cdn.jsdelivr.net/gh/openai/openai-openapi@master/openapi.yaml)

You can change default port and default target by setting `-e` in docker, which means that you can use it for any backend followed by OpenAPI format:
| Parameter | Default Value |
| ----- | ----- |
| PORT | 9017 |
| TARGET | https://api.openai.com |

## How to maintain
Use PM2 to scale up this proxy application accross CPU(s):
- Listing managed processes
> ```shell
> docker exec -it <container-id> pm2 list
> ```
- Monitoring CPU/Usage of each process
> ```shell
> docker exec -it <container-id> pm2 monit
> ```
- 0sec downtime reload all applications
> ```shell
> docker exec -it <container-id> pm2 reload allk
> ```

## How to dev

Click below to use the GitHub Codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/aiql-community/openai-proxy-docker?quickstart=1)

Or fork this repo and create a codespace manually:
1. Wait for env ready in your browser
2. `npm install ci`
3. `npm start`

And then, the codespace will provide a forward port (default 9017) for you to check the running.

If everything is OK, check the docker by:
```
docker build .
```

## Docker Compose

This is an example if you want to use this for your own domain with HTTPS:
- `YOUREMAILADDR@example.com` will be used to get certification notification from ACME server
- `api.example.com` will be your URL
  > e.g.: the proxied OpenAI Chat Completion API will be: `api.example.com/v1/chat/completions`

```DOCKERFILE
version: '3.5'

services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443/tcp"
      - "443:443/udp"
    environment:
      ENABLE_HTTP3: "true"
    volumes:
      - conf:/etc/nginx/conf.d
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - certs:/etc/nginx/certs:ro
      - /var/run/docker.sock:/tmp/docker.sock:ro
    restart: always
    network_mode: bridge

  acme-companion:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    environment:
      - DEFAULT_EMAIL=YOUREMAILADDR@example.com
    volumes_from:
      - nginx-proxy
    volumes:
      - certs:/etc/nginx/certs:rw
      - acme:/etc/acme.sh
      - /var/run/docker.sock:/var/run/docker.sock:ro
    network_mode: bridge

  openai-proxy:
    image: aiql/openai-proxy-docker:latest
    container_name: openai-proxy
    environment:
      LETSENCRYPT_HOST: api.example.com
      VIRTUAL_HOST: api.example.com
      VIRTUAL_PORT: "9017"
    network_mode: host
    depends_on:
      - "nginx-proxy"

volumes:
  conf:
  vhost:
  html:
  certs:
  acme:
```

<p align="center">
  <br>
  <img width="240" src="./src/assets/tapps.png" alt="logo of telegram web apps">
  <br>
  <br>
</p>

# Telegram Mini Apps(TMA) + React + TypeScript + Vite

Vite (which means "fast" in French) is a front-end build tool and development server that aims to provide a faster and leaner development experience for modern web projects. We will utilise Vite to create Telegram Mini App example.

This template provides a minimal setup to get TMA working in Vite with React, TypeScript, HMR and some ESLint rules.



## 🚀 Deploy

### Deploy to GitHub Pages

Workflow is set up to deploy to GitHub Pages when a push is made to the `main` branch.
`/.github/workflows/static.yml`

### Run locally

```bash
# npm
npm install
npm run dev --host
```
```bash
# yarn
yarn
yarn dev --host
```

### Docker

Configuration for running multiple applications in one network on a single server

Initial setup (performed once)

```bash
# Create a common network for all containers
docker network create tma_network
# Create .env file for the first application
cat > .env << EOF
APP_NAME=app1
APP_PORT=3001
EOF
```

Run container

```bash
docker-compose up -d
```

Nginx Proxy configuration on a separate server


# Links
- [Doc](https://docs.ton.org/develop/dapps/twa)
- [Example TMA](https://t.me/vite_twa_example_bot/app)
- [Link](https://twa-dev.github.io/vite-boilerplate/)

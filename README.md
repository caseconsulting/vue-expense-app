### Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Application Tasks](#application-tasks)
- [Deployment](#deployment)
- [Documentation](#documentation)

## Setup

The **Expense Application** is written in **Vue.js** and relies on **Node.js** v20.x+ and the **npm** package management system. UI is enhanced with **Vuetify.js**.

- Download and install Node.js v20.x from: https://nodejs.org/en/ or https://nodejs.org/dist/latest-v20.x/
- Install required Node.js modules:

```
npm ci
```

## Environment variables

In order to use **Auth0** authentication, you will need to define some environment variables:

- **VITE_AUTH0_API_ID**
- **VITE_AUTH0_CALLBACK**
- **VITE_AUTH0_CLIENT_ID**
- **VITE_AUTH0_DOMAIN**

The following environment variables are required to support multiple environments:

- **VITE_API_HOSTNAME**
- **VITE_API_PORT**
- **NODE_ENV**

**Vite** automatically picks up environment variables in `.env` files. Any variables that begin with **VITE**
will be included in the client bundle created by webpack. They will be accessible from your code using **import.meta.env.**.
At build time, Vite will replace these references with their corresponding values. For more information, go to:
https://vitejs.dev/guide/env-and-mode.
The `.env` file in the **case-expense-app** S3 bucket in the company AWS account has up-to-date values to run locally.
Download this file to the project root directory:

```
npm run download:local:env
```

To download a specific environment's .env file:

```
npm run download:{Stage}:env
```

Where Stage is the name of the environment (local, dev, test, prod, etc.)

## Application tasks

To run locally (i.e., start a development server):

```
npm run serve
```

To build for production deployment (i.e., create the _\dist_ directory):

```
npm run build
```

To perform static code analysis (i.e., lint):

```
npm run lint
```

To run unit tests (with Jest):

```
npm run test
```

To upgrade to the latest version of a specific Node.js module:

```
npm update --save <module-name>@latest
```

To upgrade to the latest version of a specific Node.js module, which is a development dependency only:

```
npm update --save-dev <module-name>@latest
```

## Deployment

To download dev .env and then deploy to the dev environment:

```
npm run deploy:dev
```

To download test .env and then deploy to the test environment:

```
npm run deploy:test
```

### DANGER DANGER

**To download prod .env and then deploy to the prod environment:**

make a pull request from master to release in git hub

```
export AWS_PROFILE=prod
git checkout release
git pull
npm run reintall
npm run deploy:prod
git checkout master
```

To reset for local development, after a deployment:

```
export AWS_PROFILE=dev
npm run download:local:env
```

## Documentation

### Internal documentation

**CSV utils**

https://github.com/caseconsulting/vue-expense-app/blob/master/src/utils/csv/README.md

**Charts and ChartJS**

https://github.com/caseconsulting/vue-expense-app/blob/master/src/components/charts/README.md

### External documentation

**Vue:**

https://vuejs.org/v2/guide/

Please note we are currently using Vue2. When we migrate to Vue3 replace the above link.

**Vuetify:**

https://vuetifyjs.com/en/

**Lodash:**

https://lodash.com/

**Day.js:**

https://day.js.org/en/

**Axios:**

https://github.com/axios/axios

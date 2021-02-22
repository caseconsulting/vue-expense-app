## Setup

The **Expense Application** is written in **Vue.js** and relies on **Node.js** v12.x+ and the **npm** package management system. UI is enhanced with **Vuetify.js** and **BootStrap-vue**.

* Download and install Node.js v12.x from: https://nodejs.org/en/ or https://nodejs.org/dist/latest-v12.x/
* Install required Node.js modules:

```
npm ci
```

## Environment variables

In order to use **Auth0** authentication, you will need to define some environment variables:

* **VUE_APP_AUTH0_API_ID**
* **VUE_APP_AUTH0_CALLBACK**
* **VUE_APP_AUTH0_CLIENT_ID**
* **VUE_APP_AUTH0_DOMAIN**

The following environment variables are required to support multiple environments:

* **VUE_APP_API_HOSTNAME**
* **VUE_APP_API_PORT**
* **NODE_ENV**

**vue-cli** automatically picks up environment variables in `.env` files. Any variables that begin with **VUE_APP_**
will be included in the client bundle created by webpack. They will be accessible from your code using **process.env**.
At build time, webpack will replace these references with their corresponding values. For more information, go to:
https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code.
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

To run integration tests (with Cypress), headlessly in the background:

```
npm run e2e
```

To run integration tests (with Cypress), interactively in an open window:

```
npm run e2e:open
```

To inspect internal webpack config:

```
npm run inspect
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
git checkout release
git pull
npm ci
npm run deploy:prod
git checkout master
```

To reset for local development, after a deployment:

```
npm run download:local:env
```

## Documentation

**Vue:**

https://vuejs.org/v2/guide/

Please note we are currently using Vue2. When we migrate to Vue3 replace the above link.

**Vuetify:**

https://vuetifyjs.com/en/

**Bootstrap-vue:**

https://bootstrap-vue.org/docs

**Lodash:**

https://lodash.com/

**Moment:**

https://momentjs.com/docs/

**Axios:**

https://github.com/axios/axios

**CKEditor:**

https://ckeditor.com/docs/ckeditor5/latest/framework/guides/overview.html
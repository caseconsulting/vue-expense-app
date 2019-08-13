## Setup

The **Expense Application** is written in **Vue.js** and relies on **Node.js** v8.x+ and the **npm** package management system.

* Download and install Node.js v8.x from: https://nodejs.org/dist/latest-v8.x/
* Install required Node.js modules:

```
npm install --no-optional
npm prune
npm dedupe
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
aws s3 cp s3://case-expense-app/.env .env
```

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
npm update --save <module-name>
```
To upgrade to the latest version of a specific Node.js module, which is a development dependency only:

```
npm update --save-dev <module-name>
```

## Deployment

To deploy to the dev environment:

```
aws s3 cp s3://case-consulting-expense-app-resources-dev/.env .env
npm run deploy:dev
```

To deploy to the test environment:

```
aws s3 cp s3://case-consulting-expense-app-resources-test/.env .env
npm run deploy:test
```

```diff
- To deploy to the prod environment:
```

```
aws s3 cp s3://case-consulting-expense-app-resources-prod/.env .env
npm run deploy:prod
```

To reset for local development, after a deployment:

```
aws s3 cp s3://case-expense-app/.env .env
```

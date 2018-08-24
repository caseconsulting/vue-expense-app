## Setup

The **Expense Application** is written in **Vue.js** and relies on **Node.js** v8.x+ and the **yarn** package management system.

* Download and install Node.js from: https://nodejs.org/
* Download and install yarn from: https://yarnpkg.com/en/docs/install
* Install required Node.js modules:

```
yarn install
```

## Environment variables

In order to use **Auth0** authentication, you will need to define four environment variables:

* **VUE_APP_AUTH0_API_ID**
* **VUE_APP_AUTH0_CLIENT_ID**
* **VUE_APP_AUTH0_DOMAIN**
* **VUE_APP_HOSTNAME**

**vue-cli** automatically picks up environment variables in `.env` files. Therefore, you can store these variables in a
`.env` file in the project root directory. The `.env.local` file in the **case-expense-app** S3 bucket in the company
AWS account has up-to-date values to run locally. Download this file to the project root directory:

```
aws s3 cp s3://case-expense-app/vue/.env.local .env
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
yarn add <module-name> --save
```

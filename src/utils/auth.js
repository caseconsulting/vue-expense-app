import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import Router from 'vue-router';

const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';

const CLIENT_ID = AUTH_CONFIG.clientId;
const CLIENT_DOMAIN = AUTH_CONFIG.domain;
const REDIRECT = AUTH_CONFIG.callbackUrl;
const SCOPE = 'openid';
// const AUDIENCE = `https://${AUTH_CONFIG.domain}/userinfo`;

var auth = new auth0.WebAuth({
  clientID: 'w9Ih4cZX8Plry47ZuoAcbnwGEG4hFeZx',
  domain: 'consultwithcase.auth0.com',
  responseType: 'token id_token',
  audience: 'https://consultwithcase.auth0.com/api/v2/',
  redirectUri: 'http://localhost:8080/callback',
  scope: 'openid email'
});

export function login() {
  auth.authorize();
}

var router = new Router({
  mode: 'history'
});

export function logout() {
  clearIdToken();
  clearAccessToken();
  router.go('/');
}

export function requireAuth(to, from, next) {
  if (!isLoggedIn()) {
    next({
      path: '/',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
}

export function getIdToken() {
  return localStorage.getItem(ID_TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearIdToken() {
  localStorage.removeItem(ID_TOKEN_KEY);
}

function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  console.log('HASH', window.location.hash);
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  console.log('ACCESS TOKEN', accessToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function isLoggedIn() {
  try {
    const idToken = getIdToken();
    return !!idToken && !isTokenExpired(idToken);
  } catch (error) {
    return false;
  }
}

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) {
    return null;
  }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);

  return date;
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}

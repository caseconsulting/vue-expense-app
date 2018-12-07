import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import Router from 'vue-router';
import api from '../shared/api';

const AUDIENCE = AUTH_CONFIG.audience;
const CALLBACK = AUTH_CONFIG.callbackUrl;
const CLIENT_ID = AUTH_CONFIG.clientId;
const DOMAIN = AUTH_CONFIG.domain;

const ACCESS_TOKEN_KEY = 'access_token';
const ID_TOKEN_KEY = 'id_token';
const IMG = 'profilePic';
const ROLE = 'employeeRole';
const SCOPE = 'openid email profile';

var auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: DOMAIN,
  responseType: 'token id_token',
  audience: AUDIENCE,
  redirectUri: CALLBACK,
  scope: SCOPE
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
  clearRole();
  clearProfile();
  router.go('/');
}

export function requireAuth(to, from, next) {
  if (!isLoggedIn()) {
    next({
      path: '/',
      query: { redirect: to.fullPath }
    });
  } else {
    // setRole();
    next();
  }
}

export function isAdmin(to, from, next) {
  if (getRole() === 'admin' || getRole() === 'super-admin') {
    next();
  } else {
    next({
      path: '/home',
      query: { redirect: to.fullPath }
    });
  }
}

export function getIdToken() {
  return sessionStorage.getItem(ID_TOKEN_KEY);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearIdToken() {
  sessionStorage.removeItem(ID_TOKEN_KEY);
}

function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

function clearRole() {
  sessionStorage.removeItem(ROLE);
}

function clearProfile() {
  sessionStorage.removeItem(IMG);
}

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  sessionStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function setProfile() {
  let profile = decode(getIdToken());
  sessionStorage.setItem(IMG, profile.picture);
}

export function getProfile() {
  return sessionStorage.getItem(IMG);
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

export async function setRole() {
  let employeeRole = await api.getRole();
  sessionStorage.setItem(ROLE, employeeRole);
}

export function getRole() {
  return sessionStorage.getItem(ROLE);
}

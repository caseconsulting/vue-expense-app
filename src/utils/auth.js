import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import Router from 'vue-router';
import api from '../shared/api';

const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';
const ROLE = 'employeeRole';
const CALLBACK = process.env.VUE_APP_HOSTNAME + '/callback';
const IMG = 'profilePic'
const SCOPE = 'openid email profile';



var auth = new auth0.WebAuth({
  clientID: 'w9Ih4cZX8Plry47ZuoAcbnwGEG4hFeZx',
  domain: 'consultwithcase.auth0.com',
  responseType: 'token id_token',
  audience: 'https://consultwithcase.auth0.com/api/v2/',
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

function clearRole() {
  localStorage.removeItem(ROLE);
}
function clearProfile() {
  localStorage.removeItem(IMG);
}
// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function setProfile() {
  let profile = decode(getIdToken());
  localStorage.setItem(IMG, profile.picture);
}

export function getProfile() {
  return localStorage.getItem(IMG);
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

// export function setRole(employeeRole) {
//   localStorage.setItem(ROLE, employeeRole);
// }
export async function setRole() {
  let employeeRole = await api.getRole();
  localStorage.setItem(ROLE, employeeRole);
}

export function getRole() {
  return localStorage.getItem(ROLE);
}

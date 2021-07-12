import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import Router from 'vue-router';
import api from '../shared/api';
let CryptoJS = require('crypto-js');

const AUDIENCE = AUTH_CONFIG.audience;
const CALLBACK = AUTH_CONFIG.callbackUrl;
const CLIENT_ID = AUTH_CONFIG.clientId;
const DOMAIN = AUTH_CONFIG.domain;

const ACCESS_TOKEN_KEY = 'access_token';
const ID_TOKEN_KEY = 'id_token';
const IMG = 'profilePic';
const ROLE = 'employeeRole';
const SCOPE = 'openid email profile';

let auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: DOMAIN,
  responseType: 'token id_token',
  audience: AUDIENCE,
  redirectUri: CALLBACK,
  scope: SCOPE
});

let router = new Router({
  mode: 'history'
});

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
} // clearCookies

export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_KEY);
} // getAccessToken

function getCookie(cname) {
  let name = `${cname}=`;
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
} // getCookie

export function getIdToken() {
  return getCookie(ID_TOKEN_KEY);
} // getIdToken

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
} // getParameterByName

export function getProfile() {
  return getCookie(IMG);
} // getProfile

export function getRole() {
  const encryptedRole = getCookie(ROLE);
  if (encryptedRole) {
    const decryptedRole = CryptoJS.AES.decrypt(encryptedRole, process.env.VUE_APP_AES_KEY);
    return decryptedRole.toString(CryptoJS.enc.Utf8);
  }
} // getRole

export function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) {
    return null;
  }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  return date;
} // getTokenExpirationDate

export function isAdmin(to, from, next) {
  if (getRole() === 'admin') {
    next();
  } else {
    next({
      path: '/home',
      query: { redirect: to.fullPath }
    });
  }
} // isAdmin

export function isLoggedIn() {
  try {
    const idToken = getIdToken();
    let isEmployee = getRole() === 'admin' || getRole() === 'user' || getRole() === 'intern' || getRole() === 'manager';
    return !!idToken && !isTokenExpired(idToken) && isEmployee;
  } catch (error) {
    return false;
  }
} // isLoggedIn

export function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate.getTime() - Date.now() <= 0;
} // isTokenExpired

export function login() {
  auth.authorize();
} // login

export function logout() {
  clearCookies();
  router.go('/');
} // logout

export function requireAuth(to, from, next) {
  if (!isLoggedIn()) {
    next({
      path: '/',
      query: { redirect: to.fullPath }
    });
  } else {
    next();
  }
} // requireAuth

// Get and store access_token in local storage
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  setCookie(ACCESS_TOKEN_KEY, accessToken);
} // setAccessToken

function setCookie(cname, cvalue, exdays) {
  if (exdays) {
    let d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  } else {
    document.cookie = `${cname}=${cvalue};path=/`;
  }
} // setCookie

// Get and store id_token in local storage
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  setCookie(ID_TOKEN_KEY, idToken);
} // setIdToken

export function setProfile() {
  let profile = decode(getIdToken());

  setCookie(IMG, profile.picture);
} // setProfile

export async function setRole() {
  const employeeRole = await api.getRole();
  if (employeeRole) {
    const encryptedRole = CryptoJS.AES.encrypt(employeeRole, process.env.VUE_APP_AES_KEY);
    setCookie(ROLE, encryptedRole);
  }
} // setRole

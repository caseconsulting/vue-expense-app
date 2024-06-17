import { jwtDecode } from 'jwt-decode';
import auth0 from 'auth0-js';
import router from '../router';
import { AUTH_CONFIG } from './auth0-variables';
import CryptoJS from 'crypto-js';

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

/**
 * clears the cookies
 */
function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
} // clearCookies

/**
 * gets the access token from cookies
 *
 * @return - the accessToken
 */
export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_KEY);
} // getAccessToken

/**
 * gets a cookie based on it's cname
 *
 * @param {*} cname - the cnmae of the cookie
 * @return - the cookie
 */
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

/**
 * gets the id token from cookies
 *
 * @return - the id token
 */
export function getIdToken() {
  return getCookie(ID_TOKEN_KEY);
} // getIdToken

/**
 * Helper function that will allow us to extract the access_token and id_token
 *
 * @param name - name of the parameter
 * @return - the parameter
 */
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
} // getParameterByName

/**
 * gets the profile image from the cookies
 *
 * @return - the profile img
 */
export function getProfile() {
  return getCookie(IMG);
} // getProfile

/**
 * gets the role of the user from cookies
 *
 * @return - the role of the user
 */
export function getRole() {
  const encryptedRole = getCookie(ROLE);
  if (encryptedRole) {
    const decryptedRole = CryptoJS.AES.decrypt(encryptedRole, import.meta.env.VITE_AES_KEY);
    return decryptedRole.toString(CryptoJS.enc.Utf8);
  }
} // getRole

/**
 * gets the token expiration date
 *
 * @param encodedToken - the encoded token
 * @return - the date from the decoded token
 */
export function getTokenExpirationDate(encodedToken) {
  const token = jwtDecode(encodedToken);
  if (!token.exp) {
    return null;
  }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  return date;
} // getTokenExpirationDate

/**
 * checks to see if the current user is an admin before the router continues
 *
 * @param to - path to next page
 * @param from - page where user was redirected from
 * @param next - function to continue the router
 */
export function isAdmin(to, _, next) {
  if (getRole() === 'admin') {
    next();
  } else {
    next({
      path: '/home',
      query: { redirect: to.fullPath }
    });
  }
} // isAdmin

/**
 * checks to see if the current user is an admin or manager
 *
 * @param to - path to next page
 * @param from - page where user was redirected from
 * @param next - function to continue the router
 */
export function isAdminOrManager(to, _, next) {
  if (getRole() === 'admin' || getRole() === 'manager') {
    next();
  } else {
    next({
      path: '/home',
      query: { redirect: to.fullPath }
    });
  }
} // isAdminOrManager

/**
 * checks to see if the user is logged in
 *
 * @return boolean - if the user is logged in
 */
export function isLoggedIn() {
  try {
    const idToken = getIdToken();
    let isEmployee = getRole() === 'admin' || getRole() === 'user' || getRole() === 'intern' || getRole() === 'manager';
    return !!idToken && !isTokenExpired(idToken) && isEmployee;
  } catch (error) {
    return false;
  }
} // isLoggedIn

/**
 * checks to see if the token is expired
 *
 * @param token - the token to check
 * @return boolean - is the token expired
 */
export function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate.getTime() - Date.now() <= 0;
} // isTokenExpired

/**
 * logs in the user
 */
export async function login() {
  auth.authorize();
  sessionStorage.removeItem('timedOut'); // this key exists if the login session times out, loggin in should remove it
} // login

/**
 * logs out the user
 */
export function logout() {
  clearCookies();
  router.go('/');
} // logout

/**
 * router step to check authorization
 *
 * @param to - path to next page
 * @param from - page where user was redirected from
 * @param next - function to continue the router
 */
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

/**
 * Get and store access_token in local storage
 */
export function setAccessToken() {
  let accessToken = getParameterByName('access_token');
  setCookie(ACCESS_TOKEN_KEY, accessToken);
} // setAccessToken

/**
 * Refresh the user session and replace access_token and id token with new values
 */
export function refreshUserSession() {
  auth.checkSession({}, function (err, authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setCookie(ACCESS_TOKEN_KEY, authResult.accessToken);
      setCookie(ID_TOKEN_KEY, authResult.idToken);
      window.emitter.emit('user-session-refreshed');
    }
  });
} // refreshUserSession

/**
 * sets the cookie
 *
 * @param {*} cname - name of the cookie
 * @param {*} cvalue - the value of the cookie
 * @param {*} exdays - number of days before cookie expiration
 */
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

/**
 * Get and store id_token in local storage
 */
export function setIdToken() {
  let idToken = getParameterByName('id_token');
  setCookie(ID_TOKEN_KEY, idToken);
} // setIdToken

/**
 * sets the profile in cookies
 */
export function setProfile() {
  let profile = jwtDecode(getIdToken());
  setCookie(IMG, profile.picture);
} // setProfile

/**
 * sets the role in cookies
 */
export async function setRole(role) {
  const employeeRole = role;
  if (employeeRole) {
    const encryptedRole = CryptoJS.AES.encrypt(employeeRole, import.meta.env.VITE_AES_KEY);
    setCookie(ROLE, encryptedRole);
    return employeeRole;
  }
} // setRole

export default {
  getAccessToken,
  getIdToken,
  getProfile,
  getRole,
  getTokenExpirationDate,
  isAdmin,
  isAdminOrManager,
  isLoggedIn,
  isTokenExpired,
  login,
  logout,
  requireAuth,
  setAccessToken,
  refreshUserSession,
  setIdToken,
  setProfile,
  setRole
};

import { deleteCookie, getCookie, setCookie, setResponseHeader } from '@tanstack/react-start/server'

function authTokenCookie() {
  return process.env.VENDURE_AUTH_TOKEN_COOKIE || 'vendure-auth-token'
}

export function disableAuthResponseCaching() {
  setResponseHeader('Cache-Control', 'no-store')
}

export function setAuthToken(token: string) {
  setCookie(authTokenCookie(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export function getAuthToken() {
  return getCookie(authTokenCookie())
}

export function requireAuthToken() {
  const token = getAuthToken()
  if (!token) throw new Error('Authentication required')
  return token
}

export function removeAuthToken() {
  deleteCookie(authTokenCookie(), { path: '/' })
}

import { NextResponse } from 'next/server';
import { isValidPassword } from './lib/isValidPassword';

export async function middleware(req) {
  if ((await isAuthenticated(req)) === false) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });
  }
}

async function isAuthenticated(req) {
  const authHeader =
    req.headers.get('authorization') || req.headers.get('Authorization');

  if (authHeader == null) return false;

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');
  console.log(username, password);

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(password, process.env.ADMIN_HASHED_PASSWORD))
  );
}

export const config = {
  matcher: '/admin/:path*',
};

import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/health', '/api/webhooks/email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = crypto.randomUUID();

  // Create response
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Check public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return response;
  }

  // Check session cookie
  const sessionToken = request.cookies.get('sokka_crm_session')?.value;
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|Logo sokka.svg).*)'],
};

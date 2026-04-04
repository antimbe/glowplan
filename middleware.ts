import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userType = user?.user_metadata?.user_type

  // Fallback for older accounts that might not have user_type in their metadata
  if (user && !userType) {
    const { data: establishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (establishment) {
      userType = 'pro'
      
      // Update their metadata for future so we don't have to query the db every time
      await supabase.auth.updateUser({
        data: { user_type: 'pro' }
      })
    } else {
      userType = 'client'
    }
  }

  // Restrict /dashboard access strictly to 'pro' users
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/pro/login'
      return NextResponse.redirect(url)
    }
    
    // Redirect logged-in clients trying to access dashboard
    if (userType !== 'pro') {
      const url = request.nextUrl.clone()
      url.pathname = '/account'
      return NextResponse.redirect(url)
    }

    // Optimize dashboard entry - redirect /dashboard to /dashboard/business for speed
    if (request.nextUrl.pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/business'
      return NextResponse.redirect(url)
    }
  }

  // Restrict /account access strictly to 'client' users
  // Exclude /account/bookings/ so guests can view their booking recap via email link
  if (request.nextUrl.pathname.startsWith('/account') && !request.nextUrl.pathname.startsWith('/account/bookings/')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/client/login'
      return NextResponse.redirect(url)
    }

    // Redirect logged-in professionals trying to access account
    if (userType === 'pro') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

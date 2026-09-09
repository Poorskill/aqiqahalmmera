import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { markAllNotificationsAsRead } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['customer']);
    markAllNotificationsAsRead(user.id);

    const redirectTo = request.headers.get('referer') || '/customer/notifications';
    return NextResponse.redirect(new URL(redirectTo, request.url), 303);
  } catch (err: any) {
    return NextResponse.redirect(new URL('/customer/notifications?error=' + encodeURIComponent(err.message), request.url), 303);
  }
}

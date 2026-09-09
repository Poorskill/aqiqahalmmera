import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getNotificationsByUserId, getUnreadNotificationCount } from '@/lib/services';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(['customer']);
    const notifications = getNotificationsByUserId(user.id);
    const unreadCount = getUnreadNotificationCount(user.id);
    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

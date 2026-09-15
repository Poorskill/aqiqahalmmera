import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPostgresNotifications, getPostgresUnreadNotificationCount } from '@/lib/postgres-rbac';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(['customer']);
    const notifications = await getPostgresNotifications(user.id);
    const unreadCount = await getPostgresUnreadNotificationCount(user.id);
    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

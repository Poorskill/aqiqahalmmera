import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin' || user.role === 'master_admin') redirect('/admin/dashboard');
  if (user.role === 'kandang') redirect('/kandang/dashboard');
  if (user.role === 'dapur') redirect('/dapur/dashboard');
  if (user.role === 'driver') redirect('/driver/dashboard');
  redirect('/customer/dashboard');
}

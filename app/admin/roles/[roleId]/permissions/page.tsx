import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RolePermissionsMatrixPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  redirect(`/admin/access-management/${roleId}`);
}

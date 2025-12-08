import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin.api';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getPermissions().then((data) => {
      setPermissions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Permissions</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {permissions.map((permission: any) => (
          <div key={permission.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">{permission.name}</h3>
            <p className="text-gray-600 text-sm">{permission.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

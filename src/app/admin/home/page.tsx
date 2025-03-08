'use client';

import { useAuth } from '@/app/hooks/useAuth';

export default function Admin() {
  const { user, loading } = useAuth(true); // requireAdmin = true
  

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // The useAuth hook will handle redirection
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-lg font-semibold mb-4">Admin Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">User Management</h3>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">System Settings</h3>
                <p className="text-gray-600">Configure system parameters</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  // const [isAdmin, setIsAdmin] = useState(false);
  // const router = useRouter();

  // useEffect(() => {
  //   const userRole = Cookies.get('userRole');
  //   if (userRole !== 'admin') {
  //     router.push('/');
  //   } else {
  //     setIsAdmin(true);
  //   }
  // }, []);

  // if (!isAdmin) return null; // Prevent flickering

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>
    </div>
  );
}

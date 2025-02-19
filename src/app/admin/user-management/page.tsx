"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, query, orderBy, startAfter, limit, getDocs } from 'firebase/firestore';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
// import { useRouter } from "next/navigation";

const UserManagementPage = () => {
    interface User {
        id: string;
        name: string;
        email: string;
        accountCreatedAt: string;
        // subscriptionPlan: {
        //     type: string;
        //     fullTestRemaining: number;
        //     moduleTestsRemaining: number;
        // };
    }
    
    const [users, setUsers] = useState<User[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(true);

    // const router = useRouter();
    

    // useEffect(() => {
    //         const userRole = document.cookie
    //             .split("; ")
    //             .find((row) => row.startsWith("userRole="))
    //             ?.split("=")[1];
    
    //         if (!userRole) {
    //             router.push("/login"); // Redirect to login if no role found
    //         } else if (userRole !== "admin") {
    //             router.push("/"); // Redirect to home if not an admin
    //         } else {
    //             setLoading(false);
    //         }
    //     }, [router]);
    
    //     if (loading) return <p className="text-center text-xl font-bold">Loading...</p>;

    const fetchUsers = async (nextPage = false) => {
        setLoading(true);
        let q;
        if (nextPage && lastVisible) {
            q = query(
                collection(firestore, 'users'),
                orderBy('name'),
                startAfter(lastVisible),
                limit(10)
            );
        } else {
            q = query(
                collection(firestore, 'users'),
                orderBy('name'),
                limit(10)
            );
        }

        const querySnapshot = await getDocs(q);
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);

        const usersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            accountCreatedAt: doc.data().accountCreatedAt,
            // subscriptionPlan: doc.data().subscriptionPlan.type
        }));
        setUsers(prevUsers => nextPage ? [...prevUsers, ...usersList] : usersList);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>User Management</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Account Created At</th>
                        {/* <th style={{ border: '1px solid #ddd', padding: '8px' }}>Subscription Plan</th> */}
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.accountCreatedAt}</td>
                            {/* <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.subscriptionPlan.type}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button 
                onClick={() => fetchUsers(true)} 
                disabled={loading} 
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {loading ? 'Loading...' : 'Load More'}
            </button>
        </div>
    );
};

export default UserManagementPage;

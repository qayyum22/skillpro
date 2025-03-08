"use client";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";

const TestManagement = () => {


    const { user, loading } = useAuth(true); // requireAdmin = true

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // The useAuth hook will handle redirection
    }


    
    return (
        <div className="flex flex-col items-center font-extrabold justify-center">
            Test Management
            <div>
                <button>
                    <Link href="/admin/test-management/add-test">Add Test</Link>
                </button>
            </div>
        </div>
    );
};

export default TestManagement;

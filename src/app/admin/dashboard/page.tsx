"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";



const Dashboard = () => {

    const { user, loading } = useAuth(true); // requireAdmin = true

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // The useAuth hook will handle redirection
    }

    return (
        <>
            <div className="flex flex-col items-center font-extrabold justify-center">
                Admin Dashboard
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
                <button>
                    <Link href="/admin/test-management">Test Management</Link>
                </button>
                <button>
                    <Link href="/admin/user-management">User Management</Link>
                </button>
                <button>
                    <Link href="/admin/aiem">AI Evaluation Management</Link>
                </button>
                <button>
                    <Link href="/admin/analytics">Analytics and Reporting</Link>
                </button>
                <button>
                    <Link href="/admin/content-library">Content Library</Link>
                </button>
                <button>
                    <Link href="/admin/system-settings">System Settings</Link>
                </button>
                <button>
                    <Link href="/admin/security">Security and Logs</Link>
                </button>
                <button>
                    <Link href="/admin/testing">Testing and QA</Link>
                </button>
                <button>
                    <Link href="/admin/task-automation">Task Automation</Link>
                </button>
            </div>

        </>
    );
};

export default Dashboard;
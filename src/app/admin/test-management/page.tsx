"use client";
import React from "react";


const TestManagement = () => {

    return (
        <div className="flex flex-col items-center font-extrabold justify-center">
            Test Management
            <div>
                <button>
                    <a href="/admin/test-management/add-test">Add Test</a>
                </button>
            </div>
        </div>
    );
};

export default TestManagement;
// "use client";
// import React from "react";


// const TestManagement = () => {

//     return (
//         <div className="flex flex-col items-center font-extrabold justify-center">
//             Test Management
//             <div>
//                 <button>
//                     <a href="/admin/test-management/add-test">Add Test</a>
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default TestManagement;
"use client";
import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

const TestManagement = () => {
    // const router = useRouter();
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const userRole = document.cookie
    //         .split("; ")
    //         .find((row) => row.startsWith("userRole="))
    //         ?.split("=")[1];

    //     if (!userRole) {
    //         router.push("/login"); // Redirect to login if no role found
    //     } else if (userRole !== "admin") {
    //         router.push("/"); // Redirect to home if not an admin
    //     } else {
    //         setLoading(false);
    //     }
    // }, [router]);

    // if (loading) return <p className="text-center text-xl font-bold">Loading...</p>;

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

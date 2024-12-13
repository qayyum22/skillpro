import react from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-700">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" className="mt-6 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Go to Home</Link>
    </div>
  );
};

export default NotFound;

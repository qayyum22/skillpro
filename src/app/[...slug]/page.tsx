import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function CatchAll({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500">Page Not Found</h1>
      <p className="my-4 text-gray-600">
        The Page {slug?.join("/")} does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Go Back Home
      </Link>
    </div>
  );
}



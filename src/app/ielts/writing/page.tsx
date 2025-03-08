"use client";
import React from 'react';
import { Suspense } from "react";
import WritingModule from "@/components/ielts/writing/WritingModule";

const Writing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">IELTS Writing Practice</h1>
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <WritingModule />
        </Suspense>
      </div>
    </div>
  );
};

export default Writing;
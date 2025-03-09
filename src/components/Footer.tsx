"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { Heart, BookOpen, Users, Mail, HelpCircle, LogIn, Brain, Sparkles } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-xl text-white">TestPrepHaven</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your AI-powered educational platform for mastering languages and acing standardized tests.
            </p>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-400">Powered by AI</span>
            </div>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Community
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Conditional section based on auth */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              {user ? 'My Account' : 'Get Started'}
            </h3>
            {user ? (
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-gray-400 hover:text-white text-sm">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="text-gray-400 hover:text-white text-sm">
                    Settings
                  </Link>
                </li>
              </ul>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Join thousands of learners improving their skills with AI-powered education.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} TestPrepHaven. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
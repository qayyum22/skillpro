"use client";

import performanceMonitor from '@/lib/performance';

// Generic API fetcher with performance monitoring
export async function fetchWithPerformance<T>(
  url: string,
  options?: RequestInit,
  apiName: string = url,
  userId?: string,
  path?: string
): Promise<T> {
  return performanceMonitor.measureApiResponse(
    apiName,
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    },
    userId,
    path
  ).then(response => response.json());
}

// Utility function for handling API errors
export function handleApiError(error: any, fallbackMessage: string = 'An error occurred') {
  console.error('API Error:', error);
  
  // Extract the most useful error message
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      fallbackMessage;
  
  return {
    error: true,
    message: errorMessage
  };
}

// API wrapper for common operations
export const api = {
  // GET request with performance monitoring
  get: async <T>(url: string, userId?: string, path?: string): Promise<T> => {
    return fetchWithPerformance<T>(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      `GET ${url}`,
      userId,
      path
    );
  },
  
  // POST request with performance monitoring
  post: async <T>(url: string, data: any, userId?: string, path?: string): Promise<T> => {
    return fetchWithPerformance<T>(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      },
      `POST ${url}`,
      userId,
      path
    );
  },
  
  // PUT request with performance monitoring
  put: async <T>(url: string, data: any, userId?: string, path?: string): Promise<T> => {
    return fetchWithPerformance<T>(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      },
      `PUT ${url}`,
      userId,
      path
    );
  },
  
  // DELETE request with performance monitoring
  delete: async <T>(url: string, userId?: string, path?: string): Promise<T> => {
    return fetchWithPerformance<T>(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      `DELETE ${url}`,
      userId,
      path
    );
  }
}; 
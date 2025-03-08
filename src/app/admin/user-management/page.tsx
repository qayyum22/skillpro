"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  startAfter, 
  limit, 
  getDocs, 
  where,
  QueryDocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { useAuth } from "@/app/hooks/useAuth";
import { Search, ChevronLeft, ChevronRight, RefreshCw, UserPlus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  accountCreatedAt: string;
  role?: string;
  // Uncomment when subscription data is available
  // subscriptionPlan: {
  //   type: string;
  //   fullTestRemaining: number;
  //   moduleTestsRemaining: number;
  // };
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const usersPerPage = 10;

  const { user, loading: authLoading } = useAuth(true); // requireAdmin = true
  
  // Memoize the fetchUsers function with useCallback
  const fetchUsers = useCallback(async (
    direction: 'next' | 'prev' | 'first' = 'first',
    searchFilter = ''
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      let q;
      const usersRef = collection(firestore, 'users');
      
      if (searchFilter) {
        // If search term exists, search by name or email
        q = query(
          usersRef,
          where('name', '>=', searchFilter),
          where('name', '<=', searchFilter + '\uf8ff'),
          limit(usersPerPage)
        );
        // Note: For a more comprehensive search, you might need a different approach
        // like Cloud Functions or a third-party search service
      } else if (direction === 'next' && lastVisible) {
        q = query(
          usersRef,
          orderBy('name'),
          startAfter(lastVisible),
          limit(usersPerPage)
        );
      } else if (direction === 'prev' && firstVisible) {
        // This is a simplification - for proper prev pagination, 
        // you'd need to maintain pageTokens or implement a more complex solution
        q = query(
          usersRef,
          orderBy('name', 'desc'),
          startAfter(firstVisible),
          limit(usersPerPage)
        );
      } else {
        q = query(
          usersRef,
          orderBy('name'),
          limit(usersPerPage)
        );
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (direction === 'first') {
          setUsers([]);
        }
        setLoading(false);
        return;
      }
      
      setHasMore(querySnapshot.docs.length === usersPerPage);
      setFirstVisible(querySnapshot.docs[0]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'No name',
        email: doc.data().email || 'No email',
        accountCreatedAt: doc.data().accountCreatedAt 
          ? new Date(doc.data().accountCreatedAt).toLocaleString()
          : 'Unknown',
        role: doc.data().role || 'user',
        // subscriptionPlan: doc.data().subscriptionPlan?.type || 'None'
      }));
      
      setUsers(usersList);
      
      // Update page number based on direction
      if (direction === 'next') {
        setCurrentPage(prev => prev + 1);
      } else if (direction === 'prev') {
        setCurrentPage(prev => Math.max(prev - 1, 1));
      } else if (direction === 'first') {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [lastVisible, firstVisible]);
  
  // Handle search
  const handleSearch = () => {
    const loadSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersRef = collection(firestore, 'users');
        let q;
        
        if (searchTerm) {
          // If search term exists, search by name or email
          q = query(
            usersRef,
            where('name', '>=', searchTerm),
            where('name', '<=', searchTerm + '\uf8ff'),
            limit(usersPerPage)
          );
        } else {
          q = query(
            usersRef,
            orderBy('name'),
            limit(usersPerPage)
          );
        }

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          setUsers([]);
          setLoading(false);
          return;
        }
        
        setHasMore(querySnapshot.docs.length === usersPerPage);
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'No name',
          email: doc.data().email || 'No email',
          accountCreatedAt: doc.data().accountCreatedAt 
            ? new Date(doc.data().accountCreatedAt).toLocaleString()
            : 'Unknown',
          role: doc.data().role || 'user',
        }));
        
        setUsers(usersList);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSearchResults();
  };
  
  // Initial data load
  useEffect(() => {
    let isMounted = true;
    
    if (!authLoading && user) {
      // Use a non-state variable to prevent infinite loops
      const loadInitialData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const usersRef = collection(firestore, 'users');
          const q = query(
            usersRef,
            orderBy('name'),
            limit(usersPerPage)
          );

          const querySnapshot = await getDocs(q);
          
          if (!isMounted) return;
          
          if (querySnapshot.empty) {
            setHasMore(false);
            setUsers([]);
            setLoading(false);
            return;
          }
          
          setHasMore(querySnapshot.docs.length === usersPerPage);
          setFirstVisible(querySnapshot.docs[0]);
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

          const usersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'No name',
            email: doc.data().email || 'No email',
            accountCreatedAt: doc.data().accountCreatedAt 
              ? new Date(doc.data().accountCreatedAt).toLocaleString()
              : 'Unknown',
            role: doc.data().role || 'user',
          }));
          
          setUsers(usersList);
          setCurrentPage(1);
        } catch (err) {
          if (isMounted) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again later.');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };
      
      loadInitialData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [authLoading, user, usersPerPage]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Loading state during authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated or not admin
  if (!user) {
    return null; // The useAuth hook will handle redirection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">User Management</h1>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full md:w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          
          <button
            onClick={() => {
              setSearchTerm('');
              // Reset search and reload initial data
              const resetAndLoad = async () => {
                try {
                  setLoading(true);
                  setError(null);
                  
                  const usersRef = collection(firestore, 'users');
                  const q = query(
                    usersRef,
                    orderBy('name'),
                    limit(usersPerPage)
                  );

                  const querySnapshot = await getDocs(q);
                  
                  if (querySnapshot.empty) {
                    setHasMore(false);
                    setUsers([]);
                    setLoading(false);
                    return;
                  }
                  
                  setHasMore(querySnapshot.docs.length === usersPerPage);
                  setFirstVisible(querySnapshot.docs[0]);
                  setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

                  const usersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || 'No name',
                    email: doc.data().email || 'No email',
                    accountCreatedAt: doc.data().accountCreatedAt 
                      ? new Date(doc.data().accountCreatedAt).toLocaleString()
                      : 'Unknown',
                    role: doc.data().role || 'user',
                  }));
                  
                  setUsers(usersList);
                  setCurrentPage(1);
                } catch (err) {
                  console.error('Error resetting users:', err);
                  setError('Failed to reset user list. Please try again later.');
                } finally {
                  setLoading(false);
                }
              };
              
              resetAndLoad();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>
          
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found. Try a different search or add a new user.</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.accountCreatedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Handle previous page
                    if (currentPage > 1) {
                      try {
                        setLoading(true);
                        setError(null);
                        
                        const usersRef = collection(firestore, 'users');
                        
                        // This is a simplified prev page implementation
                        // For a proper one, you'd need to maintain page tokens
                        const q = query(
                          usersRef,
                          orderBy('name'),
                          limit(usersPerPage * (currentPage - 1))
                        );
                        
                        getDocs(q).then(querySnapshot => {
                          const docs = querySnapshot.docs;
                          const startIdx = Math.max(0, docs.length - usersPerPage);
                          const relevantDocs = docs.slice(startIdx);
                          
                          if (relevantDocs.length > 0) {
                            setFirstVisible(relevantDocs[0]);
                            setLastVisible(relevantDocs[relevantDocs.length - 1]);
                            
                            const usersList = relevantDocs.map(doc => ({
                              id: doc.id,
                              name: doc.data().name || 'No name',
                              email: doc.data().email || 'No email',
                              accountCreatedAt: doc.data().accountCreatedAt 
                                ? new Date(doc.data().accountCreatedAt).toLocaleString()
                                : 'Unknown',
                              role: doc.data().role || 'user',
                            }));
                            
                            setUsers(usersList);
                            setCurrentPage(currentPage - 1);
                          }
                          
                          setLoading(false);
                        }).catch(err => {
                          console.error('Error navigating to previous page:', err);
                          setError('Failed to load previous page. Please try again.');
                          setLoading(false);
                        });
                      } catch (err) {
                        console.error('Error in prev page:', err);
                        setError('Failed to navigate pages. Please try again later.');
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={currentPage === 1 || loading}
                  className={`px-3 py-1 rounded border ${
                    currentPage === 1 || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    // Handle next page
                    if (hasMore && lastVisible) {
                      try {
                        setLoading(true);
                        setError(null);
                        
                        const usersRef = collection(firestore, 'users');
                        const q = query(
                          usersRef,
                          orderBy('name'),
                          startAfter(lastVisible),
                          limit(usersPerPage)
                        );
                        
                        getDocs(q).then(querySnapshot => {
                          if (!querySnapshot.empty) {
                            setHasMore(querySnapshot.docs.length === usersPerPage);
                            setFirstVisible(querySnapshot.docs[0]);
                            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
                            
                            const usersList = querySnapshot.docs.map(doc => ({
                              id: doc.id,
                              name: doc.data().name || 'No name',
                              email: doc.data().email || 'No email',
                              accountCreatedAt: doc.data().accountCreatedAt 
                                ? new Date(doc.data().accountCreatedAt).toLocaleString()
                                : 'Unknown',
                              role: doc.data().role || 'user',
                            }));
                            
                            setUsers(usersList);
                            setCurrentPage(currentPage + 1);
                          } else {
                            setHasMore(false);
                          }
                          
                          setLoading(false);
                        }).catch(err => {
                          console.error('Error navigating to next page:', err);
                          setError('Failed to load next page. Please try again.');
                          setLoading(false);
                        });
                      } catch (err) {
                        console.error('Error in next page:', err);
                        setError('Failed to navigate pages. Please try again later.');
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={!hasMore || loading}
                  className={`px-3 py-1 rounded border ${
                    !hasMore || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
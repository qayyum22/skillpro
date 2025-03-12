"use client";
import PaginationTable from "@/components/ielts/PaginationTable";
import React, { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { FaCamera, FaTrophy, FaUser, FaHistory, FaCog, FaMedal, FaEdit, FaSave, FaChartLine, FaClipboardCheck, FaRegClock, FaPlusCircle, FaCheckCircle } from "react-icons/fa";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: {
    type: string;
    fullTestRemaining: number;
    moduleTestsRemaining: number;
  };
  accountCreatedAt: string;
  lastLogin: string;
  testHistory: { id: string; type: string; date: string; score: number }[];
  achievements: string[];
  studyGoals: string;
}

// Dummy data for testing
const dummyUserData = {
  id: "12345",
  name: "John Doe",
  email: "johndoe@example.com",
  subscriptionPlan: {
    type: "Premium",
    fullTestRemaining: 5,
    moduleTestsRemaining: 10,
  },
  accountCreatedAt: "2023-01-01",
  lastLogin: "2023-10-01",
  testHistory: [
    { id: "t1", type: "IELTS Full Test", date: "2023-09-01", score: 85, modules: ["Reading", "Writing", "Listening", "Speaking"] },
    { id: "t2", type: "IELTS Reading", date: "2023-08-15", score: 90, modules: ["Reading"] },
    { id: "t3", type: "IELTS Full Test", date: "2023-07-20", score: 75, modules: ["Reading", "Writing", "Listening", "Speaking"] },
  ],
  achievements: ["Completed 10 tests", "Scored above 90% in a test", "Perfect score in Reading section"],
  studyGoals: "Complete 5 tests this month",
};

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(dummyUserData);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(dummyUserData);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'full' | 'module'>('full');
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email;
        if (userEmail) {
          const userDoc = doc(firestore, "users", userEmail);
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            const data = userSnapshot.data() as UserData;
            setUserData(data);
            setFormData(data);
          } else {
            console.log("No such document!");
          }
        } else {
          console.log("User email is null.");
        }
      } else {
        console.log("No user is signed in.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => prevData && { ...prevData, [name]: value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      setUserData(formData);
      setEditing(false);
    }
  };

  const getAverageScore = () => {
    if (!userData?.testHistory.length) return 0;
    const total = userData.testHistory.reduce((sum, test) => sum + test.score, 0);
    return total / userData.testHistory.length;
  };

  const renderProgressBar = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const getTestsTakenCount = (type: 'full' | 'module') => {
    if (!userData?.testHistory?.length) return 0;
    if (type === 'full') {
      return userData.testHistory.filter(test => test.type.includes('Full Test')).length;
    } else {
      return userData.testHistory.filter(test => !test.type.includes('Full Test')).length;
    }
  };

  const handleTakeTest = (type: 'full' | 'module') => {
    // This would be connected to the test-taking functionality
    if (!userData) return;
    
    // Check if user has remaining tests
    if (type === 'full' && userData.subscriptionPlan.fullTestRemaining <= 0) {
      alert("You don't have any full tests remaining. Please purchase more.");
      return;
    }
    
    if (type === 'module' && userData.subscriptionPlan.moduleTestsRemaining <= 0) {
      alert("You don't have any module tests remaining. Please purchase more.");
      return;
    }
    
    // If they have remaining tests, we would redirect them to the test page
    // For now, just decrement the count
    const updatedUserData = {...userData};
    if (type === 'full') {
      updatedUserData.subscriptionPlan.fullTestRemaining -= 1;
    } else {
      updatedUserData.subscriptionPlan.moduleTestsRemaining -= 1;
    }
    
    setUserData(updatedUserData);
    alert(`Taking a ${type} test. Redirecting to test page...`);
  };

  const handlePurchaseTests = () => {
    if (!userData) return;
    
    // In a real app, this would integrate with a payment processor
    // For now, just add the tests to the user's account
    const updatedUserData = {...userData};
    if (purchaseType === 'full') {
      updatedUserData.subscriptionPlan.fullTestRemaining += purchaseQuantity;
    } else {
      updatedUserData.subscriptionPlan.moduleTestsRemaining += purchaseQuantity;
    }
    
    setUserData(updatedUserData);
    setShowPurchaseModal(false);
    alert(`Successfully purchased ${purchaseQuantity} ${purchaseType} tests!`);
  };

  const openPurchaseModal = (type: 'full' | 'module') => {
    setPurchaseType(type);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                  <FaCamera className="text-gray-700 text-sm" />
                </button>
              </div>
              <div className="text-white">
                <h1 className="text-2xl sm:text-3xl font-bold">{userData.name}</h1>
                <p className="opacity-90">{userData.email}</p>
                <div className="mt-2 flex items-center space-x-3">
                  <span className="bg-indigo-700 text-xs text-white px-2 py-1 rounded-full">{userData.subscriptionPlan.type}</span>
                  <span className="text-xs opacity-75">Member since {userData.accountCreatedAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex">
              <button 
                onClick={() => setSelectedTab(0)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                  selectedTab === 0 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="mr-2" /> Profile Info
              </button>
              <button
                onClick={() => setSelectedTab(1)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                  selectedTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaHistory className="mr-2" /> Test History
              </button>
              <button
                onClick={() => setSelectedTab(2)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                  selectedTab === 2
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaClipboardCheck className="mr-2" /> My Tests
              </button>
              <button
                onClick={() => setSelectedTab(3)}
                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm ${
                  selectedTab === 3
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaMedal className="mr-2" /> Achievements
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 0 && (
              <div>
                {!editing ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">ID: <span className="text-gray-900">{userData.id}</span></p>
                          <p className="text-sm text-gray-600">Name: <span className="text-gray-900">{userData.name}</span></p>
                          <p className="text-sm text-gray-600">Email: <span className="text-gray-900">{userData.email}</span></p>
                          <p className="text-sm text-gray-600">Last Login: <span className="text-gray-900">{userData.lastLogin}</span></p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Subscription Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Plan: <span className="text-gray-900">{userData.subscriptionPlan.type}</span></p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Full Tests Remaining:</span>
                              <span className="text-gray-900">{userData.subscriptionPlan.fullTestRemaining}</span>
                            </div>
                            {renderProgressBar(userData.subscriptionPlan.fullTestRemaining, 10)}
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Module Tests Remaining:</span>
                              <span className="text-gray-900">{userData.subscriptionPlan.moduleTestsRemaining}</span>
                            </div>
                            {renderProgressBar(userData.subscriptionPlan.moduleTestsRemaining, 15)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-800">Study Goals</h3>
                          <button className="text-blue-600 text-sm hover:text-blue-800">Update Goals</button>
                        </div>
                        <p className="text-gray-700">{userData.studyGoals}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button 
                        onClick={handleEditClick} 
                        className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit className="mr-2" /> Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                          id="name"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                          id="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleInputChange}
                  disabled
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                        <label htmlFor="subscriptionType" className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <input
                  type="text"
                          id="subscriptionType"
                  name="subscriptionPlan.type"
                  value={formData?.subscriptionPlan.type}
                  onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                        <label htmlFor="fullTestRemaining" className="block text-sm font-medium text-gray-700 mb-1">Full Tests Remaining</label>
                <input
                  type="number"
                          id="fullTestRemaining"
                  name="subscriptionPlan.fullTestRemaining"
                  value={formData?.subscriptionPlan.fullTestRemaining}
                  onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                        <label htmlFor="moduleTestsRemaining" className="block text-sm font-medium text-gray-700 mb-1">Module Tests Remaining</label>
                <input
                  type="number"
                          id="moduleTestsRemaining"
                  name="subscriptionPlan.moduleTestsRemaining"
                  value={formData?.subscriptionPlan.moduleTestsRemaining}
                  onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                        <label htmlFor="studyGoals" className="block text-sm font-medium text-gray-700 mb-1">Study Goals</label>
                <input
                  type="text"
                          id="studyGoals"
                          name="studyGoals"
                          value={formData?.studyGoals}
                  onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaSave className="mr-2" /> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {selectedTab === 1 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Test History</h2>
                  <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                    <FaChartLine className="text-blue-500 mr-2" />
                    <span className="text-sm">Average: <strong>{getAverageScore().toFixed(1)}</strong></span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.testHistory.map((test, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{test.score}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full max-w-xs">
                              {renderProgressBar(test.score)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-1">
                    <h3 className="text-md font-medium text-gray-800 mb-2">Full Tests Taken</h3>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-indigo-600 mr-3">{getTestsTakenCount('full')}</div>
                      <div className="text-sm text-gray-500">Tests completed</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-1">
                    <h3 className="text-md font-medium text-gray-800 mb-2">Module Tests Taken</h3>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-indigo-600 mr-3">{getTestsTakenCount('module')}</div>
                      <div className="text-sm text-gray-500">Tests completed</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex-1">
                    <h3 className="text-md font-medium text-gray-800 mb-2">Average Score</h3>
                    <div className="flex items-center">
                      <div className="text-3xl font-bold text-indigo-600 mr-3">{getAverageScore().toFixed(1)}</div>
                      <div className="text-sm text-gray-500">Out of 100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">My Tests</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800">Full Tests</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {userData.subscriptionPlan.fullTestRemaining} Remaining
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Tests Remaining:</span>
                          <span className="text-gray-900 font-medium">{userData.subscriptionPlan.fullTestRemaining}</span>
                        </div>
                        {renderProgressBar(userData.subscriptionPlan.fullTestRemaining, 10)}
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tests Taken:</span>
                          <span className="text-gray-900 font-medium">{getTestsTakenCount('full')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                        <button
                          onClick={() => handleTakeTest('full')}
                          className={`flex items-center justify-center px-4 py-2 ${
                            userData.subscriptionPlan.fullTestRemaining > 0
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          } rounded-md transition-colors flex-1`}
                          disabled={userData.subscriptionPlan.fullTestRemaining <= 0}
                        >
                          <FaClipboardCheck className="mr-2" /> Take Full Test
                        </button>
                        <button
                          onClick={() => openPurchaseModal('full')}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex-1"
                        >
                          <FaPlusCircle className="mr-2" /> Get More Tests
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-purple-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800">Module Tests</h3>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {userData.subscriptionPlan.moduleTestsRemaining} Remaining
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Tests Remaining:</span>
                          <span className="text-gray-900 font-medium">{userData.subscriptionPlan.moduleTestsRemaining}</span>
                        </div>
                        {renderProgressBar(userData.subscriptionPlan.moduleTestsRemaining, 15)}
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tests Taken:</span>
                          <span className="text-gray-900 font-medium">{getTestsTakenCount('module')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                        <button
                          onClick={() => handleTakeTest('module')}
                          className={`flex items-center justify-center px-4 py-2 ${
                            userData.subscriptionPlan.moduleTestsRemaining > 0
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                          } rounded-md transition-colors flex-1`}
                          disabled={userData.subscriptionPlan.moduleTestsRemaining <= 0}
                        >
                          <FaRegClock className="mr-2" /> Take Module Test
                        </button>
                        <button
                          onClick={() => openPurchaseModal('module')}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex-1"
                        >
                          <FaPlusCircle className="mr-2" /> Get More Tests
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Upcoming Tests</h3>
                    <p className="text-gray-500 italic">You don't have any scheduled tests.</p>
                    <button className="mt-3 text-blue-600 text-sm hover:text-blue-800">Schedule a Test</button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Achievements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-start">
                      <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full mr-3">
                        <FaTrophy className="text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{achievement}</p>
                        <p className="text-xs text-gray-500 mt-1">Achieved on {userData.testHistory[0]?.date || "Unknown date"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Tests Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Purchase {purchaseType === 'full' ? 'Full' : 'Module'} Tests
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select the number of tests you would like to purchase.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                      <select
                        id="quantity"
                        name="quantity"
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(parseInt(e.target.value))}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {[1, 5, 10, 20].map((qty) => (
                          <option key={qty} value={qty}>{qty} Tests</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mt-4">
                      <p className="font-medium">
                        Total: ${purchaseQuantity * (purchaseType === 'full' ? 15 : 5)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handlePurchaseTests}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Purchase
                </button>
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

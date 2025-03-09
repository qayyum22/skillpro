"use client";
import PaginationTable from "@/components/ielts/PaginationTable";
import React, { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { FaCamera, FaTrophy, FaUser, FaHistory, FaCog, FaMedal, FaEdit, FaSave, FaChartLine } from "react-icons/fa";

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
  testHistory: { date: string; score: number }[];
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
    { date: "2023-09-01", score: 85 },
    { date: "2023-08-15", score: 90 },
    { date: "2023-07-20", score: 75 },
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
                <FaCog className="mr-2" /> Settings
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.testHistory.map((test, index) => (
                        <tr key={index}>
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
              </div>
            )}

            {selectedTab === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Password Settings</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Change Password</button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Notification Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="emailNotif" className="mr-2" defaultChecked />
                        <label htmlFor="emailNotif" className="text-sm text-gray-700">Email Notifications</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="testReminders" className="mr-2" defaultChecked />
                        <label htmlFor="testReminders" className="text-sm text-gray-700">Test Reminders</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="marketingEmails" className="mr-2" />
                        <label htmlFor="marketingEmails" className="text-sm text-gray-700">Marketing Emails</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Danger Zone</h3>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete Account</button>
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
    </div>
  );
};

export default Profile;

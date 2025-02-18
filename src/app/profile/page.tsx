"use client";
import PaginationTable from "@/components/ielts/PaginationTable";
import React, { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);

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
      const userDoc = doc(firestore, "users", formData.email);
      await setDoc(userDoc, formData);
      setUserData(formData);
      setEditing(false);
    }
  };

  return (
    <div className="profile-container p-6 bg-white shadow-md rounded-lg max-w-2xl mx-auto mt-10">
      <h1 className="profile-title text-3xl font-bold mb-6 text-center">Profile</h1>
      {loading ? (
        <p className="loading-text text-center text-gray-500">Loading...</p>
      ) : userData ? (
        <div className="user-data space-y-4">
          {editing ? (
            <form onSubmit={handleFormSubmit}>
              <div>
                <label>ID:</label>
                <input
                  type="text"
                  name="id"
                  value={formData?.id}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="text"
                  name="email"
                  value={formData?.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <label>Subscription Plan:</label>
                <input
                  type="text"
                  name="subscriptionPlan.type"
                  value={formData?.subscriptionPlan.type}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Full Tests Remaining:</label>
                <input
                  type="number"
                  name="subscriptionPlan.fullTestRemaining"
                  value={formData?.subscriptionPlan.fullTestRemaining}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Module Tests Remaining:</label>
                <input
                  type="number"
                  name="subscriptionPlan.moduleTestsRemaining"
                  value={formData?.subscriptionPlan.moduleTestsRemaining}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Account Created At:</label>
                <input
                  type="text"
                  name="accountCreatedAt"
                  value={formData?.accountCreatedAt}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <label>Last Login:</label>
                <input
                  type="text"
                  name="lastLogin"
                  value={formData?.lastLogin}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <button type="submit">Save</button>
            </form>
          ) : (
            <>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Subscription Plan:</strong> {userData.subscriptionPlan.type}</p>
              <p><strong>Full Tests Remaining:</strong> {userData.subscriptionPlan.fullTestRemaining}</p>
              <p><strong>Module Tests Remaining:</strong> {userData.subscriptionPlan.moduleTestsRemaining}</p>
              <p><strong>Account Created At:</strong> {userData.accountCreatedAt}</p>
              <p><strong>Last Login:</strong> {userData.lastLogin}</p>
              <button onClick={handleEditClick}>Edit Profile</button>
            </>
          )}
        </div>
      ) : (
        <p className="no-data-text text-center text-red-500">No user data found.</p>
      )}
      <div className="mt-8">
        <PaginationTable />
      </div>
    </div>
  );
};

export default Profile;

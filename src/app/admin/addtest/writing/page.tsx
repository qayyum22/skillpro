"use client";
import React from "react";

const AddTest = () => {
  const handleClick = async () => {
    const response = await fetch("/api/add-test", {
      method: "POST",
    });

    if (!response.ok) {
      alert("Error adding test");
    } else {
      await response.json();
      alert("Test Added successfully");
    }
  };

  const show = async () => {
    const response = await fetch("/api/fetch-test", {
      method: "GET",
    });

    if (!response.ok) {
      alert("Error adding test");
    } else {
      const data = await response.json();
        
      if (data) {
        console.log(data);
      }

    }
  };

  return (
    <div>
      <button onClick={handleClick}>Add Test</button>
      <button onClick={show}>Get Test</button>
    </div>
  );
};

export default AddTest;

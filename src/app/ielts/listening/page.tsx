"use client"
import React, { useState } from "react"
import ListeningModule from "@/components/ielts/listening/ListeningModule";
import ModuleInstructions from "@/components/ielts/ModuleInstructions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const Listening = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handleStartTest = () => {
    setShowInstructions(false);
  };
  
  if (showInstructions) {
    return (
      <div>
        <div className="mb-4 p-4 border-b flex justify-between">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              className="flex items-center space-x-1"
            >
              <ChevronLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <ModuleInstructions 
          moduleType="listening"
          onStartTest={handleStartTest} 
        />
      </div>
    );
  }
  
  return <ListeningModule />;
};

export default Listening
import React, { useState, ReactNode } from 'react';

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return <div className={`flex space-x-4 ${className}`}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs component');

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={`px-4 py-2 rounded ${activeTab === value ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within a Tabs component');

  const { activeTab } = context;

  return activeTab === value ? <div className={className}>{children}</div> : null;
};

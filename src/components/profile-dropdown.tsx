import React, { useState, useRef, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User, Key, CreditCard, LogOut, ChevronDown, Monitor } from 'lucide-react';
import Link from 'next/link';

interface ProfileDropdownProps {
  user: FirebaseUser | null;
  onLogout: () => Promise<void>;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: Monitor, label: 'Dashboard', action: () => null, isLink: true, to: '/dashboard' },
    { icon: User, label: 'My Profile', action: () => null, isLink: true, to:'/profile' },
    { icon: Key, label: 'API Keys', action: () => console.log('API Keys clicked') },
    { 
      icon: CreditCard, 
      label: 'Subscription', 
      action: () => null,
      isLink: true,
      to: '/pricing'
    },
    { icon: LogOut, label: 'Sign Out', action: onLogout },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user?.email?.[0].toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-sm text-gray-700 hidden sm:block">{user?.email}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {item.isLink ? (
                <Link
                  href={item.to!}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              )}
              {index < menuItems.length - 1 && (
                <div className="my-1 border-t border-gray-100" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
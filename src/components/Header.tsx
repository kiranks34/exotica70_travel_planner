import React, { useState, useEffect } from 'react';
import { Compass, Menu, User, ChevronDown, MapPin, Plane, Mountain, Camera, Car, Heart, Sparkles, FileText, Globe, LogOut } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  user?: User | null;
  onLogout?: () => void;
  onHomeClick?: () => void;
  favoriteCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onLoginClick, 
  onSignupClick, 
  user, 
  onLogout, 
  onHomeClick,
  favoriteCount = 0
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-wrapper')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getUserInitials = (user: User): string => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };
  return (
    <header className="bg-white bg-opacity-95 backdrop-blur-lg shadow-2xl border border-white border-opacity-80 sticky top-0 z-50">
      <div className="w-full px-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 pl-2">
            <button 
              onClick={onHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Compass className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 font-heading tracking-wide">Exotic70</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {/* Home - No Dropdown */}
            <div className="relative dropdown-wrapper">
              <button 
                onClick={onHomeClick}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap">
                <span>Home</span>
              </button>
            </div>

            {/* Trip Planner Dropdown */}
            <div className="relative dropdown-wrapper">
              <button 
                onClick={() => toggleDropdown('trip-planner')}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap">
                <span>Crew Trips</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'trip-planner' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="space-y-1">
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Plan with friends</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Share link</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Vote</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discover Vibes Dropdown */}
            <div className="relative dropdown-wrapper">
              <button 
                onClick={() => toggleDropdown('discover-vibes')}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap">
                <span>Discover Vibes</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'discover-vibes' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="space-y-1">
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Chill</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Party</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Adventure</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Culture</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Spontaneous</a>
                          <hr className="my-2 border-gray-200" />
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Relaxation</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Family</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Romantic</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Business</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Food & Culinary</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Nature & Wildlife</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Steals Dropdown */}
            <div className="relative dropdown-wrapper">
              <button 
                onClick={() => toggleDropdown('steals')}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap">
                <span>Steals</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {activeDropdown === 'steals' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="space-y-1">
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Deals</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Last-minute</a>
                          <a href="#" onClick={closeDropdown} className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">Budget hacks</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trending - No Dropdown */}
            <div className="relative dropdown-wrapper">
              <button 
                onClick={closeDropdown}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap">
                <span>Trending</span>
              </button>
            </div>

          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 pr-2">
            {/* Favorites Button */}
            <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50">
              <Heart className="h-5 w-5" />
              <span className="font-medium">Favorites</span>
              {favoriteCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {favoriteCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials(user)}
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">
                    {user.firstName}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="h-5 w-5" />
                  <span>Log in</span>
                </button>
                
                <button 
                  onClick={onSignupClick}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg transform hover:scale-105">
                  Sign up
                </button>
              </>
            )}

            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:text-orange-500 ml-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
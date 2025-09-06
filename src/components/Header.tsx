import React from 'react';
import { Heart, LogOut, Home, User, UserPlus, LogIn } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  user: User | null;
  onLogout: () => void;
  onHomeClick: () => void;
  onFavoritesClick: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onSignupClick,
  user,
  onLogout,
  onHomeClick,
  onFavoritesClick,
  favoritesCount
}) => {
  return (
    <header className="bg-white bg-opacity-90 backdrop-blur-lg shadow-lg border-b border-white border-opacity-20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ExoticTrips</span>
          </button>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Favorites Button */}
            <button
              onClick={onFavoritesClick}
              className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-gray-700 font-medium hidden sm:inline">
                    {user.firstName}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={onSignupClick}
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
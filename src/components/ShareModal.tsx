import React, { useState } from 'react';
import { Trip } from '../types';
import { X, Copy, Mail, Link2, Users, Check } from 'lucide-react';

interface ShareModalProps {
  trip: Trip;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ trip, onClose }) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');

  const shareUrl = `${window.location.origin}/trip/${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate sending invite
    console.log('Inviting:', email, 'as', shareRole);
    setEmail('');
    alert(`Invitation sent to ${email} as ${shareRole}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Share Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trip Info */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{trip.destination}</h3>
            <p className="text-sm text-gray-600">
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Email Invite */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invite by Email
            </label>
            <form onSubmit={handleEmailShare} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Level
                </label>
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                >
                  <option value="viewer">Viewer (can only view)</option>
                  <option value="editor">Editor (can edit itinerary)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!email}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
            </form>
          </div>

          {/* Current Collaborators */}
          {trip.collaborators.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Current Collaborators
              </label>
              <div className="space-y-2">
                {trip.collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-8 w-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="flex-1 text-gray-900">{collaborator}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Editor
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
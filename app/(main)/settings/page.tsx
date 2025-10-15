'use client';
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/Icons';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile update state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_URL}${avatarPath}`;
  };

  if (!user) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validacija fajla
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await usersApi.uploadAvatar(user.id, file);
      setSuccess('Avatar uploaded successfully!');
      // Refresh user data
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await usersApi.updateProfile(user.id, {
        firstName,
        lastName,
        username,
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await usersApi.changePassword(user.id, oldPassword, newPassword);
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await usersApi.deleteAccount(user.id);
      logout();
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="card bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3">
            <Icons.AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="card bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <Icons.Check className="w-5 h-5 text-green-500" />
            <p className="text-green-500">{success}</p>
          </div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.User className="w-7 h-7 text-primary-500" />
          Profile Picture
        </h2>
        
        <div className="flex items-center gap-6">
          <img
            src={user.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.png'}
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
          />
          
          <div className="flex-1">
            <p className="text-gray-400 mb-4">
              Upload a new profile picture. Max size: 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Icons.Upload className="w-5 h-5" />
              {isLoading ? 'Uploading...' : 'Upload New Picture'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.Edit className="w-7 h-7 text-primary-500" />
          Profile Information
        </h2>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="John"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="johndoe"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              className="input-field bg-dark-400 cursor-not-allowed"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.Lock className="w-7 h-7 text-primary-500" />
          Change Password
        </h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-field"
              placeholder="Enter current password"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-500/30 bg-red-500/5">
        <h2 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-3">
          <Icons.AlertCircle className="w-7 h-7" />
          Danger Zone
        </h2>
        
        {!showDeleteConfirm ? (
          <div>
            <p className="text-gray-400 mb-4">
              Once you delete your account, there is no going back. This action will permanently delete your account, including all your workouts, templates, and personal data.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white font-semibold">
              Are you absolutely sure? This action cannot be undone.
            </p>
            <p className="text-gray-400">
              Please type <span className="text-red-500 font-bold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input-field border-red-500/50"
              placeholder="Type DELETE to confirm"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || deleteConfirmText !== 'DELETE'}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
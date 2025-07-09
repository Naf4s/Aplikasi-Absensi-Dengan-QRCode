import React from 'react';

const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="your.email@example.com"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="emailNotifications" className="mr-2" />
              <label htmlFor="emailNotifications">Email Notifications</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="darkMode" className="mr-2" />
              <label htmlFor="darkMode">Dark Mode</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
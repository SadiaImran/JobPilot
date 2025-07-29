import React, { useState, useEffect } from 'react';
import { Award, CreditCard } from 'lucide-react';
import { supabase } from '../supabase.js';

// Profile Component
const ProfilePage = ({ setCurrentPage, userId }) => {
  console.log('ProfilePage rendered with userId:', userId);

  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    phone_number: '',
    email_notifications: true,
    smart_reminders: true,
  });
  const [plan, setPlan] = useState('Free Plan');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user info from both tables
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        console.log('Auth fetch:', { authData, authError });

        const user = authData?.user;
        if (!user) {
          setMessage('No user found.');
          setLoading(false);
          return;
        }
        const userId = user.id;

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('phone_number, email_notifications, smart_reminders, plan')
          .eq('id', userId)
          .single();
        console.log('Profile fetch:', { profile, profileError });

        if (profileError) {
          console.error('Supabase profile error:', profileError);
          setMessage('Error fetching profile info.');
          setLoading(false);
          return;
        }

        setFormData({
          display_name: user.user_metadata?.full_name || user.user_metadata?.display_name || '',
          email: user.email || '',
          phone_number: profile.phone_number || '',
          email_notifications: profile.email_notifications ?? true,
          smart_reminders: profile.smart_reminders ?? true,
        });
        setPlan(profile.plan || 'Free Plan');
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error in fetchProfile:', err);
        setMessage('Unexpected error.');
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save changes to both tables
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) {
      setMessage('No user found.');
      setSaving(false);
      return;
    }
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        phone_number: formData.phone_number,
        email_notifications: formData.email_notifications,
        smart_reminders: formData.smart_reminders,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (profileError) setMessage('Error saving changes.');
    else setMessage('Profile updated!');
    setSaving(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and subscription</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {message && <div className="text-green-600 mt-2">{message}</div>}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your applications</p>
                  </div>
                  <input
                    type="checkbox"
                    name="email_notifications"
                    checked={formData.email_notifications}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminded about follow-ups</p>
                  </div>
                  <input
                    type="checkbox"
                    name="smart_reminders"
                    checked={formData.smart_reminders}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Plan Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Plan</h2>
              <div className="text-center mb-6">
                <div className="bg-blue-100 p-4 rounded-lg mb-4">
                  <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-900">{plan}</div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• 5 Resume Analyses</div>
                  <div>• Basic Dashboard</div>
                  <div>• Email Support</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('pricing')}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
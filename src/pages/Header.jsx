import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, TrendingUp, Upload, Brain, User, Menu, X
} from 'lucide-react';
import { supabase } from '../supabase';

const Header = ({ isLoggedIn, setIsLoggedIn   }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const navItems = [];

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    navigate('/');
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setShowLogin(false);
      setIsLoggedIn(true);
      navigate('/dashboard');
    }
  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email.includes('@') || password.length < 6 || name.trim() === '') {
      alert('Please fill all fields correctly.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email : email,
      password : password,
      options: {
        data: {
          full_name: name,
        }
      }
});

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert('✅ Sign up successful!\n\nPlease check your email to verify your account before logging in.');
      setShowSignup(false);
      setShowLogin(true);
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-2 border-gray-300 sticky  top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">JobPilot</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.name}
              </button>
            ))}
          </nav>
          {/* Auth Buttons */}
          <div className="md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl flex w-[80vw] min-w-0 max-w-4xl overflow-hidden px-0">
            {/* Left Panel */}
            <div className="hidden md:flex flex-col justify-center items-center relative w-1/2 min-h-[480px] bg-gray-700">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
                alt="Login Visual"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                <div className="text-white text-3xl font-bold mb-4 drop-shadow-lg text-center">
                  Welcome Back!
                </div>
                <div className="text-blue-100 text-lg font-medium text-center mb-2">
                  Track your job search with <span className="font-bold text-white">JobPilot</span>
                </div>
              </div>
            </div>
            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center relative px-10 py-14">
              <button
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
                onClick={() => setShowLogin(false)}
              >
                <X className="h-7 w-7" />
              </button>
              <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-700 tracking-tight">Login</h2>
              <form className="space-y-6" onSubmit={handleLogin}>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none text-lg"
                />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Logging In...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              <div className="text-center mt-8 text-base">
                Don't have an account?{' '}
                <button className="text-blue-600 hover:underline font-semibold" onClick={() => { setShowLogin(false); setShowSignup(true); }}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl flex w-[80vw] min-w-0 max-w-4xl overflow-hidden">
            {/* Left Panel */}
            <div className="hidden md:flex flex-col justify-center items-center relative w-1/2 min-h-[480px] bg-gray-700">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80"
                alt="Sign Up Visual"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
                <div className="text-white text-3xl font-bold mb-4 drop-shadow-lg text-center">
                  New Here?
                </div>
                <div className="text-blue-100 text-lg font-medium text-center mb-2">
                  Join <span className="font-bold text-white">JobPilot</span> & land your dream job!
                </div>
              </div>
            </div>
            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex flex-col justify-center relative px-10 py-10">
              <button
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
                onClick={() => setShowSignup(false)}
              >
                <X className="h-7 w-7" />
              </button>
              <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-700 tracking-tight">Sign Up</h2>
              <form className="space-y-6" onSubmit={handleSignup}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  type="text"
                  placeholder="Name"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none text-lg"
                />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none text-lg"
                />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-colors shadow-md flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Signing Up...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
              <div className="text-center mt-8 text-base">
                Already have an account?{' '}
                <button className="text-blue-600 hover:underline font-semibold" onClick={() => { setShowSignup(false); setShowLogin(true); }}>
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
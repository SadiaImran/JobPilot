import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './supabase';
import AppRoutes from './AppRoutes';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); 

  // Check Supabase session on mount/refresh
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setAuthChecked(true); 
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!authChecked) {
    // Show loader until auth is checked
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <span className="text-blue-600 font-bold text-xl">Loading...</span>
      </div>
    );
  }
  

  return (
    <Router>
      <AppRoutes isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
};

export default App;
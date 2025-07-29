import React from 'react';
import Header from '../pages/Header';
import Sidebar from '../pages/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const privatePaths = ['/dashboard', '/upload', '/feedback', '/profile' , '/application-assitant'];

const BaseLayout = ({ isLoggedIn, setIsLoggedIn }) => {
  const location = useLocation();
  const showSidebar = isLoggedIn && privatePaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gray-50 w-screen flex flex-col">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'ml-56' : ''} `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
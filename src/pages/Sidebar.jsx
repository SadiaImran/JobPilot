import React from 'react';
import { TrendingUp, Upload, Brain, User, Kanban } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase'; 
import { FaRegUserCircle } from "react-icons/fa";

var { data: { user } } = await supabase.auth.getUser();
console.log(user.email);
console.log(user.user_metadata.full_name); 
user = {
  email : user.email,
  name : user.user_metadata.full_name,
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: TrendingUp },
  { name: 'AI Assistant', path: '/application-assitant', icon: Brain },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="bg-white  h-[calc(100vh-4rem)] fixed top-16 left-0 py-8 px-4 flex flex-col shadow-xl z-30">
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`cursor-pointer flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors
              ${location.pathname === item.path
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-blue-100'}
            `}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
      {/* User Info at the bottom */}
      <div className="mt-auto flex items-center gap-3 p-3 rounded-lg bg-blue-50">
        <FaRegUserCircle 
          className="w-10 h-10 rounded-full text-blue-500"
        />
        <div>
          <div className="font-semibold text-blue-700 text-sm">{user.name}</div>
          <div className="text-xs text-blue-400">{user.email}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
import { Link } from 'react-router-dom';
import React, { use, useState } from 'react';
import { useEffect } from 'react';
import { 
  Briefcase,    
    Calendar,
    CheckCircle,
    XCircle,
    TrendingUp,
    Upload , 
    PlusCircle
} from 'lucide-react';
import { supabase } from '../supabase';
import AddApplicationModal from '../components/AddApplicationModal';

// Dashboard Component
const Dashboard = ({ setCurrentPage }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [jobs, setJobs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Function to get status color and icon
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Filtered and Sorted Jobs
  const filteredJobs = jobs
  .filter(job => filter === 'all' || job.status?.toLowerCase() === filter.toLowerCase())
  .sort((a, b) => {
    if (sortBy === 'date') {
      // Newest first
      return new Date(b.applied_date) - new Date(a.applied_date);
    }
    if (sortBy === 'score') {
      // Highest score first
      return (b.match_score || 0) - (a.match_score || 0);
    }
    if (sortBy === 'company') {
      // Alphabetical by company name
      return (a.company_name || '').localeCompare(b.company_name || '');
    }
    return 0;
  });

  const handleAddApplication = async (applicationData) => {
    try {
  
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;

      if (!user) {
        alert("User not logged in!");
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([
          {
            user_id: user.id,
            job_title: applicationData.job_title,
            company_name: applicationData.company_name,
            applied_date: applicationData.applied_date,
            status: applicationData.status,
            notes: applicationData.notes,
            resume_id: applicationData.resume_id
          }
        ])
        .select();

      if (error) {
        console.error("Error adding application:", error);
        alert("Error adding application: " + error.message);
      } else {
        console.log("Application added successfully:", data);

        setJobs(prev => [...prev, ...data]);
        alert("Application added successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

 
  useEffect(() => {
  const fetchJobs = async () => {
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;
    if (!user) {
      // User not logged in, don't fetch
      return;
    }

    console.log("Current User ID:", user.id);
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('user_id', user.id)
  .order('applied_date', { ascending: false });

console.log("User ID:", user.id);
console.log("Fetched jobs:", data);

console.log("Fetched jobs from Supabase: ", data); // 👈 Add this

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      setJobs(data);
    }

    console.log(data)
  };

  fetchJobs();
}, []);

  return (
    <div className="h-full bg-gray-50 p-12">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your job applications and monitor your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.status?.toLowerCase() == 'interview').length}</div>
                <div className="text-sm text-gray-600">Interviews</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.status?.toLowerCase() == 'accepted').length}</div>
                <div className="text-sm text-gray-600">Offers</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => sum + (job.match_score || 0), 0) / jobs.length) : 0}</div>
                <div className="text-sm text-gray-600">Avg. Match Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-4">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="company">Sort by Company</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                    onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-4  rounded-xl hover:bg-white hover:border-2 font-bold hover:text-blue-700 hover:border-blue-700 transition-colors flex items-center"
              >
                <PlusCircle className="h-6 w-6 mr-2" />
                 Add Application
              </button>
            
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="font-medium text-gray-900">{job.job_title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.applied_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{job.match_score}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${job.match_score}%` }}
                          >
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {job.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddApplicationModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddApplication}
      />
    </div>
  );
};

export default Dashboard;
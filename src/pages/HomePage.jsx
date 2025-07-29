import React, { useState } from 'react';
import {  TrendingUp,
  Brain,
  FileText,
    Calendar,
  ChevronRight,
    Star } from 'lucide-react';

    // Home Page Component
const HomePage = ({ setCurrentPage, setIsLoggedIn  }) => {
  const [activeTab, setActiveTab] = useState('tracker');

  const features = [
    {
      key: 'tracker',
      title: 'Smart Tracker',
      description: 'Keep track of all your job applications in one organized dashboard.',
      icon: TrendingUp
    },
    {
      key: 'feedback',
      title: 'AI Resume Feedback',
      description: 'Get instant AI-powered feedback to improve your resume match score.',
      icon: Brain
    },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer', text: 'JobPilot helped me organize my job search and land my dream job at Google!', avatar: '👩‍💻' },
    { name: 'Mike Johnson', role: 'Product Manager', text: 'The AI feedback feature improved my resume score by 40%. Highly recommended!', avatar: '👨‍💼' },
    { name: 'Alex Rivera', role: 'Data Scientist', text: 'Finally, a tool that makes job hunting less stressful and more strategic.', avatar: '👨‍🔬' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 py-16 px-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center md:text-left">
              Track your job applications.
              <span className="text-blue-200"> Get AI feedback.</span>
              <span className="text-yellow-400"> Land faster.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 text-center md:text-left">
              Your job hunt, powered by AI. No more spreadsheets. Get hired smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                 onClick={() => {
                  setIsLoggedIn(true);
                }}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer"
              >
                Start Tracking Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
          
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 w-full max-w-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <span>Frontend Developer at TechCorp</span>
                  </div>
                  <span className="text-green-400 font-semibold">92%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <span>React Developer at StartupXYZ</span>
                  </div>
                  <span className="text-yellow-400 font-semibold">85%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                    <span>Full Stack Engineer at BigTech</span>
                  </div>
                  <span className="text-blue-400 font-semibold">78%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to land your dream job
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track. Improve. Succeed. Our AI-powered platform helps you stay organized and optimize your job search strategy.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {features.map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => setActiveTab(feature.key)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === feature.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <feature.icon className="h-5 w-5 mr-2" />
                  {feature.title}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              {features.map((feature) => (
                activeTab === feature.key && (
                  <div key={feature.key} className="text-center">
                    <feature.icon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-lg text-gray-600 mb-8">{feature.description}</p>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-500 mb-2">Preview</div>
                      {feature.key === 'tracker' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Frontend Developer</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Interview</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">React Developer</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Applied</span>
                          </div>
                        </div>
                      )}
                      {feature.key === 'feedback' && (
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-32">
                            <div className="absolute inset-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">92%</div>
                                <div className="text-sm text-blue-600">Match Score</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by job seekers worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who've successfully landed their dream jobs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to supercharge your job search?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful job seekers who trust JobPilot
          </p>
          <button 
            onClick={() => {
              setIsLoggedIn(true);
              setCurrentPage('dashboard');
            }}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
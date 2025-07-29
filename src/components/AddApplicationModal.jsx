import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Building, 
  Calendar, 
  FileText, 
  Upload,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';

import {supabase} from '../supabase.js'

const AddApplicationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    appliedDate: '',
    status: 'applied',
    selectedResume: '',
    uploadedResume: null,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [existingResumes, setExistingResumes] = useState([]);
  
  const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'interview', label: 'Interview' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    const fetchResumes = async () => {
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data.user;

      if (!user) {
        alert("User not logged in!");
        return;
      }

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error("Error fetching resumes:", error.message);
      } else {
        setExistingResumes(data);
      }
    };

    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleResumeSelect = (resumeId) => {
    setFormData(prev => ({
      ...prev,
      selectedResume: resumeId,
      uploadedResume: null // Clear uploaded file when selecting existing
    }));
    
    // Clear resume error if exists
    if (errors.resume) {
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        uploadedResume: file,
        selectedResume: '' // Clear selected resume when uploading new
      }));
      
      // Clear resume error if exists
      if (errors.resume) {
        setErrors(prev => ({
          ...prev,
          resume: ''
        }));
      }
    }
  };

  const handleCancelUpload = () => {
    setFormData(prev => ({
      ...prev,
      uploadedResume: null
    }));
    // Reset file input
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name required';
    }
    
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Date required';
    }
    
    if (!formData.selectedResume && !formData.uploadedResume) {
      newErrors.resume = 'Please select or upload resume';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let resumeId = formData.selectedResume;

      if (formData.uploadedResume && !resumeId) {
        resumeId = await handleResumeUpload();
      }

      if (!resumeId) {
        alert("Resume upload failed!");
        setIsLoading(false);
        return;
      }

      const applicationData = {
        job_title: formData.jobTitle,
        company_name: formData.companyName,
        applied_date: formData.appliedDate,
        status: formData.status,
        notes: formData.notes,
        resume_id: resumeId,
      };

      onSubmit(applicationData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async () => {
  if (!formData.uploadedResume) return null;

  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  const file = formData.uploadedResume;
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}_${Date.now()}.${fileExt}`;
  const filePath = `resumes/${fileName}`;

  const { data: existingResume, error } = await supabase
  .from('resumes')
  .select('id')
  .eq('user_id', user.id)
  .eq('file_name', file.name);

if (existingResume.length > 0) {
  alert("A file with this name already exists. Please rename it and try again.");
  setIsLoading(false);
  return null;
}

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // Insert into `resumes` table
  const { data: insertData, error: insertError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      file_url: publicUrl,
      file_name: file.name,
      uploaded_at: new Date().toISOString()
    })
    .select() // ⬅️ IMPORTANT to get back the inserted row

  if (insertError) {
    console.error("Resume insert failed:", insertError.message);
    return null;
  }

  return insertData?.[0]?.id; // return resume_id to use in application
};

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      companyName: '',
      appliedDate: '',
      status: 'applied',
      selectedResume: '',
      uploadedResume: null,
      notes: ''
    });
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 backdrop-blur-xs transition-opacity" />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-20">
                  <Briefcase className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Application</h3>
                  <p className="text-sm text-blue-100">Track your job application progress</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white bg-opacity-20 p-2 text-gray-700 hover:bg-opacity-30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Job Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-sm transition-all ${
                    errors.jobTitle 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-3`}
                  placeholder="e.g. Frontend Developer"
                />
                {errors.jobTitle && (
                  <p className="mt-2 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.jobTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-sm transition-all ${
                    errors.companyName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-3`}
                  placeholder="e.g. Google, Microsoft"
                />
                {errors.companyName && (
                  <p className="mt-2 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.companyName}
                  </p>
                )}
              </div>
            </div>

            {/* Date and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Application Date
                </label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-sm transition-all ${
                    errors.appliedDate 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  } focus:outline-none focus:ring-3`}
                />
                {errors.appliedDate && (
                  <p className="mt-2 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.appliedDate}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Application Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-200 transition-all"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resume Section - Column Layout */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Resume Selection
              </label>

              <div className="space-y-4">
                {/* Existing Resumes Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Select from Existing Resumes
                  </h4>
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    {existingResumes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                        {existingResumes.map(resume => (
                          <label 
                            key={resume.id} 
                            className={`flex items-start p-3 rounded-lg cursor-pointer transition-all ${
                              formData.selectedResume === resume.id.toString()
                                ? 'bg-blue-50 border-2 border-blue-300'
                                : 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                            } ${formData.uploadedResume ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="radio"
                              name="selectedResume"
                              value={resume.id}
                              checked={formData.selectedResume === resume.id.toString()}
                              onChange={(e) => handleResumeSelect(e.target.value)}
                              disabled={!!formData.uploadedResume}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-800 text-sm truncate">{resume.file_name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded: {new Date(resume.uploaded_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No existing resumes found</p>
                    )}
                  </div>
                </div>

                {/* Upload New Resume Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Upload New Resume
                  </h4>
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    {formData.uploadedResume ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="font-medium text-green-800 text-sm">{formData.uploadedResume.name}</p>
                            <p className="text-xs text-green-600">Ready to upload</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                          title="Remove selected file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="resume-upload"
                        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                          formData.selectedResume
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Click to upload resume</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX supported</span>
                      </label>
                    )}
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={!!formData.selectedResume}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {errors.resume && (
                <p className="mt-3 text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.resume}
                </p>
              )}
            </div>

            {/* Notes Section */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-200 transition-all resize-none"
                placeholder="Add any additional notes about this application..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-100 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Application...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddApplicationModal;
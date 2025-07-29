import React, { useState } from 'react';
import { 
  Upload,
    FileText,
  Brain,
    X
} from 'lucide-react';


// Upload Component
const UploadPage = ({ setCurrentPage }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [uploadedJobDesc, setUploadedJobDesc] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (type === 'resume') {
        setUploadedResume(files[0]);
      } else {
        setUploadedJobDesc(files[0]);
      }
    }
  };

  const FileUploadBox = ({ title, description, file, setFile, type }) => (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, type)}
    >
      <div className="mb-4">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
      </div>
      
      {file ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">{file.name}</span>
            <button 
              onClick={() => setFile(null)}
              className="ml-3 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id={`file-${type}`}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor={`file-${type}`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-500 mt-2">or drag and drop your file here</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="px-10 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Upload Documents</h1>
          <p className="text-gray-500 text-lg">Upload your resume and job description to get AI-powered feedback</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Resume Upload */}
          <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all min-w-0">
            <FileUploadBox
              title="Upload Your Resume"
              description="Upload your resume in PDF, DOC, or TXT format"
              file={uploadedResume}
              setFile={setUploadedResume}
              type="resume"
            />
          </div>
          {/* Job Description Upload */}
          <div className="flex-1 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all min-w-0">
            <FileUploadBox
              title="Upload Job Description"
              description="Upload the job description to analyze compatibility"
              file={uploadedJobDesc}
              setFile={setUploadedJobDesc}
              type="jobdesc"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-start mt-10">
          <button
            onClick={() => setCurrentPage('feedback')}
            disabled={!uploadedResume || !uploadedJobDesc}
            className={`w-64 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors
              ${uploadedResume && uploadedJobDesc
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
          >
            <Brain className="h-5 w-5" />
            Analyze with AI
          </button>
        </div>
      </div>
    </div>
  );
};
export default UploadPage;
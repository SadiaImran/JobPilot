import React, { useState , useEffect } from 'react';
import { Upload, FileText, Star, Download, Edit3, Check, AlertCircle, Sparkles, ArrowRight, Ban, XCircle } from 'lucide-react';
import { supabase } from '../supabase.js'; 
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// PDF text extraction function
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

// File Upload Component
const FileUpload = ({ title, accept, onFileSelect, selectedFile, icon: Icon, disabled, disabledReason, onCancel }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`file-${title.replace(' ', '-').toLowerCase()}`}
        disabled={disabled}
      />
      <div className="relative">
        <label
          htmlFor={`file-${title.replace(' ', '-').toLowerCase()}`}
          className={`block ${
            selectedFile ? 'pointer-events-none' : disabled ? 'pointer-events-none' : 'cursor-pointer'
          }`}
        >
          <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
          {selectedFile ? (
            <div className="flex items-center justify-center text-green-600 gap-2">
              <Check className="w-4 h-4" />
              <span className="text-sm">{selectedFile.name}</span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
          )}
        </label>
        {/* XCircle OUTSIDE the label */}
        {selectedFile && (
          <button
            type="button"
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onCancel && onCancel();
            }}
            tabIndex={0}
            aria-label="Remove file"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
      {disabled && (
        <div className="absolute top-2 right-2 flex items-center group">
          <Ban className="w-6 h-6 text-gray-400" />
          {showTooltip && (
            <div className="absolute z-10 right-8 top-0 bg-black text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap">
              {disabledReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Resume Selection Component
const ResumeSelector = ({ savedResumes, selectedResume, onResumeSelect, disabled, disabledReason, onCancel }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`relative space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <h3 className="text-lg font-medium text-gray-700 mb-4">Or select from saved resumes:</h3>
      <div className="grid gap-3">
        {savedResumes.map((resume) => {
          const isSelected = selectedResume?.id === resume.id;
          return (
            <div
              key={resume.id}
              onClick={() => !disabled && onResumeSelect(resume)}
              className={`group p-4 border rounded-lg cursor-pointer transition-all flex items-center justify-between
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                relative`}
              style={{ minHeight: 56 }}
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-700">{resume.file_name}</p>
                  <p className="text-sm text-gray-500">Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}</p>
                </div>
              </div>
              {/* Icons at the end */}
              <div className="flex items-center ml-auto">
                {isSelected ? (
                  <>
                    {/* Show XCircle only on hover */}
                    <button
                      type="button"
                      className="hidden group-hover:inline-flex text-red-400 hover:text-red-600 mr-2"
                      onClick={e => {
                        e.stopPropagation();
                        onCancel && onCancel();
                      }}
                      tabIndex={0}
                      aria-label="Deselect"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    {/* Always show check */}
                    <Check className="w-5 h-5 text-blue-500" />
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {disabled && (
        <div className="absolute top-2 right-2 flex items-center group">
          <Ban className="w-6 h-6 text-gray-400" />
          {showTooltip && (
            <div className="absolute z-10 right-8 top-0 bg-black text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap">
              {disabledReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Match Score Component
const MatchScore = ({ score, analysis }) => {
  // Defensive: fallback to empty array if undefined
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const improvements = Array.isArray(analysis.improvements) ? analysis.improvements : [];
  const detailedTips = Array.isArray(analysis.detailedTips) ? analysis.detailedTips : [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Resume Match Analysis</h3>
        <div className={`px-4 py-2 rounded-full ${getScoreBg(score)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-green-700 mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            What's Working Well
          </h4>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-orange-700 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Specific Improvements Needed
          </h4>
          <ul className="space-y-3">
            {improvements.map((improvement, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-3">💡 How to Improve Your Resume</h4>
        <div className="space-y-3">
          {detailedTips.map((tip, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4">
              <h5 className="font-medium text-blue-700">{tip.section}</h5>
              <p className="text-blue-600 text-sm mt-1">{tip.advice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Cover Letter Editor Component
const CoverLetterEditor = ({ coverLetter, onEdit, onDownload }) => {
  const [content, setContent] = useState(coverLetter);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onEdit(content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Cover Letter</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={() => onDownload(content)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-4 shadow-md border-2 border-gray-300">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-200 rounded-lg  resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your cover letter here..."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const JobApplicationAssistant = () => {
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [resume, setResume] = useState(null);
  const [selectedSavedResume, setSelectedSavedResume] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [analysis, setAnalysis] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [existingResumes, setExistingResumes] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


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

    
    fetchResumes();
    
  }, []);

  // Resume logic: only one can be selected at a time
  const handleResumeUpload = (file) => {
    setResume(file);
    setSelectedSavedResume(null);
  };
  const handleResumeSelect = (resumeObj) => {
    setSelectedSavedResume(resumeObj);
    setResume(null);
  };

  // Job description logic: only one can be used at a time
  const handleJobDescFile = (file) => {
    setJobDescriptionFile(file);
    setJobDescriptionText('');
  };
  const handleJobDescText = (e) => {
    setJobDescriptionText(e.target.value);
    setJobDescriptionFile(null);
  };

  // Button enable logic
  const canAnalyze =
    ((jobDescriptionFile || jobDescriptionText.trim().length > 0) &&
      (resume || selectedSavedResume));

  // Replace handleAnalyze with this:
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    // Get job description text
    let jobDescription = jobDescriptionText;
    if (jobDescriptionFile) {
      jobDescription = await jobDescriptionFile.text(); // For .txt/.docx, for PDF use a parser
    }

    // Get resume text
    let resumeText = '';
    if (resume) {
      resumeText = await resume.text(); // For .txt/.docx, for PDF use a parser
    } else if (selectedSavedResume) {
      // Fetch resume text from your backend or storage
      resumeText = selectedSavedResume.text || '';
    }

    try {
      const res = await fetch('http://localhost:4000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resumeText }),
      });
      const data = await res.json();
      setAnalysis(data);
      setCurrentStep(2);
    } catch (err) {
      setAnalysis({ error: 'Failed to analyze. Try again.' });
    }
    setIsAnalyzing(false);
  };

  const handleGenerateCoverLetter = async () => {
    // Get job description text
    let jobDescription = jobDescriptionText;
    if (jobDescriptionFile) {
      jobDescription = await jobDescriptionFile.text();
    }

    // Get resume text
    let resumeText = '';
    if (resume) {
      resumeText = await resume.text();
    } else if (selectedSavedResume) {
      resumeText = selectedSavedResume.text || '';
    }

    try {
      const res = await fetch('http://localhost:4000/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resumeText, analysis }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
        setCurrentStep(3);
      } else {
        setCoverLetter('Error generating cover letter. Please try again.');
        setCurrentStep(3);
      }
    } catch (err) {
      setCoverLetter('Error generating cover letter. Please try again.');
      setCurrentStep(3);
    }
  };

  const handleDownloadCoverLetter = (content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Job Application Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Upload your job description and resume to get AI-powered matching insights and generate a personalized cover letter
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Upload Documents
              </span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                AI Analysis
              </span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className={`font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                Cover Letter
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload Files */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Job Description Section */}
            <div className="bg-white rounded-4xl shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-blue-500 mb-6">Job Description</h2>
              <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                {/* Upload File */}
                <div className="flex-1">
                  <FileUpload
                    title="Upload Job Description"
                    accept=".pdf,.doc,.docx,.txt"
                    onFileSelect={handleJobDescFile}
                    selectedFile={jobDescriptionFile}
                    icon={FileText}
                    disabled={!!jobDescriptionText}
                    disabledReason="Disabled because you have pasted a job description. Remove the text to enable file upload."
                    onCancel={() => setJobDescriptionFile(null)}
                  />
                </div>
                {/* OR Enter Text */}
                <div className="flex-1 flex flex-col relative">
                  <label className="mb-2 text-blue-900 font-light text-lg">
                    or paste job description here
                  </label>
                  <div className="relative">
                    <textarea
                      className="border-2 border-dashed border-gray-200 rounded-xl outline-none p-4 hover:border-blue-300 transition-colors resize-none w-full"
                      rows={8}
                      placeholder="Paste the job description here..."
                      value={jobDescriptionText}
                      onChange={handleJobDescText}
                      disabled={!!jobDescriptionFile}
                    />
                    {jobDescriptionText && !!jobDescriptionFile === false && (
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        onClick={() => setJobDescriptionText('')}
                        tabIndex={0}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    {!!jobDescriptionFile && (
                      <div className="absolute top-2 right-10 flex items-center group">
                        <Ban className="w-5 h-5 text-gray-400" />
                        <span className="absolute z-10 right-8 top-0 bg-black text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap">
                          Disabled because you have uploaded a file. Remove the file to enable text input.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Show a hint for user */}
              <div className="mt-2 text-xs text-gray-500">
                {jobDescriptionFile && "You have uploaded a file. To paste text, remove the file first."}
                {jobDescriptionText && !jobDescriptionFile && "You have pasted text. To upload a file, clear the text first."}
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="bg-white rounded-4xl shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-blue-500 mb-6">Resume Selection</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Upload New Resume</h3>
                  <FileUpload
                    title="Upload Resume"
                    accept=".pdf,.doc,.docx"
                    onFileSelect={handleResumeUpload}
                    selectedFile={resume}
                    icon={Upload}
                    disabled={!!selectedSavedResume}
                    disabledReason="Disabled because you have selected a saved resume. Deselect it to upload a new resume."
                    onCancel={() => setResume(null)}
                  />
                </div>
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <div className="px-4 text-sm text-gray-500 bg-white">OR</div>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                <ResumeSelector
                  savedResumes={existingResumes.length > 0 ? existingResumes : []}
                  selectedResume={selectedSavedResume}
                  onResumeSelect={handleResumeSelect}
                  disabled={!!resume}
                  disabledReason="Disabled because you have uploaded a resume. Remove it to select from saved resumes."
                  onCancel={() => setSelectedSavedResume(null)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  canAnalyze && !isAnalyzing
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : (
                  <>
                    <Star className="w-5 h-5 inline mr-2" />
                    Analyze Resume Match
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analysis Results */}
        {currentStep === 2 && analysis && (
          <div className="space-y-8 outline-none border-2 border-gray-200 rounded-xl p-6 shadow-md">
            {analysis.error ? (
              <div className="text-red-600">{analysis.error}</div>
            ) : (
              <MatchScore score={analysis.score} analysis={analysis} />
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Upload
              </button>
              <button
                onClick={handleGenerateCoverLetter}
                className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all shadow-lg transform hover:scale-105"
              >
                <Edit3 className="w-5 h-5 inline mr-2" />
                Generate Cover Letter
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Cover Letter */}
        {currentStep === 3 && coverLetter && (
          <div className="space-y-8">
            <CoverLetterEditor
              coverLetter={coverLetter}
              onEdit={setCoverLetter}
              onDownload={handleDownloadCoverLetter}
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Analysis
              </button>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setAnalysis(null);
                  setCoverLetter('');
                  setJobDescriptionFile(null);
                  setJobDescriptionText('');
                  setResume(null);
                  setSelectedSavedResume(null);
                }}
                className="px-6 py-3 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationAssistant;
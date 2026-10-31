import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json } = pkg;
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env locally (if present)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getGeminiApiKey = () => {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  ).trim();
};

const app = express();

const allowedOrigins = [
  'https://job-pilot-phi.vercel.app',
  'https://jobpilot.vercel.app',
  'https://job-pilot-nzgp6wque-sadiaimran837gmailcoms-projects.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (e.g. server-to-server, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any localhost port for local development
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel deployment (preview or production)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow explicit domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Default allow so CORS never blocks valid clients unexpectedly
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(json({ limit: '5mb' }));

// Health and root status endpoints
app.get('/', (req, res) => {
  const hasKey = Boolean(getGeminiApiKey());
  res.status(200).json({
    status: 'ok',
    service: 'JobPilot Backend API',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/analyze', async (req, res) => {
  const { jobDescription, resumeText } = req.body || {};

  if (!jobDescription || !resumeText) {
    return res.status(400).json({ error: 'Both jobDescription and resumeText are required.' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error('Gemini API key is not configured!');
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY in Railway Environment Variables.'
    });
  }

  const prompt = `
You are a job application assistant. Analyze the following resume against the job description.
ONLY return a JSON. Do not explain anything. Do not add any commentary. Format strictly like:
{
  "score": 87,
  "strengths": [...],
  "improvements": [...],
  "detailedTips": [{"section": "Experience", "advice": "..."}]
}

Job Description:
${jobDescription}

Resume:
${resumeText}
`;

  try {
    console.log('Sending prompt to Gemini...');
    let response;
    let attempts = 0;
    while (attempts < 10) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          }
        );
        break; // success
      } catch (err) {
        if (err?.response?.data?.error?.status === 'UNAVAILABLE') {
          attempts++;
          console.log(`Gemini overloaded, retrying (${attempts})...`);
          await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
        } else {
          throw err;
        }
      }
    }
    if (!response) {
      return res.status(503).json({ error: 'Gemini API overloaded. Please try again later.' });
    }

    // Gemini's response format
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    console.log('Gemini raw response:', text);

    let analysis;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'No JSON found', raw: text };
    } catch (err) {
      console.error('JSON parse error:', err, 'Raw text:', text);
      analysis = { error: 'Could not parse AI response', raw: text };
    }
    res.json(analysis);
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    const errorMsg =
      err?.response?.data?.error?.message ||
      (typeof err?.response?.data?.error === 'string' ? err.response.data.error : null) ||
      err.message ||
      'Unknown server error';
    res.status(500).json({ error: errorMsg });
  }
});

app.post('/cover-letter', async (req, res) => {
  const { jobDescription, resumeText, analysis } = req.body || {};

  if (!jobDescription || !resumeText) {
    return res.status(400).json({ error: 'Both jobDescription and resumeText are required.' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error('Gemini API key is not configured!');
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY in Railway Environment Variables.'
    });
  }

  const prompt = `
You are a professional job application assistant. Based on the following job description and resume, and the analysis provided, write a personalized cover letter for this job application. The cover letter should be concise, professional, and highlight the candidate's strengths relevant to the job. Do not include any commentary or explanation, just the cover letter text.

Job Description:
${jobDescription}

Resume:
${resumeText}

Analysis:
${JSON.stringify(analysis || {})}
`;

  try {
    let response;
    let attempts = 0;
    while (attempts < 3) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          }
        );
        break;
      } catch (err) {
        if (err?.response?.data?.error?.status === 'UNAVAILABLE') {
          attempts++;
          console.log(`Gemini overloaded, retrying (${attempts})...`);
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw err;
        }
      }
    }
    if (!response) {
      return res.status(503).json({ error: 'Gemini API overloaded. Please try again later.' });
    }

    const coverLetter = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ coverLetter });
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    const errorMsg =
      err?.response?.data?.error?.message ||
      (typeof err?.response?.data?.error === 'string' ? err.response.data.error : null) ||
      err.message ||
      'Unknown server error';
    res.status(500).json({ error: errorMsg });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

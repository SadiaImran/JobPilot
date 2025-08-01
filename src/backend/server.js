import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';
const { json } = pkg;
import axios from 'axios';

const app = express();

const allowedOrigins = [
  'https://job-pilot-phi.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use(json({ limit: '5mb' }));

app.post('/analyze', async (req, res) => {
  const { jobDescription, resumeText } = req.body;

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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
    res.status(500).json({ error: err?.response?.data?.error || err.message });
  }
});

app.post('/cover-letter', async (req, res) => {
  const { jobDescription, resumeText, analysis } = req.body;

  const prompt = `
You are a professional job application assistant. Based on the following job description and resume, and the analysis provided, write a personalized cover letter for this job application. The cover letter should be concise, professional, and highlight the candidate's strengths relevant to the job. Do not include any commentary or explanation, just the cover letter text.

Job Description:
${jobDescription}

Resume:
${resumeText}

Analysis:
${JSON.stringify(analysis)}
`;

  try {
    let response;
    let attempts = 0;
    while (attempts < 3) {
      try {
        response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
    res.status(500).json({ error: err?.response?.data?.error || err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
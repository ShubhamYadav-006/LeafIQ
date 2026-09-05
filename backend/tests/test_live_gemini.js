import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AiBridgeService } from '../src/services/ai.service.js';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function runLiveGeminiTests() {
  console.log('====================================================');
  console.log('🌱 LEAFIQ LIVE GEMINI MULTIMODAL MODEL EVALUATION');
  console.log('====================================================\n');

  if (!API_KEY || API_KEY.trim() === '') {
    console.log('⚠️  GEMINI_API_KEY is not set in backend/.env.');
    console.log('   To run live multimodal queries against Google Gemini,');
    console.log('   add your key to backend/.env:');
    console.log('   GEMINI_API_KEY=your_key_here\n');
    return;
  }

  console.log(`Using model: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}\n`);

  // Locate sample test images from backend/uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.png')) : [];

  if (files.length > 0) {
    const testFile = path.join(uploadsDir, files[0]);
    console.log(`Testing with sample image: ${files[0]} (${fs.statSync(testFile).size} bytes)`);

    try {
      const buffer = fs.readFileSync(testFile);
      const result = await AiBridgeService.analyzeImage(buffer, 'image/jpeg');

      console.log('\n--- GEMINI STRUCTURED ASSESSMENT RESULT ---');
      console.log('Image Valid:', result.image_valid);
      console.log('Crop:', JSON.stringify(result.crop));
      console.log('Assessment:', JSON.stringify(result.assessment));
      console.log('Visual Evidence Count:', result.visual_evidence.length);
      console.log('Description:', result.description);
      console.log('How to Fix Count:', result.how_to_fix.length);
      console.log('Prevention Count:', result.prevention.length);
      console.log('What to Monitor Count:', result.what_to_monitor.length);
      console.log('Alternative Possibilities:', JSON.stringify(result.alternative_possibilities));
      console.log('Disclaimer:', result.disclaimer);
      console.log('-------------------------------------------\n');
      console.log('✓ Live Gemini multimodal analysis completed successfully!');
    } catch (err) {
      console.error('Live Gemini analysis error:', err.message || err);
    }
  } else {
    console.log('No sample image files found in uploads directory.');
  }
}

runLiveGeminiTests();

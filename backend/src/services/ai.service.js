import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import { ApiError } from '../utils/apiError.js';

dotenv.config();

const GEMINI_SYSTEM_INSTRUCTION = `You are LeafIQ's primary agricultural vision AI specialist.
Your mission is to perform visual crop leaf inspection and health assessment for farmers.

CRITICAL ASSESSMENT RULES:
1. ACTUAL EVIDENCE ONLY: Base your assessment strictly on visible visual evidence in the provided image (leaf shape, color, spots, lesions, chlorosis/yellowing, browning/necrosis, wilting, holes, mold/mildew, visible abnormal patterns). NEVER manufacture symptoms or invent conditions not visible.
2. IMAGE VALIDATION: First evaluate whether the image contains a clear, usable plant or crop leaf.
   Mark as insufficient ("image_valid": false, "plant_detected": false, "crop": null, "assessment": {"status": "insufficient_image", "problem": null, "confidence": "Low", "concern_level": "Unable to Assess"}) when:
   - The image is not a plant or leaf (e.g. human, animal, vehicle, document, room, object, landscape without focus on leaf).
   - The image is extremely blurry, out of focus, or degraded.
   - The image is too dark, severely underexposed, or overexposed.
   - The subject cannot reasonably be identified or there is insufficient visual evidence.
   NEVER invent a crop or disease when the image is insufficient.
3. CROP IDENTIFICATION: When a crop leaf is visible, identify the most likely crop (e.g. Tomato, Potato, Corn, Pepper, Grape, Apple, Rice, Wheat, Cotton, Mango, etc.) and assign confidence ("High", "Medium", "Low").
4. HEALTH ASSESSMENT: Determine if the leaf is:
   - "healthy": Leaves appear generally green, vibrant, and intact with no obvious disease lesions or pest distress.
   - "possible_problem": Visible lesions, spots, yellowing, fungal growth, or abnormalities exist. Identify the most likely condition/disease ONLY when evidence supports it.
   - "insufficient_image": When visual information is inadequate.
5. HONEST UNCERTAINTY: If symptoms could correspond to multiple diseases (e.g. early blight vs septoria leaf spot), select the most likely condition, describe the visual ambiguity honestly in the description, and list secondary possibilities in "alternative_possibilities". Prefer uncertainty over unsupported guesses.
6. CONFIDENCE LEVEL: Use strictly "High", "Medium", or "Low". Never use percentages, decimal probabilities, or claims of 100% certainty or guaranteed diagnosis.
7. FARMER-FRIENDLY GUIDANCE: Provide clear, practical, safe steps in "how_to_fix", "prevention", and "what_to_monitor".

OUTPUT FORMAT: You MUST return a single, strictly valid JSON object conforming to the required schema:
For disease/problem:
{
  "image_valid": true,
  "plant_detected": true,
  "crop": {
    "name": "Tomato",
    "confidence": "High"
  },
  "assessment": {
    "status": "possible_problem",
    "problem": "Early Blight",
    "confidence": "Medium",
    "concern_level": "Attention Recommended"
  },
  "visual_evidence": [
    "Dark concentric lesions visible on leaf blade",
    "Yellow chlorotic halos surrounding affected areas"
  ],
  "description": "Visual inspection reveals irregular brown-to-black necrotic lesions with yellow chlorotic halos, characteristic of early fungal infection.",
  "how_to_fix": [
    "Remove severely affected leaves where appropriate",
    "Improve airflow around the plants",
    "Avoid unnecessary leaf wetness"
  ],
  "prevention": [
    "Monitor nearby leaves for new symptoms",
    "Maintain adequate spacing and airflow",
    "Remove infected plant material appropriately"
  ],
  "what_to_monitor": [
    "Increase in lesion size",
    "Appearance of new affected leaves",
    "Overall plant vigor"
  ],
  "alternative_possibilities": [],
  "disclaimer": "This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis."
}

For healthy crop:
{
  "image_valid": true,
  "plant_detected": true,
  "crop": {
    "name": "Tomato",
    "confidence": "High"
  },
  "assessment": {
    "status": "healthy",
    "problem": null,
    "confidence": "High",
    "concern_level": "Low"
  },
  "visual_evidence": [
    "Leaves appear generally green and intact",
    "No obvious disease lesions are visible"
  ],
  "description": "The visible leaf appears generally healthy based on the submitted image.",
  "how_to_fix": [],
  "prevention": [
    "Continue regular crop monitoring"
  ],
  "what_to_monitor": [
    "New spots, discoloration, wilting, or abnormal growth"
  ],
  "alternative_possibilities": [],
  "disclaimer": "This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis."
}

For invalid/unclear image:
{
  "image_valid": false,
  "plant_detected": false,
  "crop": null,
  "assessment": {
    "status": "insufficient_image",
    "problem": null,
    "confidence": "Low",
    "concern_level": "Unable to Assess"
  },
  "visual_evidence": [],
  "description": "The submitted image does not provide enough clear visual information for a reliable crop-health assessment.",
  "how_to_fix": [],
  "prevention": [],
  "what_to_monitor": [],
  "alternative_possibilities": [],
  "disclaimer": "Please upload a clear image of the crop leaf."
}`;

export class AiBridgeService {
  /**
   * Get the configured Gemini generative model instance.
   */
  static _getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw ApiError.internal(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in the backend environment.',
        'GEMINI_API_KEY_MISSING'
      );
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    return genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
  }

  /**
   * Analyze an image buffer using Google Gemini multimodal AI.
   * @param {Buffer|string} imageBufferOrPath - Raw Buffer, base64 data string, or file path
   * @param {string} mimeType - e.g. 'image/jpeg', 'image/png', 'image/webp'
   * @returns {Promise<Object>} Standardized LeafIQ structured assessment
   */
  static async analyzeImage(imageBufferOrPath, mimeType = 'image/jpeg') {
    let base64Data = '';
    let resolvedMime = mimeType || 'image/jpeg';

    if (Buffer.isBuffer(imageBufferOrPath)) {
      base64Data = imageBufferOrPath.toString('base64');
    } else if (typeof imageBufferOrPath === 'string') {
      if (imageBufferOrPath.startsWith('data:')) {
        const matches = imageBufferOrPath.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          resolvedMime = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = imageBufferOrPath;
        }
      } else if (fs.existsSync(imageBufferOrPath)) {
        const fileBuffer = fs.readFileSync(imageBufferOrPath);
        base64Data = fileBuffer.toString('base64');
        if (imageBufferOrPath.endsWith('.png')) resolvedMime = 'image/png';
        else if (imageBufferOrPath.endsWith('.webp')) resolvedMime = 'image/webp';
        else resolvedMime = 'image/jpeg';
      } else {
        base64Data = imageBufferOrPath;
      }
    } else {
      throw ApiError.badRequest('Invalid image data provided for AI analysis.');
    }

    const supportedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedMimes.includes(resolvedMime.toLowerCase())) {
      return this._buildInsufficientImageResponse(
        `Unsupported image format '${resolvedMime}'. Please upload a clear JPG, PNG, or WEBP leaf photo.`
      );
    }

    const model = this._getGeminiModel();
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: resolvedMime === 'image/jpg' ? 'image/jpeg' : resolvedMime,
      },
    };

    const promptText = `Examine this uploaded image carefully. Follow all LeafIQ assessment rules. Determine if a crop leaf is clearly visible and assess its health. Return strictly structured JSON matching the defined schema.`;

    try {
      const result = await model.generateContent([imagePart, promptText]);
      const response = await result.response;
      const textOutput = response.text();

      return this._parseAndValidateGeminiResponse(textOutput);
    } catch (err) {
      console.error('[Gemini AI Engine] Analysis error:', err.message || err);

      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw ApiError.internal(
          'Gemini API key is invalid. Please verify your GEMINI_API_KEY setting.',
          'GEMINI_AUTH_ERROR'
        );
      }
      if (err.message && err.message.includes('RESOURCE_EXHAUSTED')) {
        throw ApiError.internal(
          'Gemini AI quota exceeded. Please try again shortly.',
          'GEMINI_QUOTA_EXCEEDED'
        );
      }

      throw ApiError.internal(
        `Gemini AI analysis failed: ${err.message || 'Unknown service error'}`,
        'GEMINI_ANALYSIS_FAILED'
      );
    }
  }

  /**
   * Parse and validate Gemini's JSON output according to LeafIQ specification.
   */
  static _parseAndValidateGeminiResponse(rawText) {
    let cleanText = (rawText || '').trim();

    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      console.warn('[Gemini AI Engine] JSON parse error on raw output:', cleanText);
      return this._buildInsufficientImageResponse(
        'The submitted image could not be processed reliably. Please upload a clear image of the crop leaf.'
      );
    }

    const normalizeConfidence = (conf) => {
      if (!conf) return 'Medium';
      const c = String(conf).toLowerCase();
      if (c.includes('high')) return 'High';
      if (c.includes('low')) return 'Low';
      return 'Medium';
    };

    if (!parsed.image_valid || !parsed.plant_detected || parsed.assessment?.status === 'insufficient_image') {
      return {
        image_valid: false,
        plant_detected: false,
        crop: null,
        assessment: {
          status: 'insufficient_image',
          problem: null,
          confidence: 'Low',
          concern_level: 'Unable to Assess',
        },
        visual_evidence: Array.isArray(parsed.visual_evidence) ? parsed.visual_evidence : [],
        description:
          parsed.description ||
          'The submitted image does not provide enough clear visual information for a reliable crop-health assessment.',
        how_to_fix: [],
        prevention: [],
        what_to_monitor: [],
        alternative_possibilities: [],
        disclaimer: parsed.disclaimer || 'Please upload a clear image of the crop leaf.',
      };
    }

    const isHealthy = parsed.assessment?.status === 'healthy' || parsed.assessment?.problem === null;
    const cropName = parsed.crop?.name || 'Crop';
    const cropConfidence = normalizeConfidence(parsed.crop?.confidence);

    const problem = isHealthy ? null : (parsed.assessment?.problem || 'Unspecified Condition');
    const assessmentStatus = isHealthy ? 'healthy' : 'possible_problem';
    const assessmentConfidence = normalizeConfidence(parsed.assessment?.confidence);
    const concernLevel = parsed.assessment?.concern_level || (isHealthy ? 'Low' : 'Attention Recommended');

    return {
      image_valid: true,
      plant_detected: true,
      crop: {
        name: cropName,
        confidence: cropConfidence,
      },
      assessment: {
        status: assessmentStatus,
        problem: problem,
        confidence: assessmentConfidence,
        concern_level: concernLevel,
      },
      visual_evidence: Array.isArray(parsed.visual_evidence) ? parsed.visual_evidence : [],
      description:
        parsed.description ||
        (isHealthy
          ? `The visible ${cropName} leaf appears generally healthy based on the submitted image.`
          : `Visual analysis indicates possible ${problem} on ${cropName} foliage.`),
      how_to_fix: Array.isArray(parsed.how_to_fix) ? parsed.how_to_fix : [],
      prevention: Array.isArray(parsed.prevention) ? parsed.prevention : [],
      what_to_monitor: Array.isArray(parsed.what_to_monitor) ? parsed.what_to_monitor : [],
      alternative_possibilities: Array.isArray(parsed.alternative_possibilities)
        ? parsed.alternative_possibilities
        : [],
      disclaimer:
        parsed.disclaimer ||
        'This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis.',
    };
  }

  static _buildInsufficientImageResponse(customDescription) {
    return {
      image_valid: false,
      plant_detected: false,
      crop: null,
      assessment: {
        status: 'insufficient_image',
        problem: null,
        confidence: 'Low',
        concern_level: 'Unable to Assess',
      },
      visual_evidence: [],
      description:
        customDescription ||
        'The submitted image does not provide enough clear visual information for a reliable crop-health assessment.',
      how_to_fix: [],
      prevention: [],
      what_to_monitor: [],
      alternative_possibilities: [],
      disclaimer: 'Please upload a clear image of the crop leaf.',
    };
  }
}




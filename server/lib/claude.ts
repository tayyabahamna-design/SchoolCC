import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@deepgram/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

/**
 * Transcribe audio using Deepgram speech-to-text API
 * Supports multiple languages including English and Urdu
 */
export async function transcribeAudio(audioBuffer: Buffer, language: string = 'en'): Promise<string> {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key not configured');
    }

    // Determine language code for Deepgram
    const languageCode = language === 'ur' ? 'ur' : 'en-US';

    // Transcribe audio using Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: languageCode,
        smart_format: true,
        punctuate: true,
        paragraphs: true,
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      throw new Error(`Deepgram transcription failed: ${error.message}`);
    }

    // Extract the transcript from Deepgram response
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript) {
      throw new Error('No transcription generated');
    }

    return transcript;
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Audio transcription failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate a comprehensive visit summary using Claude
 */
export async function generateVisitSummary(visitData: {
  schoolName: string;
  visitDate: string;
  visitType: string;
  attendanceData?: {
    teacherTotal: number;
    teacherPresent: number;
    studentTotal: number;
    studentPresent: number;
  };
  facilities?: any;
  observations?: string;
  transcribedNotes?: string;
  recommendations?: string;
}): Promise<string> {
  const prompt = `You are an education officer assistant. Generate a professional, concise visit summary based on the following school visit data:

School: ${visitData.schoolName}
Visit Date: ${visitData.visitDate}
Visit Type: ${visitData.visitType}

${visitData.attendanceData ? `
Attendance Data:
- Teachers: ${visitData.attendanceData.teacherPresent}/${visitData.attendanceData.teacherTotal} present (${Math.round((visitData.attendanceData.teacherPresent / visitData.attendanceData.teacherTotal) * 100)}%)
- Students: ${visitData.attendanceData.studentPresent}/${visitData.attendanceData.studentTotal} present (${Math.round((visitData.attendanceData.studentPresent / visitData.attendanceData.studentTotal) * 100)}%)
` : ''}

${visitData.facilities ? `
Facilities Status:
${JSON.stringify(visitData.facilities, null, 2)}
` : ''}

${visitData.observations ? `
Observations: ${visitData.observations}
` : ''}

${visitData.transcribedNotes ? `
Voice Notes: ${visitData.transcribedNotes}
` : ''}

${visitData.recommendations ? `
Recommendations: ${visitData.recommendations}
` : ''}

Please generate a well-structured summary with the following sections:
1. Executive Summary (2-3 sentences)
2. Key Findings
3. Areas of Concern (if any)
4. Recommendations
5. Follow-up Actions Required

Keep it professional, concise, and actionable.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    throw new Error('No text content in Claude response');
  } catch (error) {
    console.error('Error generating visit summary:', error);
    throw error;
  }
}

/**
 * Analyze visit data and provide insights
 */
export async function analyzeVisitData(visits: any[]): Promise<{
  trends: string;
  concerns: string[];
  recommendations: string[];
}> {
  const prompt = `As an education data analyst, analyze the following school visit data and provide insights:

${JSON.stringify(visits, null, 2)}

Provide:
1. Key trends observed across visits
2. Main concerns or red flags
3. Actionable recommendations for improvement

Keep responses concise and data-driven.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      // Parse the response into structured data
      const response = textContent.text;
      return {
        trends: response,
        concerns: [],
        recommendations: [],
      };
    }

    throw new Error('No text content in Claude response');
  } catch (error) {
    console.error('Error analyzing visit data:', error);
    throw error;
  }
}

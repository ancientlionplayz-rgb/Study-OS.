import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '../../../lib/coach/geminiService';

export interface ParsedStudentRoutine {
  studentProfile: {
    name: string;
    grade: string;
    targetExamYear: number;
    dailyStudyTargetMinutes: number;
    mathsMandatoryMinutes: number;
  };
  scheduleTemplate: {
    routineType: 'morning_heavy' | 'evening_tuition' | 'weekend_academy' | 'custom';
    blocks: Array<{
      name: string;
      subject: string;
      plannedMinutes: number;
      timeSlotHint: string;
      type: 'morning_maths' | 'core_subject' | 'second_subject' | 'recall_error_review';
    }>;
  };
  commitments: {
    schoolHours: string;
    tuitionSummary: string;
    sportsOrAcademy: string;
  };
  explanation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { routineText, grade = 'Class 9 ICSE', preferredTimes = '' } = await req.json();

    if (!routineText || typeof routineText !== 'string') {
      return NextResponse.json(
        { error: 'Routine text is required.' },
        { status: 400 }
      );
    }

    const lower = routineText.toLowerCase();
    const isEveningTuition = lower.includes('tuition') || lower.includes('coaching') || lower.includes('evening');
    const isFootballOrSports = lower.includes('football') || lower.includes('academy') || lower.includes('sports') || lower.includes('gym');
    const isEarlyMorning = lower.includes('morning') || lower.includes('5am') || lower.includes('6am');

    // Extract study target if mentioned (e.g. "2 hours", "3.5h", "90 mins")
    let extractedStudyMins = 120;
    const studyHoursMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
    const studyMinsMatch = lower.match(/(\d+)\s*(?:mins?|minutes?)\b/);
    if (studyHoursMatch) {
      extractedStudyMins = Math.round(parseFloat(studyHoursMatch[1]) * 60);
    } else if (studyMinsMatch) {
      extractedStudyMins = parseInt(studyMinsMatch[1], 10);
    }

    // Only set mandatory maths if user explicitly asked for mandatory maths or focus maths
    const hasMandatoryMaths = lower.includes('mandatory math') || lower.includes('daily math') || lower.includes('60m math') || lower.includes('math focus');

    // Deterministic base profile
    const deterministicParsed: ParsedStudentRoutine = {
      studentProfile: {
        name: 'StudyOS Student',
        grade,
        targetExamYear: 2027,
        dailyStudyTargetMinutes: extractedStudyMins,
        mathsMandatoryMinutes: hasMandatoryMaths ? 60 : 0,
      },
      scheduleTemplate: {
        routineType: isEveningTuition ? 'evening_tuition' : isFootballOrSports ? 'weekend_academy' : 'morning_heavy',
        blocks: [
          ...(hasMandatoryMaths
            ? [
                {
                  name: 'Block 1: Mandatory Mathematics',
                  subject: 'Mathematics',
                  plannedMinutes: 60,
                  timeSlotHint: isEarlyMorning ? '06:00 - 07:00 AM (Early Prime Focus)' : '06:30 - 07:30 AM (Morning Drill)',
                  type: 'morning_maths' as const,
                },
              ]
            : []),
          {
            name: 'Block 2: Core Academic Focus',
            subject: 'Core Subject',
            plannedMinutes: Math.min(extractedStudyMins, 60),
            timeSlotHint: isEveningTuition ? '07:30 - 08:30 PM (Post-Tuition Focus)' : '04:30 - 05:30 PM (Afternoon Deep Work)',
            type: 'core_subject',
          },
          ...(extractedStudyMins > 60
            ? [
                {
                  name: 'Block 3: Secondary Subject Practice',
                  subject: 'Secondary Subject',
                  plannedMinutes: Math.min(extractedStudyMins - 60, 60),
                  timeSlotHint: isEveningTuition ? '08:45 - 09:45 PM (Night Synthesis)' : '06:00 - 07:00 PM (Pre-Dinner Focus)',
                  type: 'second_subject' as const,
                },
              ]
            : []),
          {
            name: 'Block 4: Error Journal & Active Recall',
            subject: 'Revision',
            plannedMinutes: 30,
            timeSlotHint: '09:45 - 10:15 PM (Recall & Consolidation)',
            type: 'recall_error_review',
          },
        ],
      },
      commitments: {
        schoolHours: 'Configured from student routine inputs',
        tuitionSummary: isEveningTuition ? 'Evening Tuition / Coaching classes accounted for' : 'No conflicting tuition slots detected',
        sportsOrAcademy: isFootballOrSports ? 'Sports / Academy commitments preserved' : 'Daily fitness slot preserved',
      },
      explanation: `Parsed your routine into a personalized ${extractedStudyMins}-minute study cadence around your actual commitments.`,
    };

    // If Gemini key is available, use LLM to enhance the routine extraction
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey.length > 5) {
      try {
        const model = GeminiService.getModelName();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const prompt = [
          'You are the Lead Student Operations Architect for StudyOS.',
          'A student provided their raw daily routine text:',
          JSON.stringify(routineText),
          `Grade: ${grade}`,
          `Preferred Times: ${preferredTimes}`,
          '',
          'Extract their schedule into JSON with this exact schema:',
          '{',
          '  "studentProfile": {',
          '    "name": string,',
          '    "grade": string,',
          '    "targetExamYear": number,',
          '    "dailyStudyTargetMinutes": number,',
          '    "mathsMandatoryMinutes": number',
          '  },',
          '  "scheduleTemplate": {',
          '    "routineType": "morning_heavy" | "evening_tuition" | "weekend_academy" | "custom",',
          '    "blocks": [',
          '      {',
          '        "name": string,',
          '        "subject": string,',
          '        "plannedMinutes": number,',
          '        "timeSlotHint": string,',
          '        "type": "morning_maths" | "core_subject" | "second_subject" | "recall_error_review"',
          '      }',
          '    ]',
          '  },',
          '  "commitments": {',
          '    "schoolHours": string,',
          '    "tuitionSummary": string,',
          '    "sportsOrAcademy": string',
          '  },',
          '  "explanation": string',
          '}',
          '',
          'Rules:',
          '1. Extract the student\'s stated study target in minutes (default to 120 only if unstated, never force 210).',
          '2. Only allocate mandatory Mathematics if the student explicitly specified it as mandatory, otherwise mathsMandatoryMinutes = 0.',
          '3. Must never collide with mentioned school, tuition, sports, or sleep times.',
          '4. Return ONLY raw JSON without markdown code fences.',
        ].join('\n');

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const sanitizedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(sanitizedText);
            return NextResponse.json({
              success: true,
              source: 'gemini_ai',
              data: parsed,
            });
          }
        }
      } catch (llmErr) {
        console.warn('Gemini routine parse failed, falling back to deterministic parser:', llmErr);
      }
    }

    return NextResponse.json({
      success: true,
      source: 'deterministic_engine',
      data: deterministicParsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to parse onboarding routine.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateTimeSlots(startTime: string, endTime: string): { startTime: string, endTime: string }[] {
  const slots = [];
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + 30 * 60000);
    if (slotEnd <= end) {
      slots.push({
        startTime: start.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5)
      });
    }
    start.setTime(start.getTime() + 30 * 60000);
  }

  return slots;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getDatesForDay(year: number, month: number, dayName: string): string[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = days.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
  const dates = [];
  
  // Get all dates in the month
  const daysInMonth = getDaysInMonth(year, month);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === dayIndex) {
      dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    }
  }
  
  return dates;
}

export async function POST(request: NextRequest) {
  try {
    const { availability } = await request.json();
    
    const prompt = `
    Convert this availability text into a structured JSON format:
    "${availability}"

    Rules:
    - "everyday" or "every day" applies to all days
    - Day-specific times override default times
    - "no" or "except" before a day means exclude that day
    - Times can be in 12h (9am, 2pm) or 24h (09:00, 14:00) format
    
    Return JSON in this format:
    {
      "defaultHours": { "start": "HH:mm", "end": "HH:mm" },
      "exceptions": {
        "monday": { "start": "HH:mm", "end": "HH:mm" },
        "excluded": ["thursday", "friday"]
      }
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: availability }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Completion content is null');
    }
    const schedule = JSON.parse(content);
    
    // Get current month's dates
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Generate all available dates
    let availableSlots = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (const day of days) {
      if (schedule.exceptions?.excluded?.includes(day)) {
        continue;
      }

      const dates = getDatesForDay(year, month, day);
      const timeRange = schedule.exceptions?.[day] || schedule.defaultHours;
      
      if (timeRange) {
        for (const date of dates) {
          const slots = generateTimeSlots(timeRange.start, timeRange.end);
          availableSlots.push(...slots.map(slot => ({
            date,
            startTime: slot.startTime,
            endTime: slot.endTime
          })));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { slots: availableSlots }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Availability API endpoint" 
  });
}
import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { AIDailyReview } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { userId, date } = await request.json();
    if (!userId || !date) {
      return NextResponse.json({ error: 'Missing userId or date' }, { status: 400 });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only collect this requesting user's private metrics
    const userSubjects = db.subjects.filter(s => s.userId === userId);
    const userSessions = db.studySessions.filter(s => s.userId === userId && s.date === date);
    const userActivity = db.activityLogs.find(a => a.userId === userId && a.date === date);
    const userSleep = db.sleepRecords.find(s => s.userId === userId && s.date === date);
    const userReflection = db.reflections.find(r => r.userId === userId && r.date === date);

    const totalStudyMins = userSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const targetStudyMins = user.dailyStudyTargetMinutes || 240;
    const studyCompletionPct = Math.round((totalStudyMins / targetStudyMins) * 100);

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    let review: AIDailyReview;

    if (apiKey) {
      // Call AI endpoint if API key exists
      try {
        const prompt = `You are a supportive, calm, realistic digital accountability coach for ${user.name}.
Exam Goal: ${user.exam}
Logged Day Metrics for ${date}:
- Target Study: ${targetStudyMins} mins | Actual Study: ${totalStudyMins} mins (${studyCompletionPct}%).
- Study sessions logged: ${JSON.stringify(userSessions.map(s => ({ subject: s.subjectName, mins: s.durationMinutes, questions: s.questionsAttempted })))}
- Physical Activity: Gym=${userActivity?.gymToday ? 'Yes' : 'No'}, Other Activity=${userActivity?.activityToday ? userActivity.activityType : 'None'}, Gaming=${userActivity?.playedGamesToday ? userActivity.gamingDurationMinutes + ' mins' : 'None'} (Self limit: ${user.dailyGamingLimitMinutes}m).
- Sleep: ${userSleep ? `${Math.round(userSleep.actualSleepMinutes / 60)}h ${userSleep.actualSleepMinutes % 60}m (Target: ${user.dailySleepTargetHours}h, Quality: ${userSleep.sleepQualityRating}/5)` : 'Not logged yet'}.
- Personal Reflection: ${userReflection ? `Went well: "${userReflection.wentWell}", Obstacle: "${userReflection.biggestObstacle}", Improvement: "${userReflection.oneImprovementTomorrow}"` : 'None logged'}.

Follow these rules:
1. Be encouraging, realistic, concise, and grounded in the logged numbers. Never shame.
2. Return strictly a JSON object with this exact shape:
{
  "overview": string,
  "whatWentWell": string,
  "opportunityToImprove": string,
  "studyInsights": string,
  "routineAndRecovery": string,
  "actionPlan": [string, string, string],
  "encouragement": string
}`;

        const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const aiData = await aiResponse.json();
        const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(textContent);

        review = {
          id: `ai-${Date.now()}`,
          userId,
          date,
          overview: parsed.overview,
          whatWentWell: parsed.whatWentWell,
          opportunityToImprove: parsed.opportunityToImprove,
          studyInsights: parsed.studyInsights,
          routineAndRecovery: parsed.routineAndRecovery,
          actionPlan: parsed.actionPlan?.slice(0, 3) || [],
          encouragement: parsed.encouragement,
          isGeneratedByAI: true,
          createdAt: new Date().toISOString()
        };
      } catch (err) {
        console.error('External AI call failed, falling back to smart analytical engine:', err);
        review = generateAlgorithmicReview(user, date, totalStudyMins, targetStudyMins, userSessions, userActivity, userSleep, userReflection);
      }
    } else {
      // Smart Algorithmic Review based on genuine logged data
      review = generateAlgorithmicReview(user, date, totalStudyMins, targetStudyMins, userSessions, userActivity, userSleep, userReflection);
    }

    // Persist review to DB (replace existing review for this date if regenerating)
    const existingIdx = db.aiReviews.findIndex(r => r.userId === userId && r.date === date);
    if (existingIdx >= 0) {
      db.aiReviews[existingIdx] = review;
    } else {
      db.aiReviews.push(review);
    }
    writeDB(db);

    return NextResponse.json({ review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function generateAlgorithmicReview(
  user: any,
  date: string,
  totalStudyMins: number,
  targetStudyMins: number,
  sessions: any[],
  activity: any,
  sleep: any,
  reflection: any
): AIDailyReview {
  const studyPct = Math.round((totalStudyMins / targetStudyMins) * 100);
  
  let overview = `You logged ${Math.floor(totalStudyMins / 60)}h ${totalStudyMins % 60}m of focused study (${studyPct}% of target). `;
  if (activity?.gymToday || activity?.activityToday) {
    overview += `You also prioritized your physical health today.`;
  } else {
    overview += `Steady day with solid foundational effort.`;
  }

  let whatWentWell = sessions.length > 0
    ? `Maintained ${sessions.length} structured study blocks with dedicated focus, covering ${sessions.map(s => s.subjectName).join(', ')}.`
    : `Showed up and reviewed your daily commitments with calm clarity.`;
  if (activity?.gymToday) {
    whatWentWell += ` Consistency in the gym will pay dividends in cognitive stamina.`;
  }

  let opportunityToImprove = '';
  if (totalStudyMins < targetStudyMins) {
    const diff = targetStudyMins - totalStudyMins;
    opportunityToImprove = `You fell ${diff} minutes short of your aspirational target. Consider scheduling 45-minute buffer sessions in the afternoon.`;
  } else if (!sleep || sleep.actualSleepMinutes < (user.dailySleepTargetHours * 60)) {
    opportunityToImprove = `Sleep duration was under your ${user.dailySleepTargetHours}h target. Aim for lights-out 20 minutes earlier tonight.`;
  } else {
    opportunityToImprove = `Pace yourself during intensive revision blocks to avoid mental fatigue.`;
  }

  let studyInsights = `Target: ${Math.floor(targetStudyMins / 60)}h | Actual: ${Math.floor(totalStudyMins / 60)}h ${totalStudyMins % 60}m. `;
  const totalQuestions = sessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  if (totalQuestions > 0) {
    const totalCorrect = sessions.reduce((acc, s) => acc + (s.questionsCorrect || 0), 0);
    studyInsights += `Attempted ${totalQuestions} practice questions with a ${Math.round((totalCorrect / totalQuestions) * 100)}% accuracy rate.`;
  } else {
    studyInsights += `No direct question counters logged for today's theory sessions.`;
  }

  let routineAndRecovery = '';
  if (sleep) {
    routineAndRecovery = `Logged ${Math.floor(sleep.actualSleepMinutes / 60)}h ${sleep.actualSleepMinutes % 60}m of sleep with quality rated ${sleep.sleepQualityRating}/5.`;
  } else {
    routineAndRecovery = `Sleep log not recorded for last night. Don't forget to log your bedtime in Sleep & Recovery.`;
  }
  if (activity?.playedGamesToday) {
    const diffGaming = activity.gamingDurationMinutes - (user.dailyGamingLimitMinutes || 60);
    if (diffGaming > 0) {
      routineAndRecovery += ` Gaming time exceeded personal benchmark by ${diffGaming}m; gentle reminder to unwind with offline hobbies.`;
    } else {
      routineAndRecovery += ` Gaming was well balanced within your ${user.dailyGamingLimitMinutes}m limit.`;
    }
  }

  const actionPlan = [
    `Lock in tomorrow's most challenging subject during your peak morning window.`,
    activity?.gymToday ? `Schedule active recovery and hydration for tomorrow.` : `Plan a 20-30 minute workout or brisk walk.`,
    `Protect your ${user.wakeTime} wake-up target by starting your wind-down routine 45 minutes prior.`
  ];

  const encouragement = `Progress is compounding, ${user.name.split(' ')[0]}. Consistency beats sporadic intensity every single time!`;

  return {
    id: `ai-calc-${Date.now()}`,
    userId: user.id,
    date,
    overview,
    whatWentWell,
    opportunityToImprove,
    studyInsights,
    routineAndRecovery,
    actionPlan,
    encouragement,
    isGeneratedByAI: false,
    createdAt: new Date().toISOString()
  };
}

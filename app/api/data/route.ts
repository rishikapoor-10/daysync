import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { ScheduleEvent, StudySubject, StudySession, DailyActivityLog, SleepRecord, DailyReflection, UserProfile } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const db = readDB();

  if (userId) {
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const partner = db.users.find(u => u.id !== user.id) || db.users[1];

    // Return all events (both lanes editable as requested)
    return NextResponse.json({
      currentUser: user,
      partnerUser: partner,
      allUsers: db.users,
      events: db.events || [],
      // Return all subjects so the user can filter or assign for Rishi or Dhruvi
      allSubjects: db.subjects || [],
      subjects: (db.subjects || []).filter(s => s.userId === user.id),
      allStudySessions: db.studySessions || [],
      studySessions: (db.studySessions || []).filter(s => s.userId === user.id),
      activityLogs: (db.activityLogs || []).filter(a => a.userId === user.id),
      sleepRecords: (db.sleepRecords || []).filter(s => s.userId === user.id),
      reflections: (db.reflections || []).filter(r => r.userId === user.id),
      aiReviews: (db.aiReviews || []).filter(ai => ai.userId === user.id),
      partnerProgress: {
        user: partner,
        activity: (db.activityLogs || []).find(a => a.userId === partner?.id),
        sleep: (db.sleepRecords || []).find(s => s.userId === partner?.id),
        todayStudyMinutes: (db.studySessions || [])
          .filter(s => s.userId === partner?.id)
          .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0)
      }
    });
  }

  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload, userId } = body;
    const db = readDB();

    switch (action) {
      case 'SAVE_EVENT': {
        const event = payload as ScheduleEvent;
        const targetUserId = event.userId || userId;
        const eventWithUser = { ...event, userId: targetUserId, id: event.id || `ev-${Date.now()}` };
        const existingIdx = db.events.findIndex(e => e.id === eventWithUser.id);
        if (existingIdx >= 0) {
          db.events[existingIdx] = eventWithUser;
        } else {
          db.events.push(eventWithUser);
        }
        break;
      }

      case 'DELETE_EVENT': {
        const { eventId } = payload;
        db.events = db.events.filter(e => e.id !== eventId);
        break;
      }

      case 'SAVE_SUBJECT': {
        const subject = payload as StudySubject;
        const targetUserId = subject.userId || userId;
        const subjectWithUser = { ...subject, userId: targetUserId, id: subject.id || `sub-${Date.now()}` };
        const sIdx = db.subjects.findIndex(s => s.id === subjectWithUser.id);
        if (sIdx >= 0) {
          db.subjects[sIdx] = subjectWithUser;
        } else {
          db.subjects.push(subjectWithUser);
        }
        break;
      }

      case 'DELETE_SUBJECT': {
        const { subjectId } = payload;
        db.subjects = db.subjects.filter(s => s.id !== subjectId);
        break;
      }

      case 'LOG_STUDY_SESSION': {
        const session = payload as StudySession;
        const targetUserId = session.userId || userId;
        const newSession: StudySession = {
          ...session,
          userId: targetUserId,
          id: `sess-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        db.studySessions.push(newSession);

        // Update subject status if found
        const subject = db.subjects.find(s => s.id === session.subjectId);
        if (subject) {
          const totalLoggedForSubject = db.studySessions
            .filter(s => s.subjectId === subject.id && s.date === session.date)
            .reduce((acc, curr) => acc + curr.durationMinutes, 0);
          if (totalLoggedForSubject >= subject.targetMinutesToday) {
            subject.status = 'completed';
          } else if (totalLoggedForSubject > 0) {
            subject.status = 'partially';
          }
        }
        break;
      }

      case 'SAVE_ACTIVITY_LOG': {
        const log = payload as DailyActivityLog;
        const targetUserId = log.userId || userId;
        const logIdx = db.activityLogs.findIndex(a => a.userId === targetUserId && a.date === log.date);
        if (logIdx >= 0) {
          db.activityLogs[logIdx] = { ...db.activityLogs[logIdx], ...log, userId: targetUserId };
        } else {
          db.activityLogs.push({ ...log, userId: targetUserId, id: `act-${Date.now()}` });
        }
        break;
      }

      case 'SAVE_SLEEP_RECORD': {
        const sleep = payload as SleepRecord;
        const targetUserId = sleep.userId || userId;
        const slpIdx = db.sleepRecords.findIndex(s => s.userId === targetUserId && s.date === sleep.date);
        if (slpIdx >= 0) {
          db.sleepRecords[slpIdx] = { ...db.sleepRecords[slpIdx], ...sleep, userId: targetUserId };
        } else {
          db.sleepRecords.push({ ...sleep, userId: targetUserId, id: `slp-${Date.now()}` });
        }
        break;
      }

      case 'SAVE_REFLECTION': {
        const reflection = payload as DailyReflection;
        const targetUserId = reflection.userId || userId;
        const refIdx = db.reflections.findIndex(r => r.userId === targetUserId && r.date === reflection.date);
        if (refIdx >= 0) {
          db.reflections[refIdx] = { ...reflection, userId: targetUserId, updatedAt: new Date().toISOString() };
        } else {
          db.reflections.push({ ...reflection, userId: targetUserId, id: `refl-${Date.now()}`, updatedAt: new Date().toISOString() });
        }
        break;
      }

      case 'UPDATE_PROFILE': {
        const profile = payload as Partial<UserProfile>;
        const targetUserId = payload.id || userId;
        const pIdx = db.users.findIndex(u => u.id === targetUserId);
        if (pIdx >= 0) {
          db.users[pIdx] = { ...db.users[pIdx], ...profile };
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    writeDB(db);
    return NextResponse.json({ success: true, db });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

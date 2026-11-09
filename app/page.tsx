'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TodayDashboard from '@/components/TodayDashboard';
import ScheduleView from '@/components/ScheduleView';
import StudyTracker from '@/components/StudyTracker';
import FitnessGaming from '@/components/FitnessGaming';
import SleepRecovery from '@/components/SleepRecovery';
import AIDailyCoach from '@/components/AIDailyCoach';
import SharedDashboard from '@/components/SharedDashboard';
import WeeklyInsights from '@/components/WeeklyInsights';
import SettingsView from '@/components/SettingsView';
import { UserProfile, ScheduleEvent, StudySubject, StudySession, DailyActivityLog, SleepRecord, DailyReflection, AIDailyReview } from '@/lib/types';

const STORAGE_KEY = 'daysync_client_state_v2';

export default function Home() {
  const [activeTab, setActiveTab] = useState('today');
  const [currentUserId, setCurrentUserId] = useState('user_rishi');
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // App state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserProfile | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [allSubjects, setAllSubjects] = useState<StudySubject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [allStudySessions, setAllStudySessions] = useState<StudySession[]>([]);
  const [activityLogs, setActivityLogs] = useState<DailyActivityLog[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [aiReviews, setAiReviews] = useState<AIDailyReview[]>([]);
  const [partnerProgress, setPartnerProgress] = useState<any>(null);

  // Save state to localStorage for persistence across Vercel serverless cold starts
  const saveToLocalBackup = (state: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      // Ignore quota errors
    }
  };

  const loadFromLocalBackup = () => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      // Ignore
    }
    return null;
  };

  // Compute partner progress derived from current state
  const computePartnerProgress = (partner: UserProfile | undefined, logs: DailyActivityLog[], sleeps: SleepRecord[], sessions: StudySession[]) => {
    if (!partner) return null;
    return {
      user: partner,
      activity: logs.find(a => a.userId === partner.id),
      sleep: sleeps.find(s => s.userId === partner.id),
      todayStudyMinutes: sessions
        .filter(s => s.userId === partner.id)
        .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0)
    };
  };

  // Fetch data
  const fetchData = async (userId = currentUserId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/data?userId=${userId}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const user = data.currentUser;
      const partner = data.partnerUser;
      const evs = data.events || [];
      const allSubs = data.allSubjects || [];
      const userSubs = data.subjects || allSubs.filter((s: any) => s.userId === userId);
      const allSess = data.allStudySessions || [];
      const userSess = data.studySessions || allSess.filter((s: any) => s.userId === userId);
      const acts = data.activityLogs || [];
      const sleeps = data.sleepRecords || [];
      const refs = data.reflections || [];
      const reviews = data.aiReviews || [];

      // Check if localStorage has newer changes (helpful on Vercel ephemeral lambdas)
      const local = loadFromLocalBackup();
      if (local && local.updatedAt) {
        // Merge events
        const mergedEvents = [...evs];
        if (Array.isArray(local.events)) {
          local.events.forEach((le: ScheduleEvent) => {
            const idx = mergedEvents.findIndex(e => e.id === le.id);
            if (idx >= 0) mergedEvents[idx] = le;
            else mergedEvents.push(le);
          });
        }
        setEvents(mergedEvents);

        // Merge subjects
        const mergedSubs = [...allSubs];
        if (Array.isArray(local.allSubjects)) {
          local.allSubjects.forEach((ls: StudySubject) => {
            const idx = mergedSubs.findIndex(s => s.id === ls.id);
            if (idx >= 0) mergedSubs[idx] = ls;
            else mergedSubs.push(ls);
          });
        }
        setAllSubjects(mergedSubs);
        setSubjects(mergedSubs.filter((s: any) => s.userId === userId));

        // Merge sessions
        const mergedSess = [...allSess];
        if (Array.isArray(local.allStudySessions)) {
          local.allStudySessions.forEach((ls: StudySession) => {
            const idx = mergedSess.findIndex(s => s.id === ls.id);
            if (idx >= 0) mergedSess[idx] = ls;
            else mergedSess.push(ls);
          });
        }
        setAllStudySessions(mergedSess);
        setStudySessions(mergedSess.filter((s: any) => s.userId === userId));

        // Activity, Sleep, Reflection
        const mergedActs = Array.isArray(local.activityLogs) && local.activityLogs.length > acts.length ? local.activityLogs : acts;
        const mergedSleeps = Array.isArray(local.sleepRecords) && local.sleepRecords.length > sleeps.length ? local.sleepRecords : sleeps;
        const mergedRefs = Array.isArray(local.reflections) && local.reflections.length > refs.length ? local.reflections : refs;
        const mergedReviews = Array.isArray(local.aiReviews) && local.aiReviews.length > reviews.length ? local.aiReviews : reviews;

        setActivityLogs(mergedActs);
        setSleepRecords(mergedSleeps);
        setReflections(mergedRefs);
        setAiReviews(mergedReviews);

        setCurrentUser(user);
        setPartnerUser(partner);
        setAllUsers(data.allUsers || []);
        setPartnerProgress(computePartnerProgress(partner, mergedActs, mergedSleeps, mergedSess));
      } else {
        setCurrentUser(user);
        setPartnerUser(partner);
        setAllUsers(data.allUsers || []);
        setEvents(evs);
        setAllSubjects(allSubs);
        setSubjects(userSubs);
        setAllStudySessions(allSess);
        setStudySessions(userSess);
        setActivityLogs(acts);
        setSleepRecords(sleeps);
        setReflections(refs);
        setAiReviews(reviews);
        setPartnerProgress(data.partnerProgress || computePartnerProgress(partner, acts, sleeps, allSess));
      }
    } catch (err) {
      console.warn('API fetch warning, checking local backup:', err);
      const local = loadFromLocalBackup();
      if (local) {
        setEvents(local.events || []);
        setAllSubjects(local.allSubjects || []);
        setSubjects((local.allSubjects || []).filter((s: any) => s.userId === userId));
        setAllStudySessions(local.allStudySessions || []);
        setStudySessions((local.allStudySessions || []).filter((s: any) => s.userId === userId));
        setActivityLogs(local.activityLogs || []);
        setSleepRecords(local.sleepRecords || []);
        setReflections(local.reflections || []);
        setAiReviews(local.aiReviews || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentUserId);
  }, [currentUserId]);

  const handleSwitchUser = (newUserId: string) => {
    setCurrentUserId(newUserId);
  };

  // Mutators with robust optimistic UI & local backup
  const handleSaveEvent = async (event: ScheduleEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      let updated: ScheduleEvent[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = event;
      } else {
        updated = [...prev, event];
      }
      saveToLocalBackup({ events: updated, allSubjects, allStudySessions, activityLogs, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_EVENT', payload: event, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend save notice (persisted in local state):', e);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== eventId);
      saveToLocalBackup({ events: updated, allSubjects, allStudySessions, activityLogs, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_EVENT', payload: { eventId }, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend delete notice:', e);
    }
  };

  const handleSaveSubject = async (subject: StudySubject) => {
    setAllSubjects(prev => {
      const idx = prev.findIndex(s => s.id === subject.id);
      let updated: StudySubject[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = subject;
      } else {
        updated = [...prev, subject];
      }
      setSubjects(updated.filter(s => s.userId === currentUserId));
      saveToLocalBackup({ events, allSubjects: updated, allStudySessions, activityLogs, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_SUBJECT', payload: subject, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend save subject notice:', e);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    setAllSubjects(prev => {
      const updated = prev.filter(s => s.id !== subjectId);
      setSubjects(updated.filter(s => s.userId === currentUserId));
      saveToLocalBackup({ events, allSubjects: updated, allStudySessions, activityLogs, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_SUBJECT', payload: { subjectId }, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend delete subject notice:', e);
    }
  };

  const handleLogSession = async (session: StudySession) => {
    setAllStudySessions(prev => {
      const updated = [session, ...prev];
      setStudySessions(updated.filter(s => s.userId === currentUserId));
      saveToLocalBackup({ events, allSubjects, allStudySessions: updated, activityLogs, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOG_STUDY_SESSION', payload: session, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend log session notice:', e);
    }
  };

  const handleQuickAddSession = (subjectId: string, durationMinutes: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sub = allSubjects.find(s => s.id === subjectId);
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      userId: sub?.userId || currentUserId,
      subjectId,
      subjectName: sub?.name || 'Self-Study',
      date: todayStr,
      durationMinutes,
      concentrationRating: 4,
      createdAt: new Date().toISOString()
    };
    handleLogSession(newSession);
  };

  const handleUpdateActivity = async (updates: Partial<DailyActivityLog>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = activityLogs.find(a => a.date === todayStr);
    const updatedRecord = {
      ...(existing || {
        id: `act-${Date.now()}`,
        userId: currentUserId,
        date: todayStr,
        gymToday: false,
        activityToday: false,
        playedGamesToday: false,
        gamingDurationMinutes: 0
      }),
      ...updates
    };

    setActivityLogs(prev => {
      const idx = prev.findIndex(a => a.date === todayStr);
      let updatedList: DailyActivityLog[];
      if (idx >= 0) {
        updatedList = [...prev];
        updatedList[idx] = updatedRecord;
      } else {
        updatedList = [...prev, updatedRecord];
      }
      saveToLocalBackup({ events, allSubjects, allStudySessions, activityLogs: updatedList, sleepRecords, reflections, aiReviews, updatedAt: Date.now() });
      return updatedList;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_ACTIVITY_LOG', payload: updatedRecord, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend activity notice:', e);
    }
  };

  const handleSaveSleep = async (record: SleepRecord) => {
    setSleepRecords(prev => {
      const idx = prev.findIndex(s => s.date === record.date);
      let updated: SleepRecord[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = record;
      } else {
        updated = [...prev, record];
      }
      saveToLocalBackup({ events, allSubjects, allStudySessions, activityLogs, sleepRecords: updated, reflections, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_SLEEP_RECORD', payload: record, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend sleep record notice:', e);
    }
  };

  const handleSaveReflection = async (reflection: DailyReflection) => {
    setReflections(prev => {
      const idx = prev.findIndex(r => r.date === reflection.date);
      let updated: DailyReflection[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = reflection;
      } else {
        updated = [...prev, reflection];
      }
      saveToLocalBackup({ events, allSubjects, allStudySessions, activityLogs, sleepRecords, reflections: updated, aiReviews, updatedAt: Date.now() });
      return updated;
    });

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_REFLECTION', payload: reflection, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend reflection notice:', e);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
    }
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_PROFILE', payload: updates, userId: currentUserId })
      });
    } catch (e) {
      console.warn('Backend profile update notice:', e);
    }
  };

  const handleGenerateAIReview = async () => {
    try {
      setIsGeneratingAI(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, date: todayStr })
      });
      const data = await res.json();
      if (data.review) {
        setAiReviews(prev => {
          const filtered = prev.filter(r => r.date !== todayStr);
          const updated = [data.review, ...filtered];
          saveToLocalBackup({ events, allSubjects, allStudySessions, activityLogs, sleepRecords, reflections, aiReviews: updated, updatedAt: Date.now() });
          return updated;
        });
      }
    } catch (err) {
      console.error('Error generating AI review:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Loading DaySync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* Sidebar */}
      {currentUser && (
        <Sidebar
          currentTab={activeTab}
          setCurrentTab={setActiveTab}
          currentUser={currentUser}
          partnerUser={partnerUser}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {currentUser && activeTab === 'today' && (
          <TodayDashboard
            currentUser={currentUser}
            partnerUser={partnerUser}
            events={events}
            subjects={subjects}
            studySessions={studySessions}
            activityLogs={activityLogs}
            sleepRecords={sleepRecords}
            reflections={reflections}
            aiReviews={aiReviews}
            partnerProgress={partnerProgress}
            onNavigate={setActiveTab}
            onUpdateActivity={handleUpdateActivity}
            onQuickAddSession={handleQuickAddSession}
          />
        )}

        {currentUser && activeTab === 'schedule' && (
          <ScheduleView
            currentUser={currentUser}
            partnerUser={partnerUser}
            events={events}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {currentUser && activeTab === 'study' && (
          <StudyTracker
            currentUser={currentUser}
            partnerUser={partnerUser}
            subjects={subjects}
            allSubjects={allSubjects}
            studySessions={studySessions}
            allStudySessions={allStudySessions}
            onSaveSubject={handleSaveSubject}
            onDeleteSubject={handleDeleteSubject}
            onLogSession={handleLogSession}
          />
        )}

        {currentUser && activeTab === 'fitness' && (
          <FitnessGaming
            currentUser={currentUser}
            activityLogs={activityLogs}
            onUpdateActivity={handleUpdateActivity}
          />
        )}

        {currentUser && activeTab === 'sleep' && (
          <SleepRecovery
            currentUser={currentUser}
            sleepRecords={sleepRecords}
            reflections={reflections}
            onSaveSleep={handleSaveSleep}
            onSaveReflection={handleSaveReflection}
          />
        )}

        {currentUser && activeTab === 'ai-review' && (
          <AIDailyCoach
            currentUser={currentUser}
            aiReviews={aiReviews}
            onGenerateReview={handleGenerateAIReview}
            isGenerating={isGeneratingAI}
          />
        )}

        {currentUser && activeTab === 'weekly' && (
          <WeeklyInsights
            currentUser={currentUser}
            studySessions={studySessions}
            activityLogs={activityLogs}
            sleepRecords={sleepRecords}
          />
        )}

        {currentUser && activeTab === 'shared' && (
          <SharedDashboard
            currentUser={currentUser}
            partnerUser={partnerUser}
            myStudySessions={studySessions}
            partnerProgress={partnerProgress}
            allEvents={events}
          />
        )}

        {currentUser && activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>
    </div>
  );
}

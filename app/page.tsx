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

export default function Home() {
  const [activeTab, setActiveTab] = useState('today');
  const [currentUserId, setCurrentUserId] = useState('user_rishi');
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // App state from backend
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserProfile | undefined>(undefined);
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

  // Fetch data
  const fetchData = async (userId = currentUserId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/data?userId=${userId}`);
      const data = await res.json();
      setCurrentUser(data.currentUser);
      setPartnerUser(data.partnerUser);
      setEvents(data.events || []);
      setSubjects(data.subjects || []);
      setAllSubjects(data.allSubjects || []);
      setStudySessions(data.studySessions || []);
      setAllStudySessions(data.allStudySessions || []);
      setActivityLogs(data.activityLogs || []);
      setSleepRecords(data.sleepRecords || []);
      setReflections(data.reflections || []);
      setAiReviews(data.aiReviews || []);
      setPartnerProgress(data.partnerProgress || null);
    } catch (err) {
      console.error('Failed to fetch DaySync data:', err);
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

  // Mutators
  const handleSaveEvent = async (event: ScheduleEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = event;
        return copy;
      }
      return [...prev, event];
    });

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_EVENT', payload: event, userId: currentUserId })
    });
    fetchData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_EVENT', payload: { eventId }, userId: currentUserId })
    });
    fetchData();
  };

  const handleSaveSubject = async (subject: StudySubject) => {
    setAllSubjects(prev => {
      const idx = prev.findIndex(s => s.id === subject.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = subject;
        return copy;
      }
      return [...prev, subject];
    });

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_SUBJECT', payload: subject, userId: currentUserId })
    });
    fetchData();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    setAllSubjects(prev => prev.filter(s => s.id !== subjectId));
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_SUBJECT', payload: { subjectId }, userId: currentUserId })
    });
    fetchData();
  };

  const handleLogSession = async (session: StudySession) => {
    setAllStudySessions(prev => [session, ...prev]);
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'LOG_STUDY_SESSION', payload: session, userId: currentUserId })
    });
    fetchData();
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
    const updated = {
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
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_ACTIVITY_LOG', payload: updated, userId: currentUserId })
    });
  };

  const handleSaveSleep = async (record: SleepRecord) => {
    setSleepRecords(prev => {
      const idx = prev.findIndex(s => s.date === record.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_SLEEP_RECORD', payload: record, userId: currentUserId })
    });
    fetchData();
  };

  const handleSaveReflection = async (reflection: DailyReflection) => {
    setReflections(prev => {
      const idx = prev.findIndex(r => r.date === reflection.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = reflection;
        return copy;
      }
      return [...prev, reflection];
    });

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_REFLECTION', payload: reflection, userId: currentUserId })
    });
    fetchData();
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_PROFILE', payload: updates, userId: currentUserId })
    });
    fetchData();
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
          return [data.review, ...filtered];
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

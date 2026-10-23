'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Dumbbell, 
  Gamepad2, 
  Moon, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { UserProfile, ScheduleEvent, StudySubject, StudySession, DailyActivityLog, SleepRecord, DailyReflection, AIDailyReview } from '@/lib/types';

interface TodayDashboardProps {
  currentUser: UserProfile;
  partnerUser?: UserProfile;
  events: ScheduleEvent[];
  subjects: StudySubject[];
  studySessions: StudySession[];
  activityLogs: DailyActivityLog[];
  sleepRecords: SleepRecord[];
  reflections: DailyReflection[];
  aiReviews: AIDailyReview[];
  partnerProgress: any;
  onNavigate: (tab: string) => void;
  onUpdateActivity: (updates: Partial<DailyActivityLog>) => void;
  onQuickAddSession: (subjectId: string, durationMinutes: number) => void;
}

export default function TodayDashboard({
  currentUser,
  partnerUser,
  events,
  subjects,
  studySessions,
  activityLogs,
  sleepRecords,
  reflections,
  aiReviews,
  partnerProgress,
  onNavigate,
  onUpdateActivity,
  onQuickAddSession
}: TodayDashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const todayActivity = activityLogs.find(a => a.date === todayStr) || {
    id: 'temp',
    userId: currentUser.id,
    date: todayStr,
    gymToday: false,
    activityToday: false,
    playedGamesToday: false,
    gamingDurationMinutes: 0
  };

  const todaySleep = sleepRecords.find(s => s.date === todayStr);
  const todayReflection = reflections.find(r => r.date === todayStr);
  const latestAIReview = aiReviews.find(r => r.date === todayStr);

  // Calculate study stats
  const totalStudyMinutesToday = studySessions
    .filter(s => s.date === todayStr)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const targetMinutes = currentUser.dailyStudyTargetMinutes || 240;
  const studyProgressPct = Math.min(100, Math.round((totalStudyMinutesToday / targetMinutes) * 100));

  // Today events sorted
  const myTodayEvents = events
    .filter(e => e.userId === currentUser.id && (e.date === todayStr || e.recurring === 'daily' || (e.recurring === 'weekdays' && [1,2,3,4,5].includes(new Date().getDay()))))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const [quickMinutes, setQuickMinutes] = useState(30);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Greeting & Top Banner */}
      <div className="bg-gradient-to-r from-amber-50/70 via-stone-50 to-orange-50/40 p-6 rounded-2xl border border-amber-200/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700/80 mb-1">
            {currentDateFormatted}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Good day, {currentUser.name.split(' ')[0]} {currentUser.avatar}
          </h2>
          <p className="text-stone-600 text-sm mt-0.5">
            Focus on sustainable consistency today. Every focused hour compounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai-review')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-amber-900 border border-amber-200/80 rounded-xl text-sm font-medium hover:bg-amber-50/80 shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Daily Review</span>
          </button>
          <button
            onClick={() => onNavigate('study')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 shadow-sm transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Study Timer</span>
          </button>
        </div>
      </div>

      {/* 5-Question Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Study Progress */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Study Progress</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">
                {Math.floor(totalStudyMinutesToday / 60)}h {totalStudyMinutesToday % 60}m
              </span>
              <span className="text-xs text-stone-500">
                / {Math.floor(targetMinutes / 60)}h target
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${studyProgressPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>{studyProgressPct}% of goal</span>
            <button onClick={() => onNavigate('study')} className="text-amber-700 font-medium hover:underline flex items-center gap-0.5">
              Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Physical Fitness & Gym */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Fitness & Gym</span>
              <Dumbbell className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={todayActivity.gymToday}
                  onChange={(e) => onUpdateActivity({ gymToday: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <span>Went to Gym</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={todayActivity.activityToday}
                  onChange={(e) => onUpdateActivity({ activityToday: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <span>Other Physical Activity</span>
              </label>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>{todayActivity.gymToday ? 'Gym complete 💪' : 'Not marked yet'}</span>
            <button onClick={() => onNavigate('fitness')} className="text-emerald-700 font-medium hover:underline">
              Details
            </button>
          </div>
        </div>

        {/* Gaming & Recreation */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gaming / Leisure</span>
              <Gamepad2 className="w-4 h-4 text-indigo-600" />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 mb-2">
              <input
                type="checkbox"
                checked={todayActivity.playedGamesToday}
                onChange={(e) => onUpdateActivity({ playedGamesToday: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
              />
              <span>Played Games Today</span>
            </label>
            {todayActivity.playedGamesToday && (
              <div className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                Logged: {todayActivity.gamingDurationMinutes || 0}m (Limit: {currentUser.dailyGamingLimitMinutes}m)
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Recreation tracker</span>
            <button onClick={() => onNavigate('fitness')} className="text-indigo-700 font-medium hover:underline">
              Adjust
            </button>
          </div>
        </div>

        {/* Sleep & Recovery */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Sleep & Recovery</span>
              <Moon className="w-4 h-4 text-purple-600" />
            </div>
            {todaySleep ? (
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {Math.floor(todaySleep.actualSleepMinutes / 60)}h {todaySleep.actualSleepMinutes % 60}m
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Quality: {todaySleep.sleepQualityRating}/5 • Energy: {todaySleep.morningEnergyRating}/5
                </div>
              </div>
            ) : (
              <div className="text-sm text-stone-500">
                No sleep recorded for last night.
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
            <span>Target: {currentUser.dailySleepTargetHours}h</span>
            <button onClick={() => onNavigate('sleep')} className="text-purple-700 font-medium hover:underline">
              {todaySleep ? 'Edit' : 'Log Sleep'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Schedule & Study Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Timeline & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Today's Schedule & Timeline</h3>
              </div>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
              >
                View 2-Lane Calendar
              </button>
            </div>

            {myTodayEvents.length === 0 ? (
              <div className="text-center py-8 text-stone-400 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                <p className="text-sm">No scheduled events planned for today yet.</p>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="mt-2 text-xs font-semibold text-amber-700 hover:underline inline-block"
                >
                  + Add Event
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myTodayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/60 hover:bg-white hover:border-stone-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{ev.title}</h4>
                        <span className="text-[11px] text-stone-500">{ev.category}</span>
                      </div>
                    </div>
                    <span className="text-xs text-stone-400 font-medium">
                      {ev.visibility === 'busy-only' ? '🔒 Busy-only' : '👥 Shared'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject-Wise Targets and Quick Session Add */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Today's Subject Focus</h3>
              </div>
              <button
                onClick={() => onNavigate('study')}
                className="text-xs font-medium text-amber-700 hover:underline"
              >
                Manage Subjects
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              {subjects.map((sub) => {
                const loggedForSub = studySessions
                  .filter(s => s.subjectId === sub.id && s.date === todayStr)
                  .reduce((acc, curr) => acc + curr.durationMinutes, 0);
                const subPct = sub.targetMinutesToday > 0 
                  ? Math.min(100, Math.round((loggedForSub / sub.targetMinutesToday) * 100))
                  : 0;

                return (
                  <div key={sub.id} className="p-3.5 rounded-xl border border-stone-200/70 bg-stone-50/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                        {sub.name}
                      </span>
                      <span className="text-xs font-medium text-stone-500">
                        {loggedForSub}m / {sub.targetMinutesToday}m
                      </span>
                    </div>
                    {sub.topicToday && (
                      <p className="text-xs text-stone-500 mb-2 truncate">Topic: {sub.topicToday}</p>
                    )}
                    <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${subPct}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Session Logger */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-900">Quick-log study time:</span>
                <select
                  aria-label="Select Subject"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="text-xs bg-white border border-stone-200 rounded-lg p-1.5 font-medium text-slate-700"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  aria-label="Select Duration"
                  value={quickMinutes}
                  onChange={(e) => setQuickMinutes(Number(e.target.value))}
                  className="text-xs bg-white border border-stone-200 rounded-lg p-1.5 font-medium text-slate-700"
                >
                  <option value={15}>+15 min</option>
                  <option value={30}>+30 min</option>
                  <option value={45}>+45 min</option>
                  <option value={60}>+60 min</option>
                  <option value={90}>+90 min</option>
                </select>
              </div>
              <button
                onClick={() => selectedSubjectId && onQuickAddSession(selectedSubjectId, quickMinutes)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs"
              >
                + Add Session
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Shared Partner Snippet & AI Coach Card */}
        <div className="space-y-6">
          {/* Shared Partner Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Shared Partner Progress</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Sync Active</span>
            </div>

            {partnerUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl border border-stone-200">
                    {partnerUser.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{partnerUser.name}</h4>
                    <p className="text-xs text-stone-500">{partnerUser.exam}</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Study Completed Today:</span>
                    <span className="font-semibold text-slate-800">
                      {Math.floor((partnerProgress?.todayStudyMinutes || 0) / 60)}h {(partnerProgress?.todayStudyMinutes || 0) % 60}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Gym / Workout:</span>
                    <span className="font-semibold text-slate-800">
                      {partnerProgress?.activity?.gymToday ? 'Completed ✅' : 'Rest / Pending'}
                    </span>
                  </div>
                  {partnerProgress?.sleep && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Sleep:</span>
                      <span className="font-semibold text-slate-800">
                        {Math.floor(partnerProgress.sleep.actualSleepMinutes / 60)}h {partnerProgress.sleep.actualSleepMinutes % 60}m
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('shared')}
                  className="w-full text-center py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/70 rounded-xl transition-all"
                >
                  Open Full Shared Dashboard →
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-500">No partner paired yet.</p>
            )}
          </div>

          {/* AI Coach Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-50/50 to-stone-50 p-5 rounded-2xl border border-amber-200/70 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-sm text-slate-800">AI Daily Coach Advice</h4>
            </div>

            {latestAIReview ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                  "{latestAIReview.overview}"
                </p>
                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/50 text-xs text-amber-900">
                  <span className="font-semibold">Action: </span>
                  {latestAIReview.actionPlan[0] || 'Keep consistent with your evening wind-down routine.'}
                </div>
                <button
                  onClick={() => onNavigate('ai-review')}
                  className="text-xs text-amber-700 font-semibold hover:underline block pt-1"
                >
                  View Full Daily Review →
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  Log your activities, study blocks, and evening reflection to generate your personalized AI daily review.
                </p>
                <button
                  onClick={() => onNavigate('ai-review')}
                  className="w-full py-2 bg-white text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold hover:bg-amber-50 transition-all"
                >
                  Generate Daily Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

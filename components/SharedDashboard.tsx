'use client';

import React from 'react';
import { Users, Award, BookOpen, Dumbbell, Moon, CheckCircle2 } from 'lucide-react';
import { UserProfile, DailyActivityLog, SleepRecord } from '@/lib/types';

interface SharedDashboardProps {
  currentUser: UserProfile;
  partnerUser?: UserProfile;
  myStudySessions: any[];
  partnerProgress: any;
  allEvents: any[];
}

export default function SharedDashboard({
  currentUser,
  partnerUser,
  myStudySessions,
  partnerProgress,
  allEvents
}: SharedDashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const myTodayStudyMinutes = myStudySessions
    .filter(s => s.date === todayStr)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  const partnerTodayStudyMinutes = partnerProgress?.todayStudyMinutes || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          Two-Person Shared Space
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          A supportive, non-intrusive accountability feed. Celebrate consistency and mutual progress together.
        </p>
      </div>

      {/* Side-by-Side Comparison (Encouragement-based, no toxic ranking) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User 1 Card (Current) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <span className="text-3xl">{currentUser.avatar}</span>
            <div>
              <h3 className="font-bold text-base text-slate-800">{currentUser.name} (You)</h3>
              <p className="text-xs text-stone-500">{currentUser.exam}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" /> Study Completed Today:
              </span>
              <span className="font-bold text-slate-800">
                {Math.floor(myTodayStudyMinutes / 60)}h {myTodayStudyMinutes % 60}m
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600" /> Physical Fitness:
              </span>
              <span className="font-bold text-slate-800">
                Active & Tracked
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-purple-600" /> Sleep Goal:
              </span>
              <span className="font-bold text-slate-800">
                {currentUser.dailySleepTargetHours}h Target
              </span>
            </div>
          </div>
        </div>

        {/* User 2 Card (Partner) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
            <span className="text-3xl">{partnerUser?.avatar || '👤'}</span>
            <div>
              <h3 className="font-bold text-base text-slate-800">{partnerUser?.name || 'Partner'}</h3>
              <p className="text-xs text-stone-500">{partnerUser?.exam || 'Study Aspirant'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" /> Study Completed Today:
              </span>
              <span className="font-bold text-slate-800">
                {Math.floor(partnerTodayStudyMinutes / 60)}h {partnerTodayStudyMinutes % 60}m
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600" /> Physical Fitness:
              </span>
              <span className="font-bold text-slate-800">
                {partnerProgress?.activity?.gymToday ? 'Gym Completed 💪' : partnerProgress?.activity?.activityToday ? 'Active 🏃' : 'Resting'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-purple-600" /> Sleep Logged:
              </span>
              <span className="font-bold text-slate-800">
                {partnerProgress?.sleep ? `${Math.floor(partnerProgress.sleep.actualSleepMinutes / 60)}h ${partnerProgress.sleep.actualSleepMinutes % 60}m` : 'Pending log'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Milestones & Encouragement */}
      <div className="p-5 bg-gradient-to-r from-amber-50 via-stone-50 to-orange-50 rounded-2xl border border-amber-200/80 flex items-center gap-3">
        <Award className="w-6 h-6 text-amber-600 shrink-0" />
        <div className="text-xs text-slate-700">
          <p className="font-semibold text-slate-800">Collective Focus Streak:</p>
          <p className="mt-0.5">
            Both of you have dedicated over {Math.floor((myTodayStudyMinutes + partnerTodayStudyMinutes) / 60)} hours of deep work together today. High five! 🙌
          </p>
        </div>
      </div>
    </div>
  );
}

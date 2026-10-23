'use client';

import React, { useState } from 'react';
import { Dumbbell, Gamepad2, Flame, Award, AlertCircle, Check } from 'lucide-react';
import { DailyActivityLog, UserProfile } from '@/lib/types';

interface FitnessGamingProps {
  currentUser: UserProfile;
  activityLogs: DailyActivityLog[];
  onUpdateActivity: (updates: Partial<DailyActivityLog>) => void;
}

export default function FitnessGaming({
  currentUser,
  activityLogs,
  onUpdateActivity
}: FitnessGamingProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = activityLogs.find(a => a.date === todayStr) || {
    id: 'temp',
    userId: currentUser.id,
    date: todayStr,
    gymToday: false,
    activityToday: false,
    playedGamesToday: false,
    gamingDurationMinutes: 0
  };

  const [activityType, setActivityType] = useState(todayLog.activityType || 'Cardio & Mobility');
  const [activityDuration, setActivityDuration] = useState(todayLog.activityDurationMinutes || 30);
  const [workoutNotes, setWorkoutNotes] = useState(todayLog.workoutNotes || '');
  const [gamingMins, setGamingMins] = useState(todayLog.gamingDurationMinutes || 0);

  // Calculate Streak & Consistency
  const gymDaysPastWeek = activityLogs.filter(a => a.gymToday).length;
  const activeDaysPastWeek = activityLogs.filter(a => a.gymToday || a.activityToday).length;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateActivity({
      activityType,
      activityDurationMinutes: Number(activityDuration),
      workoutNotes,
      gamingDurationMinutes: Number(gamingMins)
    });
  };

  const gamingLimit = currentUser.dailyGamingLimitMinutes || 60;
  const isOverGamingLimit = todayLog.playedGamesToday && (gamingMins > gamingLimit);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-emerald-600" />
          Fitness, Physical Activity & Gaming Balance
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Instant 1-click tracking. Rest days are healthy and sustainable — zero guilt, pure consistency.
        </p>
      </div>

      {/* Main Checkboxes - Fast Update */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Gym Attendance */}
        <div className={`p-6 rounded-2xl border transition-all ${
          todayLog.gymToday
            ? 'bg-emerald-50/60 border-emerald-300'
            : 'bg-white border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Pillar A</span>
            <Dumbbell className={`w-5 h-5 ${todayLog.gymToday ? 'text-emerald-600' : 'text-stone-400'}`} />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">Gym Attendance</h3>
          <p className="text-xs text-stone-500 mb-4">Strength training, weights, or dedicated gym session.</p>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={todayLog.gymToday}
              onChange={(e) => onUpdateActivity({ gymToday: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
            <span className={`text-sm font-semibold ${todayLog.gymToday ? 'text-emerald-900' : 'text-slate-700'}`}>
              {todayLog.gymToday ? 'Completed today! 💪' : 'Mark as done today'}
            </span>
          </label>
        </div>

        {/* Other Physical Activity */}
        <div className={`p-6 rounded-2xl border transition-all ${
          todayLog.activityToday
            ? 'bg-teal-50/60 border-teal-300'
            : 'bg-white border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">Pillar B</span>
            <Flame className={`w-5 h-5 ${todayLog.activityToday ? 'text-teal-600' : 'text-stone-400'}`} />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">Other Physical Activity</h3>
          <p className="text-xs text-stone-500 mb-4">Running, cycling, yoga, brisk walking, or sports.</p>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={todayLog.activityToday}
              onChange={(e) => onUpdateActivity({ activityToday: e.target.checked })}
              className="w-5 h-5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
            />
            <span className={`text-sm font-semibold ${todayLog.activityToday ? 'text-teal-900' : 'text-slate-700'}`}>
              {todayLog.activityToday ? 'Activity logged 🏃' : 'Mark active today'}
            </span>
          </label>
        </div>

        {/* Gaming & Recreation */}
        <div className={`p-6 rounded-2xl border transition-all ${
          todayLog.playedGamesToday
            ? 'bg-indigo-50/60 border-indigo-300'
            : 'bg-white border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">Pillar C</span>
            <Gamepad2 className={`w-5 h-5 ${todayLog.playedGamesToday ? 'text-indigo-600' : 'text-stone-400'}`} />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">Gaming / Video Games</h3>
          <p className="text-xs text-stone-500 mb-4">Recreation and unwind time. Tracked neutrally.</p>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={todayLog.playedGamesToday}
              onChange={(e) => onUpdateActivity({ playedGamesToday: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded border-stone-300 focus:ring-indigo-500"
            />
            <span className={`text-sm font-semibold ${todayLog.playedGamesToday ? 'text-indigo-900' : 'text-slate-700'}`}>
              {todayLog.playedGamesToday ? 'Played games today 🎮' : 'No games played'}
            </span>
          </label>
        </div>
      </div>

      {/* Gentle Gaming Nudge */}
      {isOverGamingLimit && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold">Gentle balance reminder:</p>
            <p className="mt-0.5">
              You've logged {gamingMins}m of gaming, reaching your planned {gamingLimit}m limit. Would you like to wrap up or extend your limit for today?
            </p>
          </div>
        </div>
      )}

      {/* Optional Detailed Fields Form */}
      <form onSubmit={handleSaveDetails} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b border-stone-100 pb-2">
          Optional Daily Activity Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Type</label>
            <input
              type="text"
              placeholder="e.g. 5k Jog, HIIT, Yoga, Swimming"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exercise Duration (Mins)</label>
            <input
              type="number"
              value={activityDuration}
              onChange={(e) => setActivityDuration(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Gaming Duration (Mins)</label>
            <input
              type="number"
              value={gamingMins}
              onChange={(e) => setGamingMins(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Workout & Energy Notes</label>
          <input
            type="text"
            placeholder="e.g. Felt great on deadlifts, light stretching afterward"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-all"
          >
            Save Activity Details
          </button>
        </div>
      </form>
    </div>
  );
}

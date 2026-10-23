'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface SettingsProps {
  currentUser: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export default function SettingsView({
  currentUser,
  onUpdateProfile
}: SettingsProps) {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [exam, setExam] = useState(currentUser.exam);
  const [wakeTime, setWakeTime] = useState(currentUser.wakeTime);
  const [studyHours, setStudyHours] = useState(Math.round(currentUser.dailyStudyTargetMinutes / 60));
  const [sleepTarget, setSleepTarget] = useState(currentUser.dailySleepTargetHours);
  const [gamingLimit, setGamingLimit] = useState(currentUser.dailyGamingLimitMinutes);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      avatar,
      exam,
      wakeTime,
      dailyStudyTargetMinutes: Number(studyHours) * 60,
      dailySleepTargetHours: Number(sleepTarget),
      dailyGamingLimitMinutes: Number(gamingLimit)
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-600" />
            Preferences & Profile Settings
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Personalize targets, privacy preferences, and accountability limits.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
        {/* Profile Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-stone-100 pb-2">Profile & Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Emoji</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam / Goal</label>
              <input
                type="text"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>
        </div>

        {/* Daily Targets */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-stone-100 pb-2">Daily Lifestyle Targets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Study (Hours/day)</label>
              <input
                type="number"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Sleep (Hours/night)</label>
              <input
                type="number"
                step="0.5"
                value={sleepTarget}
                onChange={(e) => setSleepTarget(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Wake-up Anchor Time</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gaming Limit (Mins/day)</label>
              <input
                type="number"
                value={gamingLimit}
                onChange={(e) => setGamingLimit(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-600 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">Privacy & Space Security:</p>
            <p className="mt-0.5">
              Personal reflections and AI notes are strictly private to your profile unless explicitly toggled to shared. Server-side checks verify space membership before records are delivered.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-600">
              Preferences updated successfully!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

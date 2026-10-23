'use client';

import React, { useState } from 'react';
import { Moon, Sun, BatteryCharging, Sparkles, Lock, Eye, Check } from 'lucide-react';
import { SleepRecord, DailyReflection, UserProfile } from '@/lib/types';

interface SleepRecoveryProps {
  currentUser: UserProfile;
  sleepRecords: SleepRecord[];
  reflections: DailyReflection[];
  onSaveSleep: (record: SleepRecord) => void;
  onSaveReflection: (reflection: DailyReflection) => void;
}

export default function SleepRecovery({
  currentUser,
  sleepRecords,
  reflections,
  onSaveSleep,
  onSaveReflection
}: SleepRecoveryProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const currentSleep = sleepRecords.find(s => s.date === todayStr);
  const currentReflection = reflections.find(r => r.date === todayStr);

  // Sleep Form
  const [bedtime, setBedtime] = useState(currentSleep?.bedtime || '23:00');
  const [wakeTime, setWakeTime] = useState(currentSleep?.wakeTime || '07:00');
  const [latency, setLatency] = useState(currentSleep?.latencyMinutes ?? 15);
  const [awakenings, setAwakenings] = useState(currentSleep?.awakeningsMinutes ?? 0);
  const [sleepQuality, setSleepQuality] = useState(currentSleep?.sleepQualityRating ?? 4);
  const [morningEnergy, setMorningEnergy] = useState(currentSleep?.morningEnergyRating ?? 4);

  // Reflection Form (Private 3 Questions)
  const [wentWell, setWentWell] = useState(currentReflection?.wentWell || '');
  const [obstacle, setObstacle] = useState(currentReflection?.biggestObstacle || '');
  const [improvement, setImprovement] = useState(currentReflection?.oneImprovementTomorrow || '');
  const [isPrivate, setIsPrivate] = useState(currentReflection?.isPrivate ?? true);

  // Accurately calculate duration across midnight
  const calculateSleepDuration = (bed: string, wake: string, lat: number, awake: number) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);

    let startTotal = bH * 60 + bM;
    let endTotal = wH * 60 + wM;

    // Bedtime late night crossing midnight
    if (endTotal <= startTotal) {
      endTotal += 24 * 60;
    }

    const inBedMinutes = endTotal - startTotal;
    const actualSleep = Math.max(0, inBedMinutes - (Number(lat) || 0) - (Number(awake) || 0));
    return actualSleep;
  };

  const currentDurationMinutes = calculateSleepDuration(bedtime, wakeTime, latency, awakenings);

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: SleepRecord = {
      id: currentSleep?.id || `slp-${Date.now()}`,
      userId: currentUser.id,
      date: todayStr,
      bedtime,
      wakeTime,
      latencyMinutes: Number(latency),
      awakeningsMinutes: Number(awakenings),
      actualSleepMinutes: currentDurationMinutes,
      sleepQualityRating: sleepQuality,
      morningEnergyRating: morningEnergy
    };

    onSaveSleep(newRecord);
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReflection: DailyReflection = {
      id: currentReflection?.id || `refl-${Date.now()}`,
      userId: currentUser.id,
      date: todayStr,
      wentWell: wentWell.trim(),
      biggestObstacle: obstacle.trim(),
      oneImprovementTomorrow: improvement.trim(),
      isPrivate,
      updatedAt: new Date().toISOString()
    };

    onSaveReflection(newReflection);
  };

  const targetHours = currentUser.dailySleepTargetHours || 8;
  const targetMinutes = targetHours * 60;
  const sleepDiffMins = currentDurationMinutes - targetMinutes;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-600" />
          Sleep, Recovery & End-of-Day Reflection
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          High-performance cognitive stamina requires regular, restorative sleep.
        </p>
      </div>

      {/* Sleep Duration & Recovery Dashboard Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-purple-500/10 via-stone-50 to-indigo-50/20 p-6 rounded-2xl border border-purple-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-purple-900">
            <span className="text-xs font-semibold uppercase tracking-wider">Calculated Sleep</span>
            <Moon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {Math.floor(currentDurationMinutes / 60)}h {currentDurationMinutes % 60}m
          </div>
          <div className="text-xs text-stone-600">
            Target: <span className="font-semibold text-slate-800">{targetHours}h</span> ({Math.abs(sleepDiffMins)}m {sleepDiffMins >= 0 ? 'above target' : 'below target'})
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${sleepDiffMins >= 0 ? 'bg-emerald-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min(100, Math.round((currentDurationMinutes / targetMinutes) * 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Morning Energy</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{morningEnergy} / 5 Rating</div>
          <p className="text-xs text-stone-500 mt-2">
            Higher ratings strongly correlate with optimal deep sleep phases.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sleep Quality</span>
            <BatteryCharging className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{sleepQuality} / 5 Rating</div>
          <p className="text-xs text-stone-500 mt-2">
            Latency: {latency}m to fall asleep • Interruptions: {awakenings}m
          </p>
        </div>
      </div>

      {/* Sleep Log Form */}
      <form onSubmit={handleSleepSubmit} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b border-stone-100 pb-2">
          Log Sleep Timestamps (Calculates across midnight accurately)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bedtime (Lights out)</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Wake-up Time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time to Fall Asleep (Mins)</label>
            <input
              type="number"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Awake in Night (Mins)</label>
            <input
              type="number"
              value={awakenings}
              onChange={(e) => setAwakenings(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sleep Quality (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSleepQuality(lvl)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sleepQuality === lvl ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {lvl}★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Morning Energy (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setMorningEnergy(lvl)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    morningEnergy === lvl ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {lvl}⚡
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-xs transition-all"
          >
            Save Sleep Record
          </button>
        </div>
      </form>

      {/* End-of-Day 3-Question Reflection */}
      <form onSubmit={handleReflectionSubmit} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">End-of-Day Private Reflection</h3>
            <p className="text-xs text-stone-500">Three intentional questions to close the day with clarity.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
              isPrivate ? 'bg-stone-100 text-stone-700 border-stone-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPrivate ? 'Private to You' : 'Visible to Partner'}</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              1. What went well today? (Celebrate small wins)
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared hard logic puzzle, maintained uninterrupted focus..."
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2. What was the biggest obstacle? (Identify without blame)
            </label>
            <input
              type="text"
              placeholder="e.g. Afternoon fatigue, distracting notifications..."
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              3. What is one thing you want to improve tomorrow?
            </label>
            <input
              type="text"
              placeholder="e.g. Put phone in another room during the 10:00 AM block..."
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-xs transition-all"
          >
            Save Daily Reflection
          </button>
        </div>
      </form>
    </div>
  );
}

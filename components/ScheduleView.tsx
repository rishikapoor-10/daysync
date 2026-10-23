'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Shield, AlertTriangle, Users } from 'lucide-react';
import { ScheduleEvent, UserProfile } from '@/lib/types';

interface ScheduleViewProps {
  currentUser: UserProfile;
  partnerUser?: UserProfile;
  events: ScheduleEvent[];
  onSaveEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export default function ScheduleView({
  currentUser,
  partnerUser,
  events,
  onSaveEvent,
  onDeleteEvent
}: ScheduleViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Form State: includes targetUser dropdown (Rishi or Dhruvi)
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleEvent['category']>('Exam Prep');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'shared' | 'busy-only'>('shared');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekdays'>('none');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const categories: ScheduleEvent['category'][] = [
    'College', 'Office', 'Exam Prep', 'Self-Study', 'Gym', 
    'Physical Activity', 'Meals', 'Commute', 'Gaming', 'Personal', 'Sleep'
  ];

  const isMatchDate = (e: ScheduleEvent, date: string) => {
    if (e.date === date) return true;
    const dayOfWeek = new Date(date).getDay();
    if (e.recurring === 'daily') return true;
    if (e.recurring === 'weekdays' && [1, 2, 3, 4, 5].includes(dayOfWeek)) return true;
    return false;
  };

  const dayEvents = events.filter(e => isMatchDate(e, selectedDate));
  
  // Resolve lanes for Rishi and Dhruvi
  const rishiEvents = dayEvents.filter(e => e.userId === 'user_rishi').sort((a,b) => a.startTime.localeCompare(b.startTime));
  const dhruviEvents = dayEvents.filter(e => e.userId === 'user_dhruvi').sort((a,b) => a.startTime.localeCompare(b.startTime));

  const checkConflict = (start: string, end: string, forUser: string) => {
    const list = forUser === 'user_rishi' ? rishiEvents : dhruviEvents;
    const conflict = list.find(e => (start < e.endTime && end > e.startTime));
    if (conflict) {
      setConflictWarning(`Overlap warning: Clashes with "${conflict.title}" (${conflict.startTime}-${conflict.endTime}). You can still save if intentional.`);
    } else {
      setConflictWarning(null);
    }
  };

  const handleStartChange = (val: string) => {
    setStartTime(val);
    checkConflict(val, endTime, targetUserId);
  };

  const handleEndChange = (val: string) => {
    setEndTime(val);
    checkConflict(startTime, val, targetUserId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: ScheduleEvent = {
      id: `ev-${Date.now()}`,
      userId: targetUserId,
      title: title.trim(),
      category,
      date: selectedDate,
      startTime,
      endTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      visibility,
      recurring
    };

    onSaveEvent(newEvent);
    // Reset form
    setTitle('');
    setIsAddingEvent(false);
    setConflictWarning(null);
  };

  const getMutualFreeWindows = () => {
    const hours = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
    const busy = (time: string) => {
      const isRishiBusy = rishiEvents.some(e => e.startTime <= time && e.endTime > time);
      const isDhruviBusy = dhruviEvents.some(e => e.startTime <= time && e.endTime > time);
      return isRishiBusy || isDhruviBusy;
    };
    return hours.filter(h => !busy(h));
  };

  const mutualFree = getMutualFreeWindows();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            Shared Schedule & Planner (Rishi & Dhruvi)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Both lanes are editable. Easily add or adjust events for either Rishi or Dhruvi with one click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            aria-label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-xl bg-stone-50 text-slate-700"
          />
          <button
            onClick={() => {
              setTargetUserId(currentUser.id);
              setIsAddingEvent(!isAddingEvent);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Mutual Free Windows Banner */}
      {mutualFree.length > 0 && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-900">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mutual Free Opportunity:</strong> Both Rishi and Dhruvi have free windows around {mutualFree.slice(0, 3).join(', ')} — great for studying or workouts together!
            </span>
          </div>
        </div>
      )}

      {/* Add Event Form with User Selection Dropdown */}
      {isAddingEvent && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-semibold text-sm text-slate-800">Add Schedule Entry</h3>
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* User Dropdown Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">For Member</label>
              <select
                value={targetUserId}
                onChange={(e) => {
                  setTargetUserId(e.target.value);
                  checkConflict(startTime, endTime, e.target.value);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-amber-50/50 font-bold text-amber-950 focus:bg-white"
              >
                <option value="user_rishi">🦊 Rishi</option>
                <option value="user_dhruvi">🐼 Dhruvi</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. System Design, Quantitative practice, Gym session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleEndChange(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="shared">Full Details (Shared)</option>
                <option value="busy-only">Busy Only (Mask Title)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recurring Pattern</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="none">One-off today</option>
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
              </select>
            </div>
          </div>

          {conflictWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingEvent(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-xs"
            >
              Save Schedule Entry
            </button>
          </div>
        </form>
      )}

      {/* Two-Lane Calendar: BOTH LANES FULLY EDITABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lane 1: Rishi */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦊</span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Rishi's Lane</h3>
                <span className="text-[11px] text-stone-500">{rishiEvents.length} events planned</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-100/70 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">Editable</span>
              <button
                onClick={() => {
                  setTargetUserId('user_rishi');
                  setIsAddingEvent(true);
                }}
                className="text-xs text-amber-700 hover:underline font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {rishiEvents.length === 0 ? (
              <p className="text-center py-10 text-xs text-stone-400">No events scheduled for Rishi.</p>
            ) : (
              rishiEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-stone-200/70 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        {ev.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{ev.title}</h4>
                    {ev.location && <p className="text-xs text-stone-500">📍 {ev.location}</p>}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
                      <span>{ev.visibility === 'busy-only' ? '🔒 Masked' : '👁️ Shared'}</span>
                      {ev.recurring !== 'none' && <span>• 🔁 {ev.recurring}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="text-stone-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lane 2: Dhruvi */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🐼</span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Dhruvi's Lane</h3>
                <span className="text-[11px] text-stone-500">{dhruviEvents.length} events planned</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-100/70 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">Editable</span>
              <button
                onClick={() => {
                  setTargetUserId('user_dhruvi');
                  setIsAddingEvent(true);
                }}
                className="text-xs text-amber-700 hover:underline font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {dhruviEvents.length === 0 ? (
              <p className="text-center py-10 text-xs text-stone-400">No events scheduled for Dhruvi.</p>
            ) : (
              dhruviEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-stone-200/70 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        {ev.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{ev.title}</h4>
                    {ev.location && <p className="text-xs text-stone-500">📍 {ev.location}</p>}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1">
                      <span>{ev.visibility === 'busy-only' ? '🔒 Masked' : '👁️ Shared'}</span>
                      {ev.recurring !== 'none' && <span>• 🔁 {ev.recurring}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="text-stone-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Check, 
  Trash2,
  Users
} from 'lucide-react';
import { StudySubject, StudySession, UserProfile } from '@/lib/types';

interface StudyTrackerProps {
  currentUser: UserProfile;
  partnerUser?: UserProfile;
  subjects: StudySubject[];
  allSubjects: StudySubject[];
  studySessions: StudySession[];
  allStudySessions: StudySession[];
  onSaveSubject: (subject: StudySubject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onLogSession: (session: StudySession) => void;
}

export default function StudyTracker({
  currentUser,
  partnerUser,
  subjects,
  allSubjects,
  studySessions,
  allStudySessions,
  onSaveSubject,
  onDeleteSubject,
  onLogSession
}: StudyTrackerProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // User Filter for Viewing and Logging
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id);

  // Filter subjects and sessions for the selected target user
  const displayedSubjects = allSubjects.filter(s => s.userId === targetUserId);
  const displayedSessions = allStudySessions.filter(s => s.userId === targetUserId && s.date === todayStr);

  // Stopwatch state
  const [activeSubjectId, setActiveSubjectId] = useState<string>(displayedSubjects[0]?.id || '');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [questionsCorrect, setQuestionsCorrect] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [concentration, setConcentration] = useState(4);

  // Manual session modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDuration, setManualDuration] = useState(45);
  const [manualSubjectId, setManualSubjectId] = useState(displayedSubjects[0]?.id || '');

  // Add Subject state
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubUserId, setNewSubUserId] = useState<string>(targetUserId);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#E07A5F');
  const [newSubTargetMins, setNewSubTargetMins] = useState(60);
  const [newSubPriority, setNewSubPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newSubTopic, setNewSubTopic] = useState('');

  // Update subject picker when target user changes
  useEffect(() => {
    const list = allSubjects.filter(s => s.userId === targetUserId);
    if (list.length > 0) {
      setActiveSubjectId(list[0].id);
      setManualSubjectId(list[0].id);
    }
  }, [targetUserId, allSubjects]);

  // Active Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleFinishTimer = () => {
    const elapsedMinutes = Math.floor(timerSeconds / 60);
    if (elapsedMinutes < 1) {
      alert('Session duration is less than 1 minute. Keep studying a little longer before logging!');
      return;
    }

    const currentSub = displayedSubjects.find(s => s.id === activeSubjectId);
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      userId: targetUserId,
      subjectId: activeSubjectId,
      subjectName: currentSub?.name || 'Self-Study',
      date: todayStr,
      durationMinutes: elapsedMinutes,
      questionsAttempted: questionsAttempted > 0 ? questionsAttempted : undefined,
      questionsCorrect: questionsCorrect > 0 ? questionsCorrect : undefined,
      concentrationRating: concentration,
      notes: sessionNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onLogSession(newSession);

    // Reset timer
    setIsRunning(false);
    setTimerSeconds(0);
    setSessionNotes('');
    setQuestionsAttempted(0);
    setQuestionsCorrect(0);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSub = displayedSubjects.find(s => s.id === manualSubjectId);
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      userId: targetUserId,
      subjectId: manualSubjectId,
      subjectName: currentSub?.name || 'Self-Study',
      date: todayStr,
      durationMinutes: Number(manualDuration),
      concentrationRating: 4,
      createdAt: new Date().toISOString()
    };

    onLogSession(newSession);
    setIsManualModalOpen(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: StudySubject = {
      id: `sub-${Date.now()}`,
      userId: newSubUserId,
      name: newSubName.trim(),
      color: newSubColor,
      targetMinutesToday: Number(newSubTargetMins),
      priority: newSubPriority,
      topicToday: newSubTopic.trim() || undefined,
      status: 'not_started'
    };

    onSaveSubject(newSub);
    setNewSubName('');
    setNewSubTopic('');
    setIsAddingSubject(false);
  };

  const totalMinsLoggedToday = displayedSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalTargetMinsToday = displayedSubjects.reduce((acc, curr) => acc + curr.targetMinutesToday, 0) || 240;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Competitive Exam & Study Tracker
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Tracking for <span className="font-semibold text-slate-700">{targetUserId === 'user_rishi' ? 'Rishi 🦊' : 'Dhruvi 🐼'}</span> • Target: {Math.floor(totalTargetMinsToday / 60)}h {totalTargetMinsToday % 60}m
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* User selector dropdown */}
          <div className="flex items-center gap-1.5 bg-stone-50 p-1.5 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 pl-1">For:</span>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-stone-200 rounded-lg px-2 py-1"
            >
              <option value="user_rishi">🦊 Rishi</option>
              <option value="user_dhruvi">🐼 Dhruvi</option>
            </select>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Manual Log
          </button>
          <button
            onClick={() => {
              setNewSubUserId(targetUserId);
              setIsAddingSubject(!isAddingSubject);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Active Focus Timer Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-stone-50 to-orange-50/30 p-6 rounded-2xl border border-amber-200/70 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Timer Display */}
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Active Focus Stopwatch ({targetUserId === 'user_rishi' ? 'Rishi 🦊' : 'Dhruvi 🐼'})
            </span>
            <div className="font-mono text-5xl font-extrabold text-slate-800 tracking-tight">
              {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}:
              {String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0')}:
              {String(timerSeconds % 60).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Studying</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-5 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </button>
              )}
              {timerSeconds > 0 && (
                <>
                  <button
                    onClick={handleFinishTimer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Log & Save</span>
                  </button>
                  <button
                    onClick={() => { setIsRunning(false); setTimerSeconds(0); }}
                    className="p-2 text-stone-400 hover:text-stone-600"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Subject & Context settings for Timer */}
          <div className="md:col-span-2 space-y-3 bg-white/80 p-4 rounded-xl border border-stone-200/70">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject for Session</label>
                <select
                  value={activeSubjectId}
                  onChange={(e) => setActiveSubjectId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white"
                >
                  {displayedSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Concentration Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConcentration(lvl)}
                      className={`flex-1 py-1 rounded text-xs font-bold ${
                        concentration === lvl ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Practice Questions (Attempted / Correct)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Attempted"
                    value={questionsAttempted || ''}
                    onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                    className="w-1/2 text-xs p-2 rounded-lg border border-stone-200"
                  />
                  <input
                    type="number"
                    placeholder="Correct"
                    value={questionsCorrect || ''}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    className="w-1/2 text-xs p-2 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Key Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Speed drills, topic summary"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Subject Drawer with Member Dropdown */}
      {isAddingSubject && (
        <form onSubmit={handleCreateSubject} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-slate-800">Add New Subject / Topic Target</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Save For</label>
              <select
                value={newSubUserId}
                onChange={(e) => setNewSubUserId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 font-bold bg-amber-50/50"
              >
                <option value="user_rishi">🦊 Rishi</option>
                <option value="user_dhruvi">🐼 Dhruvi</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems, Logic"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Target (mins)</label>
              <input
                type="number"
                value={newSubTargetMins}
                onChange={(e) => setNewSubTargetMins(Number(e.target.value))}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newSubPriority}
                onChange={(e) => setNewSubPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Chapter / Topic</label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming, Case Study Set 2"
              value={newSubTopic}
              onChange={(e) => setNewSubTopic(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingSubject(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
            >
              Save Subject
            </button>
          </div>
        </form>
      )}

      {/* Manual Duration Modal with Member Dropdown */}
      {isManualModalOpen && (
        <form onSubmit={handleManualSubmit} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-slate-800">Log Completed Offline Study Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Member</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 font-bold bg-amber-50/50"
              >
                <option value="user_rishi">🦊 Rishi</option>
                <option value="user_dhruvi">🐼 Dhruvi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={manualSubjectId}
                onChange={(e) => setManualSubjectId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              >
                {displayedSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={manualDuration}
                onChange={(e) => setManualDuration(Number(e.target.value))}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
            >
              Add Session
            </button>
          </div>
        </form>
      )}

      {/* Subject-Wise Cards with Progress */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-800">
            Subject Targets & Progress for {targetUserId === 'user_rishi' ? 'Rishi 🦊' : 'Dhruvi 🐼'}
          </h3>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            Total Logged: {Math.floor(totalMinsLoggedToday / 60)}h {totalMinsLoggedToday % 60}m
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedSubjects.map((sub) => {
            const logged = displayedSessions
              .filter(s => s.subjectId === sub.id)
              .reduce((acc, curr) => acc + curr.durationMinutes, 0);
            const pct = sub.targetMinutesToday > 0 ? Math.min(100, Math.round((logged / sub.targetMinutesToday) * 100)) : 0;

            return (
              <div key={sub.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                    <h4 className="font-bold text-sm text-slate-800">{sub.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sub.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {sub.priority}
                    </span>
                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      className="text-stone-300 hover:text-rose-500"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {sub.topicToday && (
                  <p className="text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">Topic:</span> {sub.topicToday}
                  </p>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>{logged}m logged / {sub.targetMinutesToday}m target</span>
                    <span className="font-semibold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: sub.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500">Status:</span>
                  <span className={`font-semibold ${
                    pct >= 100 ? 'text-emerald-600' : pct > 0 ? 'text-amber-600' : 'text-stone-400'
                  }`}>
                    {pct >= 100 ? 'Completed ✅' : pct > 0 ? 'In Progress ⏳' : 'Not Started'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Logged Sessions Table */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-3">
          Today's Session History ({targetUserId === 'user_rishi' ? 'Rishi' : 'Dhruvi'})
        </h3>
        {displayedSessions.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No study sessions logged today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                  <th className="py-2">Subject</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Questions</th>
                  <th className="py-2">Concentration</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedSessions.map((s) => (
                  <tr key={s.id} className="text-slate-700 hover:bg-stone-50">
                    <td className="py-2.5 font-semibold">{s.subjectName}</td>
                    <td className="py-2.5 font-mono">{s.durationMinutes} mins</td>
                    <td className="py-2.5">
                      {s.questionsAttempted ? `${s.questionsCorrect || 0}/${s.questionsAttempted}` : '—'}
                    </td>
                    <td className="py-2.5">{s.concentrationRating ? `${s.concentrationRating}★` : '—'}</td>
                    <td className="py-2.5 text-stone-500 max-w-xs truncate">{s.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowUpRight, RefreshCw, Award } from 'lucide-react';
import { AIDailyReview, UserProfile } from '@/lib/types';

interface AIDailyCoachProps {
  currentUser: UserProfile;
  aiReviews: AIDailyReview[];
  onGenerateReview: () => Promise<void>;
  isGenerating: boolean;
}

export default function AIDailyCoach({
  currentUser,
  aiReviews,
  onGenerateReview,
  isGenerating
}: AIDailyCoachProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentReview = aiReviews.find(r => r.date === todayStr);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-50 to-stone-50 p-6 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Context-Aware Digital Mentor</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            AI Daily Accountability Coach
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Evaluates your actual logged hours, workout consistency, sleep trends, and notes. No generic fluff.
          </p>
        </div>

        <button
          onClick={onGenerateReview}
          disabled={isGenerating}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{currentReview ? 'Regenerate Review' : 'Analyze Today\'s Progress'}</span>
        </button>
      </div>

      {!currentReview ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mx-auto text-xl font-bold">
            💡
          </div>
          <h3 className="font-bold text-base text-slate-800">No Review Generated for Today Yet</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Click the button above to run an analysis over your schedule adherence, logged study sessions, sleep metrics, and reflections.
          </p>
          <button
            onClick={onGenerateReview}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 shadow-xs"
          >
            {isGenerating ? 'Analyzing data...' : 'Generate AI Daily Review'}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status pill */}
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Review generated for: <strong>{currentReview.date}</strong></span>
            <span className="bg-stone-100 px-2.5 py-0.5 rounded-full text-stone-600">
              {currentReview.isGeneratedByAI ? '✨ Powered by Gemini API' : '⚙️ Algorithmic Context Engine'}
            </span>
          </div>

          {/* Section A: Today's Overview */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <span>A. Today's Holistic Overview</span>
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {currentReview.overview}
            </p>
          </div>

          {/* Section B & C: Wins & Improvement Opportunity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/70 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>B. What Went Well</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentReview.whatWentWell}
              </p>
            </div>

            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>C. Opportunity to Improve</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentReview.opportunityToImprove}
              </p>
            </div>
          </div>

          {/* Section D & E: Study Insights & Routine Recovery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                D. Study & Exam Readiness Insights
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                {currentReview.studyInsights}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                E. Routine, Sleep & Recreation
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                {currentReview.routineAndRecovery}
              </p>
            </div>
          </div>

          {/* Section F: Tomorrow's 3-Point Action Plan */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              F. Tomorrow's Action Plan (Max 3 achievable targets)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentReview.actionPlan.map((action, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section G: Encouragement */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-100/30 to-amber-500/10 p-5 rounded-2xl border border-amber-300 text-center">
            <p className="text-sm font-semibold text-amber-950 italic">
              "{currentReview.encouragement}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

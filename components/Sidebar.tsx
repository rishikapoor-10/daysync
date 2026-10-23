'use client';

import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  Dumbbell, 
  Moon, 
  BarChart3, 
  Users2, 
  Settings, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  partnerUser?: UserProfile;
  onSwitchUser: (userId: string) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  partnerUser,
  onSwitchUser
}: SidebarProps) {
  const navItems = [
    { id: 'today', label: 'Today', icon: CheckCircle2 },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'study', label: 'Study Tracker', icon: BookOpen },
    { id: 'fitness', label: 'Fitness & Gaming', icon: Dumbbell },
    { id: 'sleep', label: 'Sleep & Recovery', icon: Moon },
    { id: 'ai-review', label: 'AI Daily Coach', icon: Sparkles },
    { id: 'weekly', label: 'Weekly Insights', icon: BarChart3 },
    { id: 'shared', label: 'Shared Dashboard', icon: Users2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-stone-200 bg-white/70 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              D
            </div>
            <div>
              <h1 className="font-semibold text-slate-800 text-lg leading-tight tracking-tight">DaySync</h1>
              <span className="text-xs text-stone-500 font-medium">Shared Space for 2</span>
            </div>
          </div>
        </div>

        {/* 1-Click User Switcher banner: Rishi & Dhruvi */}
        <div className="p-3 mx-3 my-2 bg-stone-50 rounded-xl border border-stone-200/60">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Active Member</span>
            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">Paired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSwitchUser('user_rishi')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                currentUser.id === 'user_rishi'
                  ? 'bg-white shadow-sm text-slate-800 border border-stone-200 font-semibold'
                  : 'text-stone-500 hover:text-slate-800 hover:bg-stone-100'
              }`}
            >
              <span>🦊</span>
              <span>Rishi</span>
            </button>
            <button
              onClick={() => onSwitchUser('user_dhruvi')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                currentUser.id === 'user_dhruvi'
                  ? 'bg-white shadow-sm text-slate-800 border border-stone-200 font-semibold'
                  : 'text-stone-500 hover:text-slate-800 hover:bg-stone-100'
              }`}
            >
              <span>🐼</span>
              <span>Dhruvi</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50/80 text-amber-900 font-semibold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile compact footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center text-xl">
            {currentUser.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{currentUser.name}</p>
            <p className="text-xs text-stone-500 truncate">{currentUser.exam}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

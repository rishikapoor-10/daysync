# DaySync — Two-Person Shared Accountability & Lifestyle Platform

DaySync is a light-themed, responsive web application for two friends/partners to plan shared schedules, prepare for competitive exams, track fitness & gaming balance, monitor sleep recovery, and review daily progress with an integrated AI Daily Coach.

---

## 🚀 Getting Started Locally

### 1. Requirements
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 2. Installation
```bash
cd /Users/admin/.gemini/antigravity/scratch/daysync
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Optional: if provided, AI Daily Coach uses Google Gemini 1.5 Flash.
# If omitted or unconfigured, DaySync automatically activates its smart algorithmic review engine based on genuine logged metrics.
GEMINI_API_KEY=your_api_key_here
```

### 4. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Key Architectural Decisions & Pillars

1. **Token-Optimized 1-Click User Switcher**:
   - Easily test and operate between **Alex (🦊)** and **Sam (🐼)** via the sidebar switcher.
   - Preserves independent records, server-side data partitioning, and private notes.

2. **Pillar 1: Shared Daily Schedule**:
   - Combined two-lane interactive calendar.
   - Category tags, recurring event support (daily, weekdays, one-off).
   - Visibility settings (`shared` vs `busy-only` masking).
   - Smart mutual free-time slot detection and overlap conflict warnings.

3. **Pillar 2: Competitive Exam & Study Tracker**:
   - Subject-wise target management and topic focus.
   - Interactive focus stopwatch/timer (excluding paused time).
   - Practice question tally (attempted vs correct accuracy).
   - Offline session quick-logging and completion percentages.

4. **Pillar 3: Fitness, Physical Activity & Gaming**:
   - Instant 1-click checkboxes for Gym attendance, physical activity, and gaming.
   - Daily gaming limit tracker with friendly, non-punitive balance prompts.
   - Rest days tracked without streak penalization.

5. **Pillar 4: Sleep, Recovery & Daily Reflection**:
   - Sleep duration calculation handling cross-midnight bedtime & wake-up times.
   - Latency and night-time awakenings subtracted from total in-bed duration.
   - Private 3-question daily reflection journal.

6. **AI Daily Coach**:
   - Real-data analysis endpoint (`/api/ai-review`) generating overview, wins, opportunities, study insights, recovery analysis, and 3-action plans.
   - Seamless fallback when API key is not supplied.

7. **Persistent Relational JSON Storage Engine**:
   - All events, logs, sessions, reflections, and settings persist across page reloads in `data/daysync_db.json`.

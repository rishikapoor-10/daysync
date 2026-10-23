import fs from 'fs';
import path from 'path';
import { AppDatabase, UserProfile } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'daysync_db.json');

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_rishi',
    name: 'Rishi',
    avatar: '🦊',
    role: 'Aspirant',
    exam: 'Tech & System Design / Prep',
    timezone: 'UTC+05:30',
    wakeTime: '06:30',
    dailyStudyTargetMinutes: 240, // 4 hours
    dailySleepTargetHours: 7.5,
    dailyGamingLimitMinutes: 60,
  },
  {
    id: 'user_dhruvi',
    name: 'Dhruvi',
    avatar: '🐼',
    role: 'Co-Pilot & Scholar',
    exam: 'Data & Competitive Strategy',
    timezone: 'UTC+05:30',
    wakeTime: '07:00',
    dailyStudyTargetMinutes: 210, // 3.5 hours
    dailySleepTargetHours: 8,
    dailyGamingLimitMinutes: 45,
  }
];

function getInitialDB(): AppDatabase {
  const today = new Date().toISOString().split('T')[0];
  return {
    users: INITIAL_USERS,
    events: [
      {
        id: 'ev-1',
        userId: 'user_rishi',
        title: 'System Architecture & Algorithms',
        category: 'Exam Prep',
        date: today,
        startTime: '09:00',
        endTime: '11:00',
        visibility: 'shared',
        recurring: 'weekdays'
      },
      {
        id: 'ev-2',
        userId: 'user_rishi',
        title: 'Gym - Upper Body Push',
        category: 'Gym',
        date: today,
        startTime: '17:30',
        endTime: '18:45',
        visibility: 'shared',
        recurring: 'none'
      },
      {
        id: 'ev-3',
        userId: 'user_dhruvi',
        title: 'Data Modeling & Quantitative Analysis',
        category: 'Self-Study',
        date: today,
        startTime: '10:00',
        endTime: '12:00',
        visibility: 'shared',
        recurring: 'weekdays'
      },
      {
        id: 'ev-4',
        userId: 'user_dhruvi',
        title: 'Evening Run / Outdoor Walk',
        category: 'Physical Activity',
        date: today,
        startTime: '17:00',
        endTime: '18:00',
        visibility: 'shared',
        recurring: 'none'
      }
    ],
    subjects: [
      {
        id: 'sub-rishi-1',
        userId: 'user_rishi',
        name: 'Quantitative Aptitude',
        color: '#E07A5F',
        targetMinutesToday: 90,
        priority: 'high',
        topicToday: 'Number Theory & Modular Arithmetic',
        status: 'partially'
      },
      {
        id: 'sub-rishi-2',
        userId: 'user_rishi',
        name: 'System Design & Code',
        color: '#7E74C4',
        targetMinutesToday: 90,
        priority: 'high',
        topicToday: 'Distributed Caching & Sharding',
        status: 'not_started'
      },
      {
        id: 'sub-rishi-3',
        userId: 'user_rishi',
        name: 'Verbal & Reading',
        color: '#52796F',
        targetMinutesToday: 45,
        priority: 'medium',
        topicToday: 'Speed reading & critical reasoning',
        status: 'completed'
      },
      {
        id: 'sub-dhruvi-1',
        userId: 'user_dhruvi',
        name: 'Machine Learning & Stats',
        color: '#3B82F6',
        targetMinutesToday: 90,
        priority: 'high',
        topicToday: 'Regression & Ensemble Methods',
        status: 'partially'
      },
      {
        id: 'sub-dhruvi-2',
        userId: 'user_dhruvi',
        name: 'Logical Reasoning & Strategy',
        color: '#10B981',
        targetMinutesToday: 60,
        priority: 'medium',
        topicToday: 'Analytical Case Studies',
        status: 'not_started'
      }
    ],
    studySessions: [
      {
        id: 'sess-1',
        userId: 'user_rishi',
        subjectId: 'sub-rishi-1',
        subjectName: 'Quantitative Aptitude',
        date: today,
        durationMinutes: 50,
        questionsAttempted: 20,
        questionsCorrect: 18,
        concentrationRating: 4,
        notes: 'Good rhythm on prime factorization techniques',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sess-2',
        userId: 'user_rishi',
        subjectId: 'sub-rishi-3',
        subjectName: 'Verbal & Reading',
        date: today,
        durationMinutes: 45,
        questionsAttempted: 15,
        questionsCorrect: 14,
        concentrationRating: 5,
        notes: 'Completed all 3 timed passage sets',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sess-3',
        userId: 'user_dhruvi',
        subjectId: 'sub-dhruvi-1',
        subjectName: 'Machine Learning & Stats',
        date: today,
        durationMinutes: 60,
        questionsAttempted: 25,
        questionsCorrect: 22,
        concentrationRating: 5,
        notes: 'Matrix factorizations and loss surfaces',
        createdAt: new Date().toISOString()
      }
    ],
    activityLogs: [
      {
        id: 'act-rishi-1',
        userId: 'user_rishi',
        date: today,
        gymToday: true,
        activityToday: true,
        activityType: 'Strength & Core',
        activityDurationMinutes: 55,
        workoutNotes: 'Bench press progression felt light, good energy',
        playedGamesToday: true,
        gamingDurationMinutes: 40
      },
      {
        id: 'act-dhruvi-1',
        userId: 'user_dhruvi',
        date: today,
        gymToday: false,
        activityToday: true,
        activityType: 'Outdoor 5k jogging',
        activityDurationMinutes: 35,
        workoutNotes: 'Moderate pace, breezy weather',
        playedGamesToday: false,
        gamingDurationMinutes: 0
      }
    ],
    sleepRecords: [
      {
        id: 'slp-rishi-1',
        userId: 'user_rishi',
        date: today,
        bedtime: '23:15',
        wakeTime: '06:45',
        latencyMinutes: 15,
        awakeningsMinutes: 0,
        actualSleepMinutes: 435,
        sleepQualityRating: 4,
        morningEnergyRating: 4
      },
      {
        id: 'slp-dhruvi-1',
        userId: 'user_dhruvi',
        date: today,
        bedtime: '23:30',
        wakeTime: '07:30',
        latencyMinutes: 20,
        awakeningsMinutes: 10,
        actualSleepMinutes: 450,
        sleepQualityRating: 5,
        morningEnergyRating: 5
      }
    ],
    reflections: [
      {
        id: 'refl-rishi-1',
        userId: 'user_rishi',
        date: today,
        wentWell: 'Finished verbal section early and kept focus steady.',
        biggestObstacle: 'Mild afternoon fatigue.',
        oneImprovementTomorrow: 'Take a brisk 10-minute walk right after lunch.',
        isPrivate: false,
        updatedAt: new Date().toISOString()
      }
    ],
    aiReviews: []
  };
}

export function readDB(): AppDatabase {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DaySync DB:', err);
    return getInitialDB();
  }
}

export function writeDB(db: AppDatabase): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DaySync DB:', err);
  }
}

import fs from 'fs';
import path from 'path';
import { AppDatabase, UserProfile } from './types';

// On Vercel / serverless, filesystem is read-only except /tmp
const IS_VERCEL = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_FILE = IS_VERCEL 
  ? path.join('/tmp', 'daysync_db.json')
  : path.join(process.cwd(), 'data', 'daysync_db.json');

// In-memory fallback cache so even if filesystem writes fail, state persists per instance
let memoryCache: AppDatabase | null = null;

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_rishi',
    name: 'Rishi',
    avatar: '🦊',
    role: 'Aspirant',
    exam: 'MBA & LAW',
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
    exam: 'CS & LLB',
    timezone: 'UTC+05:30',
    wakeTime: '07:00',
    dailyStudyTargetMinutes: 240, // 4 hours
    dailySleepTargetHours: 8,
    dailyGamingLimitMinutes: 45,
  }
];

export function getInitialDB(): AppDatabase {
  const today = new Date().toISOString().split('T')[0];
  return {
    users: INITIAL_USERS,
    events: [
      {
        id: 'ev-1',
        userId: 'user_rishi',
        title: 'Marketing Analytics & Metrics',
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
        title: 'Company Law & Practice Drill',
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
      // DHRUVI - CS
      {
        id: 'sub-d-cs-1',
        userId: 'user_dhruvi',
        name: 'Jurisprudence, Interpretation and General Laws (JIGL)',
        stream: 'CS',
        color: '#E07A5F',
        targetMinutesToday: 60,
        priority: 'high',
        topicToday: 'Sources of Law & Interpretation Rules',
        status: 'partially'
      },
      {
        id: 'sub-d-cs-2',
        userId: 'user_dhruvi',
        name: 'Company Law & Practice',
        stream: 'CS',
        color: '#D97706',
        targetMinutesToday: 60,
        priority: 'high',
        topicToday: 'Board Meetings & Resolutions',
        status: 'not_started'
      },
      {
        id: 'sub-d-cs-3',
        userId: 'user_dhruvi',
        name: 'Setting Up of Business Entities and Closure',
        stream: 'CS',
        color: '#CA8A04',
        targetMinutesToday: 45,
        priority: 'medium',
        topicToday: 'Industrial & Labour Law compliances',
        status: 'not_started'
      },
      {
        id: 'sub-d-cs-4',
        userId: 'user_dhruvi',
        name: 'Corporate Accounting & Financial Management',
        stream: 'CS',
        color: '#059669',
        targetMinutesToday: 45,
        priority: 'medium',
        topicToday: 'Cash Flow & Valuation Basics',
        status: 'not_started'
      },

      // DHRUVI - LLB
      {
        id: 'sub-d-llb-1',
        userId: 'user_dhruvi',
        name: 'Legal Language',
        stream: 'LLB',
        color: '#2563EB',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Legal Maxims & Terms',
        status: 'not_started'
      },
      {
        id: 'sub-d-llb-2',
        userId: 'user_dhruvi',
        name: 'Contract',
        stream: 'LLB',
        color: '#7C3AED',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'Offer, Acceptance & Consideration',
        status: 'completed'
      },
      {
        id: 'sub-d-llb-3',
        userId: 'user_dhruvi',
        name: 'Tort',
        stream: 'LLB',
        color: '#DB2777',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Negligence & Strict Liability',
        status: 'not_started'
      },
      {
        id: 'sub-d-llb-4',
        userId: 'user_dhruvi',
        name: 'Labour Laws',
        stream: 'LLB',
        color: '#4B5563',
        targetMinutesToday: 30,
        priority: 'low',
        topicToday: 'Industrial Disputes Act',
        status: 'not_started'
      },
      {
        id: 'sub-d-llb-5',
        userId: 'user_dhruvi',
        name: 'Practical Training',
        stream: 'LLB',
        color: '#0D9488',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Drafting & Moot court prep',
        status: 'not_started'
      },

      // RISHI - MBA
      {
        id: 'sub-r-mba-1',
        userId: 'user_rishi',
        name: 'Negotiation and Bargaining',
        stream: 'MBA',
        color: '#E07A5F',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'BATNA & Distributive Bargaining',
        status: 'partially'
      },
      {
        id: 'sub-r-mba-2',
        userId: 'user_rishi',
        name: 'Managing Global Teams',
        stream: 'MBA',
        color: '#2563EB',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Cross-cultural Communication',
        status: 'not_started'
      },
      {
        id: 'sub-r-mba-3',
        userId: 'user_rishi',
        name: 'Marketing Analytics',
        stream: 'MBA',
        color: '#7C3AED',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'Customer Lifetime Value & Churn Models',
        status: 'not_started'
      },
      {
        id: 'sub-r-mba-4',
        userId: 'user_rishi',
        name: 'Marketing Metrics',
        stream: 'MBA',
        color: '#059669',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'CAC, ROAS, Net Promoter Score',
        status: 'completed'
      },
      {
        id: 'sub-r-mba-5',
        userId: 'user_rishi',
        name: 'Scaling New Ventures',
        stream: 'MBA',
        color: '#D97706',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'Unit Economics & Growth Funnels',
        status: 'not_started'
      },
      {
        id: 'sub-r-mba-6',
        userId: 'user_rishi',
        name: 'Designing Employer Branding Campaigns',
        stream: 'MBA',
        color: '#DB2777',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'EVP & Talent Acquisition Strategy',
        status: 'not_started'
      },

      // RISHI - LAW
      {
        id: 'sub-r-law-1',
        userId: 'user_rishi',
        name: 'Legal Aptitude and Legal Reasoning',
        stream: 'LAW',
        color: '#4F46E5',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'Constitutional Law principles & Torts',
        status: 'partially'
      },
      {
        id: 'sub-r-law-2',
        userId: 'user_rishi',
        name: 'General Knowledge and Current Affairs',
        stream: 'LAW',
        color: '#0891B2',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Monthly Compendium & Legal Updates',
        status: 'not_started'
      },
      {
        id: 'sub-r-law-3',
        userId: 'user_rishi',
        name: 'Logical and Analytical Reasoning',
        stream: 'LAW',
        color: '#16A34A',
        targetMinutesToday: 45,
        priority: 'high',
        topicToday: 'Critical Reasoning & Syllogisms',
        status: 'not_started'
      },
      {
        id: 'sub-r-law-4',
        userId: 'user_rishi',
        name: 'English',
        stream: 'LAW',
        color: '#9333EA',
        targetMinutesToday: 30,
        priority: 'medium',
        topicToday: 'Reading Comprehension & Vocabulary',
        status: 'not_started'
      }
    ],
    studySessions: [
      {
        id: 'sess-1',
        userId: 'user_rishi',
        subjectId: 'sub-r-mba-4',
        subjectName: 'Marketing Metrics',
        date: today,
        durationMinutes: 35,
        questionsAttempted: 15,
        questionsCorrect: 14,
        concentrationRating: 5,
        notes: 'CAC and payback period calculations',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sess-2',
        userId: 'user_dhruvi',
        subjectId: 'sub-d-llb-2',
        subjectName: 'Contract',
        date: today,
        durationMinutes: 45,
        questionsAttempted: 20,
        questionsCorrect: 18,
        concentrationRating: 5,
        notes: 'Section 10 essentials & case laws',
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
        wentWell: 'Marketing metrics drill finished ahead of schedule.',
        biggestObstacle: 'Afternoon energy dip.',
        oneImprovementTomorrow: 'Take a short 10-minute walk after lunch.',
        isPrivate: false,
        updatedAt: new Date().toISOString()
      }
    ],
    aiReviews: []
  };
}

export function readDB(): AppDatabase {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      // Check if project has the initial data file in cwd
      const bundledDataFile = path.join(process.cwd(), 'data', 'daysync_db.json');
      if (IS_VERCEL && fs.existsSync(bundledDataFile)) {
        const bundled = fs.readFileSync(bundledDataFile, 'utf-8');
        fs.writeFileSync(DATA_FILE, bundled, 'utf-8');
        memoryCache = JSON.parse(bundled);
        return memoryCache!;
      }
      const initial = getInitialDB();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryCache = initial;
      return initial;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    memoryCache = JSON.parse(data);
    return memoryCache!;
  } catch (err) {
    console.warn('Filesystem read warning (falling back to memory cache):', err);
    if (!memoryCache) {
      memoryCache = getInitialDB();
    }
    return memoryCache;
  }
}

export function writeDB(db: AppDatabase): void {
  memoryCache = db;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write warning (memory cache still updated):', err);
  }
}

export interface UserProfile {
  id: string; // 'user_rishi' | 'user_dhruvi'
  name: string;
  avatar: string;
  role: string;
  exam: string;
  timezone: string;
  wakeTime: string;
  dailyStudyTargetMinutes: number;
  dailySleepTargetHours: number;
  dailyGamingLimitMinutes: number;
}

export interface ScheduleEvent {
  id: string;
  userId: string;
  title: string;
  category: 'College' | 'Office' | 'Exam Prep' | 'Self-Study' | 'Gym' | 'Physical Activity' | 'Meals' | 'Commute' | 'Gaming' | 'Personal' | 'Sleep';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  location?: string;
  description?: string;
  visibility: 'shared' | 'busy-only';
  recurring: 'none' | 'daily' | 'weekdays';
}

export interface StudySubject {
  id: string;
  userId: string;
  name: string;
  color: string;
  targetMinutesToday: number;
  priority: 'high' | 'medium' | 'low';
  topicToday?: string;
  status: 'completed' | 'partially' | 'not_started';
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  date: string;
  durationMinutes: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  concentrationRating?: number;
  notes?: string;
  createdAt: string;
}

export interface DailyActivityLog {
  id: string;
  userId: string;
  date: string;
  gymToday: boolean;
  activityToday: boolean;
  activityType?: string;
  activityDurationMinutes?: number;
  workoutNotes?: string;
  playedGamesToday: boolean;
  gamingDurationMinutes?: number;
}

export interface SleepRecord {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  latencyMinutes: number;
  awakeningsMinutes: number;
  actualSleepMinutes: number;
  sleepQualityRating: number;
  morningEnergyRating: number;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  wentWell: string;
  biggestObstacle: string;
  oneImprovementTomorrow: string;
  isPrivate: boolean;
  updatedAt: string;
}

export interface AIDailyReview {
  id: string;
  userId: string;
  date: string;
  overview: string;
  whatWentWell: string;
  opportunityToImprove: string;
  studyInsights: string;
  routineAndRecovery: string;
  actionPlan: string[];
  encouragement: string;
  isGeneratedByAI: boolean;
  createdAt: string;
}

export interface AppDatabase {
  users: UserProfile[];
  events: ScheduleEvent[];
  subjects: StudySubject[];
  studySessions: StudySession[];
  activityLogs: DailyActivityLog[];
  sleepRecords: SleepRecord[];
  reflections: DailyReflection[];
  aiReviews: AIDailyReview[];
}

export const mockWod = {
  _id: "67ea76a5ac5d89c8bb9d2222",
  boxId: "67ea76a5ac5d89c8bb9d2111",
  date: new Date().toISOString(),
  title: "WOD do Dia - Fran Modificado",
  blocks: [
    {
      type: "WARMUP" as const,
      title: "Aquecimento Geral",
      content: "3 rounds:\n- 200m Run\n- 10 Air Squats\n- 10 Push-ups\n- 5 Inchworms",
    },
    {
      type: "SKILL" as const,
      title: "Técnica de Thruster",
      content: "EMOM 8 min:\n- 3 Thrusters (peso progressivo)\n- Foco na posição do front rack",
    },
    {
      type: "WOD" as const,
      title: "Fran Modificado",
      content: "21-15-9 For Time:\n- Thrusters (43/30 kg)\n- Pull-ups\n\nTime Cap: 10 min",
    },
  ],
  createdAt: new Date().toISOString(),
};

export const mockFeedPosts = [
  {
    id: "1",
    userName: "Lucas Silva",
    avatarInitial: "LS",
    text: "Bati PR no Deadlift hoje! 180kg 🔥 Consistência tá valendo a pena!",
    isNewPR: true,
    exercise: "Deadlift",
    score: "180kg",
    timeAgo: "5 min",
    likes: 12,
  },
  {
    id: "2",
    userName: "Marina Costa",
    avatarInitial: "MC",
    text: "Primeiro muscle-up da vida!! Não acredito que consegui 💪",
    isNewPR: true,
    exercise: "Muscle-up",
    score: "1 rep",
    timeAgo: "23 min",
    likes: 28,
  },
  {
    id: "3",
    userName: "Pedro Alves",
    avatarInitial: "PA",
    text: "WOD destruidor hoje, mas sobrevivi! Fran em 4:32",
    isNewPR: false,
    timeAgo: "1h",
    likes: 8,
  },
  {
    id: "4",
    userName: "Ana Beatriz",
    avatarInitial: "AB",
    text: "30 dias de streak! Não paro mais 🏆",
    isNewPR: false,
    timeAgo: "2h",
    likes: 35,
  },
];

export const mockExercises = [
  { _id: "e1", name: "Back Squat", category: "WEIGHTLIFTING", currentPR: "120kg" },
  { _id: "e2", name: "Deadlift", category: "WEIGHTLIFTING", currentPR: "180kg" },
  { _id: "e3", name: "Snatch", category: "WEIGHTLIFTING", currentPR: "75kg" },
  { _id: "e4", name: "Clean & Jerk", category: "WEIGHTLIFTING", currentPR: "100kg" },
  { _id: "e5", name: "Front Squat", category: "WEIGHTLIFTING", currentPR: "105kg" },
  { _id: "e6", name: "Overhead Squat", category: "WEIGHTLIFTING", currentPR: "70kg" },
  { _id: "e7", name: "Muscle-up", category: "GYMNASTICS", currentPR: "5 reps" },
  { _id: "e8", name: "Handstand Walk", category: "GYMNASTICS", currentPR: "15m" },
];

export const mockRewardSummary = {
  currentStreak: 12,
  longestStreak: 18,
  lastActivityDate: new Date().toISOString(),
  availableFreezes: 2,
  totalXp: 1350,
  streakState: "ACTIVE" as const,
  daysSinceLastActivity: 0,
  nextMilestone: 14,
};

export const mockMilestones = [
  { days: 3, unlocked: true, xp: 20, freeze: 0 },
  { days: 7, unlocked: true, xp: 50, freeze: 1 },
  { days: 14, unlocked: false, xp: 100, freeze: 1 },
  { days: 30, unlocked: false, xp: 200, freeze: 2 },
  { days: 60, unlocked: false, xp: 400, freeze: 2 },
  { days: 100, unlocked: false, xp: 1000, freeze: 3 },
];

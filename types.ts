
export enum WorkoutType {
  CHEST_BICEPS = 'CHEST_BICEPS',
  BACK_TRICEPS = 'BACK_TRICEPS',
  LEGS_SHOULDERS = 'LEGS_SHOULDERS'
}

export interface SetEntry {
  weight: number;
  reps: number;
}

export interface ExerciseEntry {
  name: string;
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  userId: string;
  date: string; // ISO format: YYYY-MM-DD
  type: WorkoutType;
  exercises: ExerciseEntry[];
}

export interface User {
  login: string;
  passwordHash: string;
}

export interface AppData {
  users: Record<string, User>;
  workouts: Workout[];
  // login -> workoutType -> exercise names
  customExercises: Record<string, Record<WorkoutType, string[]>>;
}

export const WORKOUT_TEMPLATES = {
  [WorkoutType.CHEST_BICEPS]: {
    label: "Грудь / Бицепс",
    exercises: [
      "Жим лёжа на горизонтальной скамье",
      "Жим гантелей на наклонной скамье",
      "Сведения в тренажёре",
      "Подъём штанги на бицепс стоя"
    ]
  },
  [WorkoutType.BACK_TRICEPS]: {
    label: "Спина / Трицепс",
    exercises: [
      "Тяга верхнего блока к груди",
      "Тяга штанги в наклоне",
      "Тяга горизонтального блока",
      "Разгибания на трицепс в блоке"
    ]
  },
  [WorkoutType.LEGS_SHOULDERS]: {
    label: "Ноги / Плечи",
    exercises: [
      "Приседания со штангой",
      "Жим ногами в тренажёре",
      "Выпады с гантелями",
      "Жим штанги стоя (армейский жим)"
    ]
  }
};


import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutType, Workout, User, AppData, WORKOUT_TEMPLATES, ExerciseEntry } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const STORAGE_KEY = 'workout_diary_v1';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialData = saved ? JSON.parse(saved) : { users: {}, workouts: [], customExercises: {} };
    // Migration for existing data without customExercises
    if (!initialData.customExercises) initialData.customExercises = {};
    return initialData;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user_login');
    if (saved && data.users[saved]) {
      return data.users[saved];
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user_login', currentUser.login);
    } else {
      localStorage.removeItem('current_user_login');
    }
  }, [currentUser]);

  const handleRegister = (user: User) => {
    if (data.users[user.login]) {
      throw new Error('Пользователь с таким логином уже зарегистрирован.');
    }
    setData(prev => ({
      ...prev,
      users: { ...prev.users, [user.login]: user }
    }));
    setCurrentUser(user);
  };

  const handleLogin = (login: string, passwordHash: string) => {
    const user = data.users[login];
    if (!user) throw new Error('Пользователь не найден.');
    if (user.passwordHash !== passwordHash) throw new Error('Неверный пароль.');
    setCurrentUser(user);
  };

  const addCustomExercise = (name: string, type: WorkoutType) => {
    if (!currentUser) return;
    setData(prev => {
      const userCustoms = prev.customExercises[currentUser.login] || {
        [WorkoutType.CHEST_BICEPS]: [],
        [WorkoutType.BACK_TRICEPS]: [],
        [WorkoutType.LEGS_SHOULDERS]: []
      };
      
      if (userCustoms[type].includes(name) || WORKOUT_TEMPLATES[type].exercises.includes(name)) {
        alert('Такое упражнение уже есть в этой группе!');
        return prev;
      }

      return {
        ...prev,
        customExercises: {
          ...prev.customExercises,
          [currentUser.login]: {
            ...userCustoms,
            [type]: [...userCustoms[type], name]
          }
        }
      };
    });
  };

  const deleteCustomExercise = (name: string, type: WorkoutType) => {
    if (!currentUser) return;
    setData(prev => {
      const userCustoms = prev.customExercises[currentUser.login];
      if (!userCustoms) return prev;
      return {
        ...prev,
        customExercises: {
          ...prev.customExercises,
          [currentUser.login]: {
            ...userCustoms,
            [type]: userCustoms[type].filter(ex => ex !== name)
          }
        }
      };
    });
  };

  const addWorkout = (workout: Omit<Workout, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      userId: currentUser.login
    };
    setData(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout]
    }));
  };

  const updateWorkout = (updated: Workout) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => w.id === updated.id ? updated : w)
    }));
  };

  const deleteWorkout = (id: string) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id)
    }));
  };

  const userWorkouts = useMemo(() => {
    if (!currentUser) return [];
    return data.workouts.filter(w => w.userId === currentUser.login);
  }, [data.workouts, currentUser]);

  const userCustomExercises = useMemo(() => {
    if (!currentUser) return null;
    return data.customExercises[currentUser.login] || null;
  }, [data.customExercises, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Auth onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Dashboard 
        user={currentUser} 
        workouts={userWorkouts} 
        customExercises={userCustomExercises}
        onLogout={() => setCurrentUser(null)}
        onAddWorkout={addWorkout}
        onUpdateWorkout={updateWorkout}
        onDeleteWorkout={deleteWorkout}
        onAddCustomExercise={addCustomExercise}
        onDeleteCustomExercise={deleteCustomExercise}
      />
    </div>
  );
};

export default App;

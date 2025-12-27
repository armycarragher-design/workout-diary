
import React, { useState, useMemo } from 'react';
import { User, Workout, WorkoutType, WORKOUT_TEMPLATES } from '../types';
import WorkoutForm from './WorkoutForm';

interface DashboardProps {
  user: User;
  workouts: Workout[];
  customExercises: Record<WorkoutType, string[]> | null;
  onLogout: () => void;
  onAddWorkout: (workout: Omit<Workout, 'id' | 'userId'>) => void;
  onUpdateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onAddCustomExercise: (name: string, type: WorkoutType) => void;
  onDeleteCustomExercise: (name: string, type: WorkoutType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, workouts, customExercises, onLogout, onAddWorkout, onUpdateWorkout, onDeleteWorkout, onAddCustomExercise, onDeleteCustomExercise 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExerciseManagerOpen, setIsExerciseManagerOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // For Exercise Manager Form
  const [newExName, setNewExName] = useState('');
  const [newExType, setNewExType] = useState<WorkoutType>(WorkoutType.CHEST_BICEPS);

  const weekDates = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const dayLabels = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  const dailyWorkouts = useMemo(() => workouts.filter(w => w.date === selectedDate), [workouts, selectedDate]);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExName.trim()) {
      onAddCustomExercise(newExName.trim(), newExType);
      setNewExName('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto min-h-screen px-4 py-8">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
            {user.login[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-none">Привет, {user.login}!</h1>
            <button 
              onClick={() => setIsExerciseManagerOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider mt-1"
            >
              Мои упражнения
            </button>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs font-black text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors uppercase">
          Выйти
        </button>
      </header>

      <section className="bg-white p-4 rounded-3xl shadow-sm mb-6 border border-gray-100">
        <div className="flex justify-between mb-4">
           {weekDates.map((date, idx) => {
             const isSelected = date === selectedDate;
             const isToday = date === new Date().toISOString().split('T')[0];
             return (
               <button 
                 key={date}
                 onClick={() => setSelectedDate(date)}
                 className={`flex flex-col items-center p-2 rounded-2xl transition-all w-12 ${isSelected ? 'bg-blue-600 text-white shadow-lg scale-110' : 'hover:bg-gray-100'}`}
               >
                 <span className={`text-[10px] mb-1 font-black ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{dayLabels[idx]}</span>
                 <span className="text-sm font-black">{new Date(date).getDate()}</span>
                 {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>}
               </button>
             );
           })}
        </div>
        <div className="flex items-center justify-between border-t pt-4 px-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Календарь:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold border-none focus:ring-0 cursor-pointer bg-gray-50 py-1 px-3 rounded-xl text-gray-700"
          />
        </div>
      </section>

      <main className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-black text-gray-900">
            {selectedDate === new Date().toISOString().split('T')[0] ? 'Сегодня' : selectedDate}
          </h2>
          <button 
            onClick={() => { setEditingWorkout(null); setIsFormOpen(true); }}
            className="px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest"
          >
            + Тренировка
          </button>
        </div>

        {dailyWorkouts.length > 0 ? (
          dailyWorkouts.map(workout => (
            <div key={workout.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {WORKOUT_TEMPLATES[workout.type].label}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingWorkout(workout); setIsFormOpen(true); }} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button onClick={() => onDeleteWorkout(workout.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <ul className="space-y-4">
                {workout.exercises.map((ex, i) => (
                  <li key={i} className="text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="font-black text-gray-800 mb-2 flex items-center justify-between">
                      {ex.name}
                      <span className="text-[10px] text-gray-300 font-bold">{ex.sets.length} сет.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ex.sets.map((set, si) => (
                        <div key={si} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-gray-600 font-mono text-[11px]">
                          <span className="font-bold text-gray-400 mr-1">{si + 1}:</span>
                          <b className="text-gray-900">{set.weight}</b>кг × <b className="text-gray-900">{set.reps}</b>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-gray-100/50 rounded-3xl border-4 border-dashed border-white flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 mb-4 shadow-sm">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Сегодня без нагрузок</p>
          </div>
        )}
      </main>

      {/* Exercise Manager Modal */}
      {isExerciseManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Мои упражнения</h3>
              <button onClick={() => setIsExerciseManagerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Form to add */}
              <form onSubmit={handleAddExercise} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Добавить новое:</p>
                <input 
                  type="text" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="Название упражнения..."
                  className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-blue-500 rounded-xl outline-none text-sm font-bold shadow-sm"
                  required
                />
                <select 
                  value={newExType}
                  onChange={(e) => setNewExType(e.target.value as WorkoutType)}
                  className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-blue-500 rounded-xl outline-none text-sm font-bold shadow-sm"
                >
                  <option value={WorkoutType.CHEST_BICEPS}>Грудь / Бицепс</option>
                  <option value={WorkoutType.BACK_TRICEPS}>Спина / Трицепс</option>
                  <option value={WorkoutType.LEGS_SHOULDERS}>Ноги / Плечи</option>
                </select>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                  Сохранить
                </button>
              </form>

              {/* List of existing */}
              <div className="space-y-4">
                {(Object.keys(WORKOUT_TEMPLATES) as WorkoutType[]).map(type => (
                  <div key={type} className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{WORKOUT_TEMPLATES[type].label}</h4>
                    <div className="space-y-2">
                      {customExercises?.[type].length ? (
                        customExercises[type].map(name => (
                          <div key={name} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-sm">
                            <span className="text-sm font-bold text-gray-700">{name}</span>
                            <button onClick={() => onDeleteCustomExercise(name, type)} className="text-red-300 hover:text-red-500">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] italic text-gray-300 px-1">Пока нет своих упражнений</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <WorkoutForm 
          date={selectedDate}
          existingWorkout={editingWorkout}
          userWorkouts={workouts}
          customExercises={customExercises}
          onClose={() => setIsFormOpen(false)}
          onSave={(w) => {
            if (editingWorkout) {
              onUpdateWorkout({ ...w, id: editingWorkout.id, userId: user.login } as Workout);
            } else {
              onAddWorkout(w);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

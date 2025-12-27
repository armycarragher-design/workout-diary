
import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutType, Workout, WORKOUT_TEMPLATES, ExerciseEntry, SetEntry } from '../types';

interface WorkoutFormProps {
  date: string;
  existingWorkout: Workout | null;
  userWorkouts: Workout[];
  customExercises: Record<WorkoutType, string[]> | null;
  onClose: () => void;
  onSave: (workout: Omit<Workout, 'id' | 'userId'>) => void;
}

type Step = 'TYPE_SELECTION' | 'EXERCISE_SELECTION' | 'EXERCISE_STEP' | 'SUMMARY';

const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  date, existingWorkout, userWorkouts, customExercises, onClose, onSave 
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(existingWorkout ? 'EXERCISE_STEP' : 'TYPE_SELECTION');
  const [type, setType] = useState<WorkoutType>(existingWorkout?.type || WorkoutType.CHEST_BICEPS);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  
  // Selected exercises names for this session
  const [selectedExercisesNames, setSelectedExercisesNames] = useState<string[]>([]);
  
  // Accumulated results of the workout
  const [workoutResult, setWorkoutResult] = useState<ExerciseEntry[]>(existingWorkout?.exercises || []);
  
  // Current exercise being edited
  const currentExerciseName = selectedExercisesNames[exerciseIndex];
  
  // State for the sets of the current exercise
  const [currentSets, setCurrentSets] = useState<SetEntry[]>([]);

  // Find history for recommendations
  const previousWorkout = useMemo(() => {
    return [...userWorkouts]
      .filter(w => w.type === type && w.id !== existingWorkout?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [type, userWorkouts, existingWorkout]);

  // Handle step initialization
  useEffect(() => {
    if (currentStep === 'EXERCISE_STEP' && currentExerciseName) {
      const existingInResult = workoutResult.find(ex => ex.name === currentExerciseName);
      if (existingInResult) {
        setCurrentSets(existingInResult.sets);
      } else {
        // Look for the absolute LAST time this user did THIS SPECIFIC exercise name
        let lastSetData: SetEntry[] | null = null;
        for (const w of [...userWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
          if (w.id === existingWorkout?.id) continue;
          const matchedEx = w.exercises.find(ex => ex.name === currentExerciseName);
          if (matchedEx) {
            lastSetData = matchedEx.sets;
            break;
          }
        }

        if (lastSetData && lastSetData.length > 0) {
          setCurrentSets(lastSetData.map(s => ({
            weight: s.weight + 1.25,
            reps: s.reps
          })));
        } else {
          setCurrentSets([{ weight: 0, reps: 0 }, { weight: 0, reps: 0 }, { weight: 0, reps: 0 }]);
        }
      }
    }
  }, [exerciseIndex, currentStep, currentExerciseName, userWorkouts, existingWorkout]);

  // Initial populate for Selection step
  useEffect(() => {
    if (currentStep === 'EXERCISE_SELECTION') {
      const available = [
        ...WORKOUT_TEMPLATES[type].exercises,
        ...(customExercises?.[type] || [])
      ];
      setSelectedExercisesNames(available);
    }
  }, [currentStep, type, customExercises]);

  const toggleExerciseSelection = (name: string) => {
    setSelectedExercisesNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleAddSet = () => {
    const lastSet = currentSets[currentSets.length - 1];
    setCurrentSets([...currentSets, { weight: lastSet?.weight || 0, reps: lastSet?.reps || 0 }]);
  };

  const handleRemoveSet = (index: number) => {
    if (currentSets.length > 1) {
      setCurrentSets(currentSets.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSet = (index: number, field: keyof SetEntry, value: number) => {
    const next = [...currentSets];
    next[index] = { ...next[index], [field]: value };
    setCurrentSets(next);
  };

  const handleFinishExercise = () => {
    const updatedResult = [...workoutResult];
    const existingIdx = updatedResult.findIndex(ex => ex.name === currentExerciseName);
    const exerciseData = { name: currentExerciseName, sets: currentSets };

    if (existingIdx > -1) {
      updatedResult[existingIdx] = exerciseData;
    } else {
      updatedResult.push(exerciseData);
    }
    setWorkoutResult(updatedResult);

    if (exerciseIndex < selectedExercisesNames.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      setCurrentStep('SUMMARY');
    }
  };

  const handleBack = () => {
    if (currentStep === 'EXERCISE_STEP') {
      if (exerciseIndex > 0) setExerciseIndex(exerciseIndex - 1);
      else setCurrentStep('EXERCISE_SELECTION');
    } else if (currentStep === 'EXERCISE_SELECTION') {
      setCurrentStep('TYPE_SELECTION');
    }
  };

  const handleFinalSave = () => {
    onSave({ date, type, exercises: workoutResult });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all border border-gray-100">
        
        {/* HEADER */}
        <header className="p-6 border-b flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">
              {currentStep === 'TYPE_SELECTION' && 'Тренировка'}
              {currentStep === 'EXERCISE_SELECTION' && 'Выбор плана'}
              {currentStep === 'EXERCISE_STEP' && 'Выполнение'}
              {currentStep === 'SUMMARY' && 'Завершение'}
            </h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
              {date} • {WORKOUT_TEMPLATES[type].label}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: SELECT TYPE */}
          {currentStep === 'TYPE_SELECTION' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest px-1">Группа мышц на сегодня:</p>
              {(Object.keys(WORKOUT_TEMPLATES) as WorkoutType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setCurrentStep('EXERCISE_SELECTION'); }}
                  className="w-full flex items-center justify-between p-6 text-left border-2 border-gray-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <span className="font-black text-gray-800 group-hover:text-blue-700">{WORKOUT_TEMPLATES[t].label}</span>
                  <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: SELECT EXERCISES */}
          {currentStep === 'EXERCISE_SELECTION' && (
            <div className="space-y-4">
               <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest px-1">Что будем делать?</p>
               <div className="space-y-2">
                 {[...WORKOUT_TEMPLATES[type].exercises, ...(customExercises?.[type] || [])].map(name => {
                   const isPreset = WORKOUT_TEMPLATES[type].exercises.includes(name);
                   const isSelected = selectedExercisesNames.includes(name);
                   return (
                     <label 
                       key={name} 
                       className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-50 opacity-60'}`}
                     >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleExerciseSelection(name)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className={`text-sm font-black ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>{name}</span>
                          {!isPreset && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">Моё</span>}
                        </div>
                     </label>
                   )
                 })}
               </div>
               {selectedExercisesNames.length === 0 && (
                 <p className="text-center text-xs text-red-400 font-bold">Выберите хотя бы одно упражнение</p>
               )}
            </div>
          )}

          {/* STEP 3: EXECUTION */}
          {currentStep === 'EXERCISE_STEP' && (
            <div className="space-y-6">
              <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Упражнение {exerciseIndex + 1} из {selectedExercisesNames.length}</span>
                </div>
                <h3 className="text-2xl font-black leading-tight tracking-tight">{currentExerciseName}</h3>
              </div>

              <div className="flex gap-1.5 justify-center">
                {selectedExercisesNames.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === exerciseIndex ? 'w-8 bg-blue-600' : 'w-1.5 bg-gray-200'}`}></div>
                ))}
              </div>

              <div className="space-y-3">
                {currentSets.map((set, i) => {
                  let prevSetsForEx: SetEntry[] | null = null;
                  for (const w of [...userWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
                    if (w.id === existingWorkout?.id) continue;
                    const matched = w.exercises.find(ex => ex.name === currentExerciseName);
                    if (matched) { prevSetsForEx = matched.sets; break; }
                  }
                  const prevSet = prevSetsForEx?.[i];

                  return (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Сет {i + 1}</span>
                        <button type="button" onClick={() => handleRemoveSet(i)} className="text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-300 uppercase ml-1">Вес</span>
                          <input 
                            type="number" step="0.25" value={set.weight || ''}
                            onChange={(e) => handleUpdateSet(i, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl py-3 px-4 font-black text-gray-800 outline-none text-center"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-gray-300 uppercase ml-1">Раз</span>
                          <input 
                            type="number" value={set.reps || ''}
                            onChange={(e) => handleUpdateSet(i, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border-2 border-transparent focus:border-blue-500 rounded-xl py-3 px-4 font-black text-gray-800 outline-none text-center"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {prevSet && (
                        <div className="mt-2 text-[10px] flex justify-between px-1">
                          <span className="text-gray-400 font-bold">Было: <b className="text-gray-500">{prevSet.weight}×{prevSet.reps}</b></span>
                          <span className="text-green-600 font-black tracking-tight">Цель: {prevSet.weight + 1.25}кг</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button 
                  type="button" onClick={handleAddSet}
                  className="w-full py-4 border-2 border-dashed border-gray-100 text-gray-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + Добавить подход
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {currentStep === 'SUMMARY' && (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Тренировка завершена!</h3>
                <p className="text-xs text-gray-400 font-bold mt-2 px-10 italic">Вы отлично потрудились. Сохраняем результаты в историю?</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 text-left">
                <ul className="space-y-3">
                  {workoutResult.map((ex, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <span className="font-black text-gray-800 text-xs">{ex.name}</span>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{ex.sets.length} подходов</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t bg-gray-50/20 flex gap-3">
          {currentStep === 'TYPE_SELECTION' ? (
            <button onClick={onClose} className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Отмена</button>
          ) : currentStep === 'EXERCISE_SELECTION' ? (
            <>
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Назад</button>
              <button 
                onClick={() => selectedExercisesNames.length > 0 && setCurrentStep('EXERCISE_STEP')}
                disabled={selectedExercisesNames.length === 0}
                className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none transition-all uppercase tracking-widest"
              >
                Начать тренировку
              </button>
            </>
          ) : currentStep === 'EXERCISE_STEP' ? (
            <>
              <button onClick={handleBack} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Назад</button>
              <button 
                onClick={handleFinishExercise}
                className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
              >
                {exerciseIndex === selectedExercisesNames.length - 1 ? 'Финиш' : 'Далее'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setCurrentStep('EXERCISE_STEP'); setExerciseIndex(selectedExercisesNames.length - 1); }} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Правка</button>
              <button 
                onClick={handleFinalSave}
                className="flex-[2] py-4 bg-green-500 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-600 active:scale-95 transition-all uppercase tracking-widest"
              >
                Сохранить в дневник
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default WorkoutForm;

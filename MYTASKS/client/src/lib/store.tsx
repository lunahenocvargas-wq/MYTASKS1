import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

// Types
export type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string; 
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  categoryId?: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  updatedAt: Date;
};

type AppState = {
  tasks: Task[];
  categories: Category[];
  notes: Note[];
};

type AppContextType = {
  state: AppState;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
};

// Initial Mock Data
const initialCategories: Category[] = [
  { id: '1', name: 'Trabajo', color: 'bg-blue-100 text-blue-700' },
  { id: '2', name: 'Personal', color: 'bg-green-100 text-green-700' },
  { id: '3', name: 'Exámenes', color: 'bg-red-100 text-red-700' },
  { id: '4', name: 'Proyectos', color: 'bg-purple-100 text-purple-700' },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Completar tarea de Matemáticas', dueDate: new Date(), completed: false, categoryId: '3' },
  { id: '2', title: 'Hacer la compra', dueDate: new Date(), completed: true, categoryId: '2' },
  { id: '3', title: 'Reunión de equipo', dueDate: new Date(Date.now() + 86400000), completed: false, categoryId: '1' },
];

const initialNotes: Note[] = [
  { id: '1', title: 'Ideas de proyecto', content: '1. Gestor de tareas con IA\n2. App del tiempo', priority: 'medium', updatedAt: new Date() },
  { id: '2', title: 'Lista de la compra', content: 'Leche, Huevos, Pan', priority: 'low', updatedAt: new Date() },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    tasks: initialTasks,
    categories: initialCategories,
    notes: initialNotes,
  });

  const addTask = (task: Omit<Task, 'id'>) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, { ...task, id: nanoid() }] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setState(prev => ({ ...prev, categories: [...prev.categories, { ...category, id: nanoid() }] }));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      tasks: prev.tasks.map(t => (t.categoryId === id ? { ...t, categoryId: undefined } : t)), // Unassign tasks
    }));
  };

  const addNote = (note: Omit<Note, 'id' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, notes: [...prev.notes, { ...note, id: nanoid(), updatedAt: new Date() }] }));
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => (n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addCategory,
        updateCategory,
        deleteCategory,
        addNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

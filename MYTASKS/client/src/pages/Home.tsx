import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import generatedHeader from "@assets/generated_images/abstract_soft_gradient_shapes_in_pastel_violet_and_blue.png";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useCategories, useUpdateTask, useDeleteTask } from "@/lib/hooks";

export default function Home() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: categories = [] } = useCategories();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksForDay = tasks.filter(
    (task) => date && isSameDay(new Date(task.dueDate), date)
  );

  const pendingTasks = tasksForDay.filter((t) => !t.completed);
  const completedTasks = tasksForDay.filter((t) => t.completed);

  const handleToggle = (id: string, completed: boolean) => {
    updateTask.mutate({ id, data: { completed: !completed } });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm h-48 md:h-64 group">
        <img
          src={generatedHeader}
          alt="Header"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6 md:p-8">
          <div className="text-white space-y-2">
            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
              Hola, Usuario
            </h1>
            <p className="text-white/90 font-medium text-lg" data-testid="text-pending-count">
              Tienes {tasks.filter(t => !t.completed).length} tareas pendientes en total.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8">
        {/* Calendar Column */}
        <div className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
             <CardHeader className="bg-primary/5 pb-4">
               <CardTitle className="text-primary">Calendario</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full flex justify-center p-4"
                modifiers={{
                  hasTask: (d) => tasks.some(t => isSameDay(new Date(t.dueDate), d))
                }}
                modifiersStyles={{
                  hasTask: { fontWeight: 'bold', color: 'var(--primary)' }
                }}
                locale={es}
              />
             </CardContent>
          </Card>
        </div>

        {/* Tasks Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold text-foreground capitalize" data-testid="text-selected-date">
              {date ? format(date, "MMMM do, yyyy", { locale: es }) : "Selecciona una fecha"}
            </h2>
            <span className="text-muted-foreground text-sm font-medium bg-secondary px-3 py-1 rounded-full" data-testid="text-day-task-count">
              {tasksForDay.length} Tareas
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tasksForDay.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl"
                  data-testid="text-no-tasks"
                >
                  <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p>No hay tareas para este día.</p>
                </motion.div>
              ) : (
                [...pendingTasks, ...completedTasks].map((task) => {
                  const category = categories.find(c => c.id === task.categoryId);
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                    >
                      <Card className={cn(
                        "group transition-all duration-200 border-none shadow-sm hover:shadow-md",
                        task.completed ? "opacity-60 bg-secondary/50" : "bg-card"
                      )} data-testid={`card-home-task-${task.id}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <button
                            onClick={() => handleToggle(task.id, task.completed)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                              task.completed
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30 hover:border-primary"
                            )}
                            data-testid={`button-toggle-home-task-${task.id}`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium truncate transition-all",
                              task.completed && "line-through text-muted-foreground"
                            )} data-testid={`text-home-task-title-${task.id}`}>
                              {task.title}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{format(new Date(task.dueDate), "HH:mm")}</span>
                              </div>
                              {category && (
                                <span className={cn("px-2 py-0.5 rounded-md text-xs", category.color)}>
                                  {category.name}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleDelete(task.id)}
                            data-testid={`button-delete-home-task-${task.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

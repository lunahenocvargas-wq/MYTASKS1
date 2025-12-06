import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowLeft, CalendarIcon, Clock, Trash2, Tag, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useCategory, useTasks, useUpdateTask, useDeleteTask } from "@/lib/hooks";

export default function FolderDetail() {
  const [, params] = useRoute("/folders/:id");
  const folderId = params?.id || "";
  
  const { data: folder, isLoading: folderLoading } = useCategory(folderId);
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const tasks = allTasks.filter((t) => t.categoryId === folderId);
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleToggle = (id: string, completed: boolean) => {
    updateTask.mutate({ id, data: { completed: !completed } });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  if (folderLoading || tasksLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Carpeta No Encontrada</h2>
        <Link href="/folders">
          <Button variant="link" className="mt-2">Volver a Carpetas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/folders">
          <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-back-to-folders">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3" data-testid="text-folder-detail-name">
            <span className={cn("w-4 h-4 rounded-full", folder.color.split(' ')[0])} />
            {folder.name}
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-folder-task-count">
            {tasks.length} tareas en esta carpeta
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {sortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
            >
              <Card className={cn(
                "group hover:border-primary/50 transition-colors border-l-4",
                task.completed ? "border-l-muted bg-secondary/30" : "border-l-primary bg-card"
              )} data-testid={`card-folder-task-${task.id}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleToggle(task.id, task.completed)}
                      className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                        task.completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 hover:border-primary"
                      )}
                      data-testid={`button-toggle-folder-task-${task.id}`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-medium text-lg transition-all",
                        task.completed && "line-through text-muted-foreground"
                      )} data-testid={`text-folder-task-title-${task.id}`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 capitalize">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {format(new Date(task.dueDate), "MMM d, yyyy", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(task.dueDate), "h:mm a")}
                        </span>
                        <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold", folder.color)}>
                            <Tag className="w-3 h-3" />
                            {folder.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => handleDelete(task.id)}
                    data-testid={`button-delete-folder-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl" data-testid="text-no-folder-tasks">
            <p>No hay tareas en esta carpeta aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}

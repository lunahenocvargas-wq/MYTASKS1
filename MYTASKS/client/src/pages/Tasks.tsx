import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CalendarIcon, Plus, Trash2, Clock, Tag, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useCategories, useCreateTask, useUpdateTask, useDeleteTask } from "@/lib/hooks";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  dueDate: z.date(),
  time: z.string(),
  categoryId: z.string().optional(),
});

export default function Tasks() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: categories = [] } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      dueDate: new Date(),
      time: "12:00",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const [hours, minutes] = values.time.split(':').map(Number);
    const date = new Date(values.dueDate);
    date.setHours(hours, minutes);

    createTask.mutate({
      title: values.title,
      dueDate: date,
      completed: false,
      categoryId: values.categoryId === "none" || !values.categoryId ? null : values.categoryId,
      description: null,
    });
    setIsOpen(false);
    form.reset();
  }

  const handleToggle = (id: string, completed: boolean) => {
    updateTask.mutate({ id, data: { completed: !completed } });
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id);
  };

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (tasksLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Todas las Tareas</h1>
          <p className="text-muted-foreground mt-1">Gestiona todas tus próximas entregas.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" data-testid="button-new-task">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Tarea</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Tarea</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. Estudiar Física" {...field} data-testid="input-task-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-select-date"
                              >
                                {field.value ? (
                                  format(field.value, "d MMM", { locale: es })
                                ) : (
                                  <span>Elige fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} data-testid="input-task-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carpeta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-task-category">
                            <SelectValue placeholder="Sin carpeta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin carpeta</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-save-task">Añadir Tarea</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => {
            const category = categories.find(c => c.id === task.categoryId);
            const dueDate = new Date(task.dueDate);
            const isOverdue = dueDate < new Date() && !task.completed;
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4",
                    task.completed ? "opacity-60 border-l-green-500" : 
                    isOverdue ? "border-l-red-500" : "border-l-primary"
                  )}
                  data-testid={`card-task-${task.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggle(task.id, task.completed)}
                        className={cn(
                          "flex-shrink-0 mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          task.completed 
                            ? "bg-green-500 border-green-500" 
                            : "border-muted-foreground/40 hover:border-primary"
                        )}
                        data-testid={`button-toggle-task-${task.id}`}
                      >
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium text-lg mb-2",
                          task.completed && "line-through text-muted-foreground"
                        )} data-testid={`text-task-title-${task.id}`}>
                          {task.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{format(dueDate, "d MMM", { locale: es })}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(dueDate, "HH:mm")}</span>
                          </div>
                          
                          {category && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              <span className={cn("px-2 py-0.5 rounded-md text-xs", category.color)}>
                                {category.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => handleDelete(task.id)}
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay tareas aún. ¡Crea tu primera tarea!</p>
          </div>
        )}
      </div>
    </div>
  );
}

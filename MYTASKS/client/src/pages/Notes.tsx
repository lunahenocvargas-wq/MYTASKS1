import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/lib/hooks";
import type { Note } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
});

export default function Notes() {
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "low",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingId) {
      updateNote.mutate({ id: editingId, data: values });
    } else {
      createNote.mutate(values);
    }
    setIsOpen(false);
    setEditingId(null);
    form.reset();
  }

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    form.reset({ title: note.title, content: note.content, priority: note.priority as 'low' | 'medium' | 'high' });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset({ title: "", content: "", priority: "low" });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate(id);
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  const priorityLabels = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-heading font-bold">Notas</h1>
           <p className="text-muted-foreground mt-1">Captura tus pensamientos e ideas.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" onClick={handleCreate} data-testid="button-new-note">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Nota" : "Crear Nueva Nota"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título de la nota..." {...field} data-testid="input-note-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-note-priority">
                            <SelectValue placeholder="Selecciona prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Prioridad Baja</SelectItem>
                          <SelectItem value="medium">Prioridad Media</SelectItem>
                          <SelectItem value="high">Prioridad Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe tu nota aquí..." 
                          className="min-h-[200px] resize-none"
                          {...field} 
                          data-testid="textarea-note-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-save-note">{editingId ? "Guardar Cambios" : "Crear Nota"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="group hover:shadow-lg transition-all duration-300 border-none bg-card" data-testid={`card-note-${note.id}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2 mb-2" data-testid={`text-note-title-${note.id}`}>
                  {note.title}
                </CardTitle>
                <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border", priorityColors[note.priority as keyof typeof priorityColors])}>
                  <AlertCircle className="w-3 h-3" />
                  {priorityLabels[note.priority as keyof typeof priorityLabels]}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground text-sm line-clamp-4 whitespace-pre-wrap" data-testid={`text-note-content-${note.id}`}>
                {note.content || "Sin contenido"}
              </p>
            </CardContent>
            
            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground" data-testid={`text-note-updated-${note.id}`}>
                {format(new Date(note.updatedAt), "d MMM yyyy", { locale: es })}
              </p>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleEdit(note)}
                  data-testid={`button-edit-note-${note.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(note.id)}
                  data-testid={`button-delete-note-${note.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {notes.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground" data-testid="text-no-notes">
            <p>No hay notas aún. ¡Crea tu primera nota!</p>
          </div>
        )}
      </div>
    </div>
  );
}

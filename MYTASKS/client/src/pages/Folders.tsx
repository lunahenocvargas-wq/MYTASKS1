import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, MoreVertical, Plus, Trash2, Edit2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useTasks } from "@/lib/hooks";
import type { Category } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string(),
});

const colors = [
  { label: 'Azul', value: 'bg-blue-100 text-blue-700' },
  { label: 'Verde', value: 'bg-green-100 text-green-700' },
  { label: 'Rojo', value: 'bg-red-100 text-red-700' },
  { label: 'Morado', value: 'bg-purple-100 text-purple-700' },
  { label: 'Naranja', value: 'bg-orange-100 text-orange-700' },
  { label: 'Rosa', value: 'bg-pink-100 text-pink-700' },
  { label: 'Turquesa', value: 'bg-teal-100 text-teal-700' },
  { label: 'Amarillo', value: 'bg-yellow-100 text-yellow-700' },
];

export default function Folders() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: tasks = [] } = useTasks();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: colors[0].value,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingId) {
      updateCategory.mutate({ id: editingId, data: values });
    } else {
      createCategory.mutate({ ...values, icon: null });
    }
    setIsOpen(false);
    setEditingId(null);
    form.reset();
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    form.reset({ name: category.name, color: category.color });
    setIsOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.reset({ name: "", color: colors[0].value });
    setIsOpen(true);
  }

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-heading font-bold">Carpetas</h1>
           <p className="text-muted-foreground mt-1">Organiza tus tareas por categorías.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20" onClick={handleCreate} data-testid="button-new-folder">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Carpeta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Carpeta" : "Crear Nueva Carpeta"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Carpeta</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. Trabajo" {...field} data-testid="input-folder-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema de Color</FormLabel>
                      <div className="grid grid-cols-4 gap-3 mt-2">
                        {colors.map((color) => (
                          <div
                            key={color.value}
                            className={cn(
                              "h-10 rounded-lg cursor-pointer transition-all border-2",
                              color.value,
                              field.value === color.value ? "border-foreground scale-110 shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                            )}
                            onClick={() => field.onChange(color.value)}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-save-folder">{editingId ? "Guardar Cambios" : "Crear Carpeta"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const taskCount = tasks.filter(t => t.categoryId === category.id && !t.completed).length;
          
          return (
            <Card key={category.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-none bg-card" data-testid={`card-folder-${category.id}`}>
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", category.color)} />
              
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <Link href={`/folders/${category.id}`}>
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", category.color)}>
                     <Folder className="w-6 h-6" />
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" data-testid={`button-folder-menu-${category.id}`}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(category)} data-testid={`menu-edit-${category.id}`}>
                      <Edit2 className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(category.id)} data-testid={`menu-delete-${category.id}`}>
                      <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent>
                <Link href={`/folders/${category.id}`}>
                  <div className="cursor-pointer">
                    <CardTitle className="mb-2 text-xl" data-testid={`text-folder-name-${category.id}`}>{category.name}</CardTitle>
                    <p className="text-muted-foreground font-medium" data-testid={`text-task-count-${category.id}`}>
                      {taskCount} tareas pendientes
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

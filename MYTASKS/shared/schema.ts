import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'set null' }),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull().default('medium'),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, updatedAt: true });

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;

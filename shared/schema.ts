import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organization hierarchy tables
export const districts = pgTable("districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clusters = pgTable("clusters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  districtId: varchar("district_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  clusterId: varchar("cluster_id").notNull(),
  districtId: varchar("district_id").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // CEO, DEO, DDEO, AEO, HEAD_TEACHER, TEACHER
  schoolId: varchar("school_id"),
  schoolName: text("school_name"),
  clusterId: varchar("cluster_id"),
  districtId: varchar("district_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dataRequests = pgTable("data_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdByRole: text("created_by_role").notNull(),
  createdBySchoolId: varchar("created_by_school_id"),
  createdByClusterId: varchar("created_by_cluster_id"),
  createdByDistrictId: varchar("created_by_district_id"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("active"), // draft, active, completed
  isArchived: boolean("is_archived").notNull().default(false),
  dueDate: timestamp("due_date").notNull(),
  fields: json("fields").notNull(), // JSON array of field definitions
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const requestAssignees = pgTable("request_assignees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  schoolId: varchar("school_id"),
  schoolName: text("school_name"),
  status: text("status").notNull().default("pending"), // pending, completed, overdue
  fieldResponses: json("field_responses").notNull(), // JSON array of responses
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Organization insert schemas
export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
});

export const insertClusterSchema = createInsertSchema(clusters).omit({
  id: true,
  createdAt: true,
});

export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDataRequestSchema = createInsertSchema(dataRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRequestAssigneeSchema = createInsertSchema(requestAssignees).omit({
  id: true,
  createdAt: true,
});

// Organization types
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type District = typeof districts.$inferSelect;
export type InsertCluster = z.infer<typeof insertClusterSchema>;
export type Cluster = typeof clusters.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schools.$inferSelect;

// User types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDataRequest = z.infer<typeof insertDataRequestSchema>;
export type DataRequest = typeof dataRequests.$inferSelect;
export type InsertRequestAssignee = z.infer<typeof insertRequestAssigneeSchema>;
export type RequestAssignee = typeof requestAssignees.$inferSelect;

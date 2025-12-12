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
  emisNumber: text("emis_number").notNull().unique(),
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
  // Profile fields
  fatherName: text("father_name"),
  spouseName: text("spouse_name"),
  email: text("email"),
  residentialAddress: text("residential_address"),
  cnic: text("cnic"),
  dateOfBirth: date("date_of_birth"),
  dateOfJoining: date("date_of_joining"),
  qualification: text("qualification"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  // Google Sheet attachments
  schoolSheetUrl: text("school_sheet_url"), // CSV download URL for individual school sheets
  aggregatedSheetUrl: text("aggregated_sheet_url"), // CSV download URL for aggregated data
  sheetGeneratedAt: timestamp("sheet_generated_at"), // When sheets were generated
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

// Teacher leaves table
export const teacherLeaves = pgTable("teacher_leaves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull(),
  schoolId: varchar("school_id").notNull(),
  schoolName: text("school_name").notNull(),
  leaveType: text("leave_type").notNull(), // sick, casual, earned, special
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  numberOfDays: integer("number_of_days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  evidenceUrl: text("evidence_url"), // URL to uploaded photo evidence
  evidenceFileName: text("evidence_file_name"),
  approvedBy: varchar("approved_by"),
  approvedByName: text("approved_by_name"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Queries/tickets table
export const queries = pgTable("queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  senderSchoolId: varchar("sender_school_id"),
  senderSchoolName: text("sender_school_name"),
  recipientId: varchar("recipient_id").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientRole: text("recipient_role").notNull(),
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  category: text("category"), // general, leave, infrastructure, complaint, etc.
  attachmentUrl: text("attachment_url"),
  attachmentFileName: text("attachment_file_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Query responses table (for threading)
export const queryResponses = pgTable("query_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryId: varchar("query_id").notNull().references(() => queries.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentFileName: text("attachment_file_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // request, query, leave, update, system
  priority: text("priority").notNull().default("medium"), // low, medium, high
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"), // URL to navigate when clicked
  relatedId: varchar("related_id"), // ID of related entity (request, query, etc.)
  createdBy: varchar("created_by"),
  createdByName: text("created_by_name"),
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

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQueryResponseSchema = createInsertSchema(queryResponses).omit({
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
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;
export type InsertQueryResponse = z.infer<typeof insertQueryResponseSchema>;
export type QueryResponse = typeof queryResponses.$inferSelect;

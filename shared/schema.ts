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
  // Attendance tracking
  totalStudents: integer("total_students").default(0),
  presentStudents: integer("present_students").default(0),
  absentStudents: integer("absent_students").default(0),
  totalTeachers: integer("total_teachers").default(0),
  presentTeachers: integer("present_teachers").default(0),
  absentTeachers: integer("absent_teachers").default(0),
  // Infrastructure tracking
  totalToilets: integer("total_toilets").default(0),
  workingToilets: integer("working_toilets").default(0),
  brokenToilets: integer("broken_toilets").default(0),
  isDrinkingWaterAvailable: boolean("is_drinking_water_available").default(false),
  // Inventory tracking (example assets)
  desksNew: integer("desks_new").default(0),
  desksInUse: integer("desks_in_use").default(0),
  desksBroken: integer("desks_broken").default(0),
  fansNew: integer("fans_new").default(0),
  fansInUse: integer("fans_in_use").default(0),
  fansBroken: integer("fans_broken").default(0),
  chairsNew: integer("chairs_new").default(0),
  chairsInUse: integer("chairs_in_use").default(0),
  chairsBroken: integer("chairs_broken").default(0),
  blackboardsNew: integer("blackboards_new").default(0),
  blackboardsInUse: integer("blackboards_in_use").default(0),
  blackboardsBroken: integer("blackboards_broken").default(0),
  computersNew: integer("computers_new").default(0),
  computersInUse: integer("computers_in_use").default(0),
  computersBroken: integer("computers_broken").default(0),
  // Last updated timestamp for tracking
  dataLastUpdated: timestamp("data_last_updated"),
  // GPS location
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // CEO, DEO, DDEO, AEO, HEAD_TEACHER, TEACHER, COACH
  status: text("status").notNull().default("active"), // pending, active, restricted
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
  // AEO assigned schools (array of school IDs)
  assignedSchools: json("assigned_schools").$type<string[]>().default([]),
  // AEO markaz name
  markaz: text("markaz"),
  // Approval workflow fields
  approverRole: text("approver_role"), // Role that should approve this account (DEO, DDEO, AEO, HEAD_TEACHER)
  approverId: varchar("approver_id"), // ID of user who approved this account
  approvedAt: timestamp("approved_at"), // When the account was approved
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
  // Voice note attachment for description
  descriptionVoiceUrl: text("description_voice_url"),
  descriptionVoiceFileName: text("description_voice_file_name"),
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

// Voice Recordings table - stores audio files for data requests
export const voiceRecordings = pgTable("voice_recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id"), // Linked data request (optional)
  assigneeId: varchar("assignee_id"), // Linked assignee response (optional)
  fieldId: varchar("field_id"), // Field the recording is for (optional)
  userId: varchar("user_id").notNull(), // User who created the recording
  userName: text("user_name").notNull(),
  language: text("language").notNull().default("en-US"), // en-US or ur-PK
  transcription: text("transcription"), // Speech-to-text result
  audioData: text("audio_data"), // Base64 encoded audio data
  audioMimeType: text("audio_mime_type").default("audio/webm"),
  durationSeconds: integer("duration_seconds").default(0),
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

// Visit Logs table - tracks AEO visits to schools
export const visitLogs = pgTable("visit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  schoolName: text("school_name").notNull(),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  visitStartTime: timestamp("visit_start_time").notNull(),
  visitEndTime: timestamp("visit_end_time"),
  isActive: boolean("is_active").notNull().default(true), // True when AEO is currently on-site
  notes: text("notes"), // Optional visit notes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// School Albums table - persistent storage for school activities
export const schoolAlbums = pgTable("school_albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  schoolName: text("school_name").notNull(),
  title: text("title").notNull(), // Tag for grouping (e.g., "Plantation Day")
  description: text("description"),
  createdBy: varchar("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdByRole: text("created_by_role").notNull(),
  isGlobalBroadcast: boolean("is_global_broadcast").notNull().default(false), // True if created by DEO/DDEO/AEO
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Album Photos table - stores individual photos with captions
export const albumPhotos = pgTable("album_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => schoolAlbums.id, { onDelete: "cascade" }),
  photoUrl: text("photo_url").notNull(), // URL to uploaded photo
  photoFileName: text("photo_file_name").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Album Comments table - comments on activities
export const albumComments = pgTable("album_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => schoolAlbums.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Album Reactions table - emoji reactions to activities
export const albumReactions = pgTable("album_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => schoolAlbums.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  reactionType: text("reaction_type").notNull(), // like, love, clap, celebrate
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Announcements table - district-wide alerts
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdByName: text("created_by_name").notNull(),
  createdByRole: text("created_by_role").notNull(),
  districtId: varchar("district_id"), // If district-specific
  isActive: boolean("is_active").notNull().default(true), // Can be deactivated
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration date
});

// Monitoring Visits table - school monitoring visits by AEO
export const monitoringVisits = pgTable("monitoring_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  schoolId: varchar("school_id").notNull(),
  schoolName: text("school_name").notNull(),
  markaz: text("markaz"),
  visitDate: text("visit_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureTime: text("departure_time").notNull(),
  teacherTotal: integer("teacher_total").notNull().default(0),
  teacherPresent: integer("teacher_present").notNull().default(0),
  teacherPercentage: integer("teacher_percentage").notNull().default(0),
  headTeacherStatus: text("head_teacher_status").notNull().default("yes"),
  studentTotal: integer("student_total").notNull().default(0),
  studentPresent: integer("student_present").notNull().default(0),
  studentPercentage: integer("student_percentage").notNull().default(0),
  furnitureTotal: integer("furniture_total").notNull().default(0),
  furnitureWith: integer("furniture_with").notNull().default(0),
  furnitureWithout: integer("furniture_without").notNull().default(0),
  classroomObservation: text("classroom_observation").notNull().default("good"),
  lndEnglishPercent: integer("lnd_english_percent").notNull().default(0),
  lndUrduPercent: integer("lnd_urdu_percent").notNull().default(0),
  lndMathsPercent: integer("lnd_maths_percent").notNull().default(0),
  nsbAllocation: integer("nsb_allocation").notNull().default(0),
  nsbExpenditure: integer("nsb_expenditure").notNull().default(0),
  nsbBalance: integer("nsb_balance").notNull().default(0),
  nsbUtilizationPercent: integer("nsb_utilization_percent").notNull().default(0),
  toiletStudentTotal: integer("toilet_student_total").notNull().default(0),
  toiletTotal: integer("toilet_total").notNull().default(0),
  toiletRequired: integer("toilet_required").notNull().default(0),
  drinkingWater: text("drinking_water").notNull().default("available"),
  hygieneWashrooms: text("hygiene_washrooms").notNull().default("good"),
  hygieneBuilding: text("hygiene_building").notNull().default("good"),
  hygieneClassrooms: text("hygiene_classrooms").notNull().default("good"),
  retentionTotal: integer("retention_total").notNull().default(0),
  retentionRetained: integer("retention_retained").notNull().default(0),
  retentionDropped: integer("retention_dropped").notNull().default(0),
  partialFacilityTypes: text("partial_facility_types"),
  partialFacilityReason: text("partial_facility_reason"),
  dataHealthVariation: integer("data_health_variation").notNull().default(0),
  generalRemarks: text("general_remarks"),
  headTeacherSignature: boolean("head_teacher_signature").notNull().default(false),
  aeoSignature: boolean("aeo_signature").notNull().default(false),
  evidence: json("evidence").$type<{ id: string; name: string; type: string; url: string }[]>().default([]),
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Mentoring Visits table - teacher mentoring visits by AEO
export const mentoringVisits = pgTable("mentoring_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  schoolId: varchar("school_id"),
  schoolName: text("school_name").notNull(),
  visitDate: text("visit_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureTime: text("departure_time").notNull(),
  classObserved: text("class_observed"),
  teacherName: text("teacher_name"),
  subject: text("subject"),
  indicators: json("indicators").$type<{ id: string; name: string; rating: string | null; rubricText: string; examples: string }[]>().default([]),
  generalFeedback: text("general_feedback"),
  strengthsObserved: text("strengths_observed"),
  areasForImprovement: text("areas_for_improvement"),
  actionItems: text("action_items"),
  evidence: json("evidence").$type<{ id: string; name: string; type: string; url: string }[]>().default([]),
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Office Visits table - office/admin visits by AEO
export const officeVisits = pgTable("office_visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  visitDate: text("visit_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureTime: text("departure_time").notNull(),
  purpose: text("purpose"),
  activitiesCompleted: json("activities_completed").$type<Record<string, boolean | string>>().default({}),
  comments: text("comments"),
  evidence: json("evidence").$type<{ id: string; name: string; type: string; url: string }[]>().default([]),
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Other Activities table - miscellaneous activities by AEO
export const otherActivities = pgTable("other_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  activityType: text("activity_type").notNull(),
  activityDate: text("activity_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  description: text("description"),
  comments: text("comments"),
  evidence: json("evidence").$type<{ id: string; name: string; type: string; url: string }[]>().default([]),
  status: text("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Visit Sessions table - GPS-tracked school visits
export const visitSessions = pgTable("visit_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aeoId: varchar("aeo_id").notNull(),
  aeoName: text("aeo_name").notNull(),
  schoolId: varchar("school_id"),
  schoolName: text("school_name").notNull(),
  // Start tracking
  startTimestamp: timestamp("start_timestamp").notNull().defaultNow(),
  startLatitude: text("start_latitude"),
  startLongitude: text("start_longitude"),
  startLocationSource: text("start_location_source").notNull().default("auto"), // auto, manual
  // End tracking
  endTimestamp: timestamp("end_timestamp"),
  endLatitude: text("end_latitude"),
  endLongitude: text("end_longitude"),
  endLocationSource: text("end_location_source"), // auto, manual
  // Status and metadata
  status: text("status").notNull().default("in_progress"), // in_progress, completed, cancelled
  notes: text("notes"),
  // Linked forms
  monitoringVisitId: varchar("monitoring_visit_id"),
  mentoringVisitId: varchar("mentoring_visit_id"),
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

export const insertVoiceRecordingSchema = createInsertSchema(voiceRecordings).omit({
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

export const insertVisitLogSchema = createInsertSchema(visitLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSchoolAlbumSchema = createInsertSchema(schoolAlbums).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumPhotoSchema = createInsertSchema(albumPhotos).omit({
  id: true,
  uploadedAt: true,
});

export const insertAlbumCommentSchema = createInsertSchema(albumComments).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumReactionSchema = createInsertSchema(albumReactions).omit({
  id: true,
  createdAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const insertMonitoringVisitSchema = createInsertSchema(monitoringVisits).omit({
  id: true,
  createdAt: true,
});

export const insertMentoringVisitSchema = createInsertSchema(mentoringVisits).omit({
  id: true,
  createdAt: true,
});

export const insertOfficeVisitSchema = createInsertSchema(officeVisits).omit({
  id: true,
  createdAt: true,
});

export const insertOtherActivitySchema = createInsertSchema(otherActivities).omit({
  id: true,
  createdAt: true,
});

export const insertVisitSessionSchema = createInsertSchema(visitSessions).omit({
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
export type InsertVoiceRecording = z.infer<typeof insertVoiceRecordingSchema>;
export type VoiceRecording = typeof voiceRecordings.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;
export type InsertQueryResponse = z.infer<typeof insertQueryResponseSchema>;
export type QueryResponse = typeof queryResponses.$inferSelect;
export type InsertVisitLog = z.infer<typeof insertVisitLogSchema>;
export type VisitLog = typeof visitLogs.$inferSelect;
export type InsertSchoolAlbum = z.infer<typeof insertSchoolAlbumSchema>;
export type SchoolAlbum = typeof schoolAlbums.$inferSelect;
export type InsertAlbumPhoto = z.infer<typeof insertAlbumPhotoSchema>;
export type AlbumPhoto = typeof albumPhotos.$inferSelect;
export type InsertAlbumComment = z.infer<typeof insertAlbumCommentSchema>;
export type AlbumComment = typeof albumComments.$inferSelect;
export type InsertAlbumReaction = z.infer<typeof insertAlbumReactionSchema>;
export type AlbumReaction = typeof albumReactions.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertMonitoringVisit = z.infer<typeof insertMonitoringVisitSchema>;
export type MonitoringVisit = typeof monitoringVisits.$inferSelect;
export type InsertMentoringVisit = z.infer<typeof insertMentoringVisitSchema>;
export type MentoringVisit = typeof mentoringVisits.$inferSelect;
export type InsertOfficeVisit = z.infer<typeof insertOfficeVisitSchema>;
export type OfficeVisit = typeof officeVisits.$inferSelect;
export type InsertOtherActivity = z.infer<typeof insertOtherActivitySchema>;
export type OtherActivity = typeof otherActivities.$inferSelect;
export type InsertVisitSession = z.infer<typeof insertVisitSessionSchema>;
export type VisitSession = typeof visitSessions.$inferSelect;

// Push notification subscriptions
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  featureType: text("feature_type").notNull(), // 'lesson_plans', 'data_requests', etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true });
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

import { db } from "./db";
import { users, dataRequests, requestAssignees, voiceRecordings, districts, clusters, schools, notifications, queries, queryResponses, visitLogs, schoolAlbums, albumPhotos, albumComments, albumReactions, announcements, monitoringVisits, mentoringVisits, officeVisits, otherActivities, visitSessions } from "@shared/schema";
import type {
  InsertUser, User, InsertDataRequest, DataRequest, InsertRequestAssignee, RequestAssignee,
  InsertVoiceRecording, VoiceRecording,
  InsertDistrict, District, InsertCluster, Cluster, InsertSchool, School,
  InsertNotification, Notification, InsertQuery, Query, InsertQueryResponse, QueryResponse,
  InsertVisitLog, VisitLog, InsertSchoolAlbum, SchoolAlbum, InsertAlbumPhoto, AlbumPhoto,
  InsertAlbumComment, AlbumComment, InsertAlbumReaction, AlbumReaction, InsertAnnouncement, Announcement,
  InsertMonitoringVisit, MonitoringVisit, InsertMentoringVisit, MentoringVisit,
  InsertOfficeVisit, OfficeVisit, InsertOtherActivity, OtherActivity,
  InsertVisitSession, VisitSession
} from "@shared/schema";
import { eq, and, or, inArray, desc } from "drizzle-orm";

export interface IStorage {
  // District operations
  getAllDistricts(): Promise<District[]>;
  getDistrict(id: string): Promise<District | undefined>;
  createDistrict(district: InsertDistrict): Promise<District>;
  updateDistrict(id: string, updates: Partial<District>): Promise<District>;
  deleteDistrict(id: string): Promise<void>;

  // Cluster operations
  getAllClusters(): Promise<Cluster[]>;
  getClustersByDistrict(districtId: string): Promise<Cluster[]>;
  getCluster(id: string): Promise<Cluster | undefined>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;
  updateCluster(id: string, updates: Partial<Cluster>): Promise<Cluster>;
  deleteCluster(id: string): Promise<void>;

  // School operations
  getAllSchools(): Promise<School[]>;
  getSchoolsByCluster(clusterId: string): Promise<School[]>;
  getSchoolsByDistrict(districtId: string): Promise<School[]>;
  getSchool(id: string): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: string, updates: Partial<School>): Promise<School>;
  deleteSchool(id: string): Promise<void>;

  // User operations
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByStatus(status: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // School operations
  getSchoolByEmis(emisNumber: string): Promise<School | undefined>;
  
  // Data request operations
  createDataRequest(request: InsertDataRequest): Promise<DataRequest>;
  getDataRequest(id: string): Promise<DataRequest | undefined>;
  getDataRequestsForUser(userId: string, userRole: string, userSchoolId?: string, userClusterId?: string, userDistrictId?: string): Promise<DataRequest[]>;
  updateDataRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest>;
  deleteDataRequest(id: string): Promise<void>;
  generateRequestSheets(requestId: string): Promise<{ schoolSheetUrl: string; aggregatedSheetUrl: string }>;
  
  // Request assignee operations
  createRequestAssignee(assignee: InsertRequestAssignee): Promise<RequestAssignee>;
  getRequestAssignees(requestId: string): Promise<RequestAssignee[]>;
  updateRequestAssignee(id: string, updates: Partial<RequestAssignee>): Promise<RequestAssignee>;

  // Voice recording operations
  createVoiceRecording(recording: InsertVoiceRecording): Promise<VoiceRecording>;
  getVoiceRecording(id: string): Promise<VoiceRecording | undefined>;
  getVoiceRecordingsByRequest(requestId: string): Promise<VoiceRecording[]>;
  deleteVoiceRecording(id: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;

  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getQuery(id: string): Promise<Query | undefined>;
  getQueriesBySender(senderId: string): Promise<Query[]>;
  getQueriesByRecipient(recipientId: string): Promise<Query[]>;
  getAllQueries(): Promise<Query[]>;
  updateQueryStatus(id: string, status: string): Promise<Query>;

  // Query Response operations
  createQueryResponse(response: InsertQueryResponse): Promise<QueryResponse>;
  getQueryResponses(queryId: string): Promise<QueryResponse[]>;

  // Visit Log operations
  createVisitLog(visitLog: InsertVisitLog): Promise<VisitLog>;
  getActiveVisitForSchool(schoolId: string): Promise<VisitLog | undefined>;
  endVisit(visitId: string): Promise<VisitLog>;
  getVisitHistory(schoolId: string): Promise<VisitLog[]>;
  getLatestVisitForSchool(schoolId: string): Promise<VisitLog | undefined>;

  // School Album operations
  createAlbum(album: InsertSchoolAlbum): Promise<SchoolAlbum>;
  getAlbum(id: string): Promise<SchoolAlbum | undefined>;
  getAlbumsForSchool(schoolId: string): Promise<SchoolAlbum[]>;
  getAllGlobalBroadcasts(): Promise<SchoolAlbum[]>;
  getAllAlbums(): Promise<SchoolAlbum[]>;
  deleteAlbum(id: string): Promise<void>;

  // Album Photo operations
  addPhotoToAlbum(photo: InsertAlbumPhoto): Promise<AlbumPhoto>;
  getAlbumPhotos(albumId: string): Promise<AlbumPhoto[]>;
  deletePhoto(photoId: string): Promise<void>;

  // Album Comment operations
  addComment(comment: InsertAlbumComment): Promise<AlbumComment>;
  getAlbumComments(albumId: string): Promise<AlbumComment[]>;
  deleteComment(commentId: string): Promise<void>;

  // Album Reaction operations
  addReaction(reaction: InsertAlbumReaction): Promise<AlbumReaction>;
  removeReaction(albumId: string, userId: string, reactionType: string): Promise<void>;
  getAlbumReactions(albumId: string): Promise<AlbumReaction[]>;

  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(districtId?: string): Promise<Announcement[]>;
  deactivateAnnouncement(id: string): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  // Monitoring Visit operations
  createMonitoringVisit(visit: InsertMonitoringVisit): Promise<MonitoringVisit>;
  getMonitoringVisitsByAeo(aeoId: string): Promise<MonitoringVisit[]>;
  getAllMonitoringVisits(): Promise<MonitoringVisit[]>;

  // Mentoring Visit operations
  createMentoringVisit(visit: InsertMentoringVisit): Promise<MentoringVisit>;
  getMentoringVisitsByAeo(aeoId: string): Promise<MentoringVisit[]>;
  getAllMentoringVisits(): Promise<MentoringVisit[]>;

  // Office Visit operations
  createOfficeVisit(visit: InsertOfficeVisit): Promise<OfficeVisit>;
  getOfficeVisitsByAeo(aeoId: string): Promise<OfficeVisit[]>;
  getAllOfficeVisits(): Promise<OfficeVisit[]>;

  // Other Activity operations
  createOtherActivity(activity: InsertOtherActivity): Promise<OtherActivity>;
  getOtherActivitiesByAeo(aeoId: string): Promise<OtherActivity[]>;
  getAllOtherActivities(): Promise<OtherActivity[]>;

  // Visit Session operations (GPS tracking)
  createVisitSession(session: InsertVisitSession): Promise<VisitSession>;
  getVisitSession(id: string): Promise<VisitSession | undefined>;
  getActiveVisitSession(aeoId: string): Promise<VisitSession | undefined>;
  getVisitSessionsByAeo(aeoId: string): Promise<VisitSession[]>;
  getAllVisitSessions(): Promise<VisitSession[]>;
  updateVisitSession(id: string, updates: Partial<VisitSession>): Promise<VisitSession>;
  completeVisitSession(id: string, endData: { endLatitude?: string; endLongitude?: string; endLocationSource?: string }): Promise<VisitSession>;
  cancelVisitSession(id: string): Promise<VisitSession>;
}

export class DBStorage implements IStorage {
  // District operations
  async getAllDistricts(): Promise<District[]> {
    return await db.select().from(districts);
  }

  async getDistrict(id: string): Promise<District | undefined> {
    const result = await db.select().from(districts).where(eq(districts.id, id)).limit(1);
    return result[0];
  }

  async createDistrict(district: InsertDistrict): Promise<District> {
    const result = await db.insert(districts).values(district).returning();
    return result[0];
  }

  async updateDistrict(id: string, updates: Partial<District>): Promise<District> {
    const result = await db.update(districts).set(updates).where(eq(districts.id, id)).returning();
    return result[0];
  }

  async deleteDistrict(id: string): Promise<void> {
    await db.delete(districts).where(eq(districts.id, id));
  }

  // Cluster operations
  async getAllClusters(): Promise<Cluster[]> {
    return await db.select().from(clusters);
  }

  async getClustersByDistrict(districtId: string): Promise<Cluster[]> {
    return await db.select().from(clusters).where(eq(clusters.districtId, districtId));
  }

  async getCluster(id: string): Promise<Cluster | undefined> {
    const result = await db.select().from(clusters).where(eq(clusters.id, id)).limit(1);
    return result[0];
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const result = await db.insert(clusters).values(cluster).returning();
    return result[0];
  }

  async updateCluster(id: string, updates: Partial<Cluster>): Promise<Cluster> {
    const result = await db.update(clusters).set(updates).where(eq(clusters.id, id)).returning();
    return result[0];
  }

  async deleteCluster(id: string): Promise<void> {
    await db.delete(clusters).where(eq(clusters.id, id));
  }

  // School operations
  async getAllSchools(): Promise<School[]> {
    return await db.select().from(schools);
  }

  async getSchoolsByCluster(clusterId: string): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.clusterId, clusterId));
  }

  async getSchoolsByDistrict(districtId: string): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.districtId, districtId));
  }

  async getSchool(id: string): Promise<School | undefined> {
    const result = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
    return result[0];
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const result = await db.insert(schools).values(school).returning();
    return result[0];
  }

  async updateSchool(id: string, updates: Partial<School>): Promise<School> {
    const result = await db.update(schools).set(updates).where(eq(schools.id, id)).returning();
    return result[0];
  }

  async deleteSchool(id: string): Promise<void> {
    await db.delete(schools).where(eq(schools.id, id));
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const userValues = {
      ...user,
      assignedSchools: user.assignedSchools ? (Array.isArray(user.assignedSchools) ? user.assignedSchools : []) : []
    };
    const result = await db.insert(users).values(userValues as any).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, status));
  }

  async getSchoolByEmis(emisNumber: string): Promise<School | undefined> {
    const result = await db.select().from(schools).where(eq(schools.emisNumber, emisNumber)).limit(1);
    return result[0];
  }

  async createDataRequest(request: InsertDataRequest): Promise<DataRequest> {
    const result = await db.insert(dataRequests).values(request).returning();
    return result[0];
  }

  async getDataRequest(id: string): Promise<DataRequest | undefined> {
    const result = await db.select().from(dataRequests).where(eq(dataRequests.id, id)).limit(1);
    return result[0];
  }

  async getDataRequestsForUser(userId: string, userRole: string, userSchoolId?: string, userClusterId?: string, userDistrictId?: string): Promise<DataRequest[]> {
    const allRequests = await db.select().from(dataRequests).where(eq(dataRequests.isArchived, false));
    
    // Get all request IDs where the user is an assignee
    const userAssignments = await db.select().from(requestAssignees).where(eq(requestAssignees.userId, userId));
    const assignedRequestIds = new Set(userAssignments.map(a => a.requestId));
    
    return allRequests.filter((request: DataRequest) => {
      // Creator always sees their requests
      if (request.createdBy === userId) return true;
      
      // Assignee always sees requests assigned to them
      if (assignedRequestIds.has(request.id)) return true;
      
      // Hierarchy visibility: superiors see all requests in their jurisdiction
      const hierarchyLevels: Record<string, number> = {
        CEO: 5,
        DEO: 4,
        DDEO: 3,
        AEO: 3,
        HEAD_TEACHER: 2,
        TEACHER: 1,
      };
      
      const creatorHierarchy = hierarchyLevels[request.createdByRole] || 0;
      const userHierarchyLevel = hierarchyLevels[userRole] || 0;
      
      if (userHierarchyLevel > creatorHierarchy) {
        // User is higher in hierarchy - check jurisdiction match
        if (userRole === 'CEO') return true; // CEO sees everything
        if (userRole === 'DEO') {
          return userDistrictId === request.createdByDistrictId;
        }
        if (userRole === 'DDEO') {
          return userDistrictId === request.createdByDistrictId;
        }
        if (userRole === 'AEO') {
          return userClusterId === request.createdByClusterId;
        }
        if (userRole === 'HEAD_TEACHER') {
          return userSchoolId === request.createdBySchoolId;
        }
      }
      
      return false;
    });
  }

  async updateDataRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest> {
    const result = await db.update(dataRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dataRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteDataRequest(id: string): Promise<void> {
    await db.delete(dataRequests).where(eq(dataRequests.id, id));
  }

  async createRequestAssignee(assignee: InsertRequestAssignee): Promise<RequestAssignee> {
    const result = await db.insert(requestAssignees).values(assignee).returning();
    return result[0];
  }

  async getRequestAssignees(requestId: string): Promise<RequestAssignee[]> {
    return await db.select().from(requestAssignees).where(eq(requestAssignees.requestId, requestId));
  }

  async updateRequestAssignee(id: string, updates: Partial<RequestAssignee>): Promise<RequestAssignee> {
    const result = await db.update(requestAssignees)
      .set(updates)
      .where(eq(requestAssignees.id, id))
      .returning();
    return result[0];
  }

  // Voice recording operations
  async createVoiceRecording(recording: InsertVoiceRecording): Promise<VoiceRecording> {
    const result = await db.insert(voiceRecordings).values(recording).returning();
    return result[0];
  }

  async getVoiceRecording(id: string): Promise<VoiceRecording | undefined> {
    const result = await db.select().from(voiceRecordings).where(eq(voiceRecordings.id, id));
    return result[0];
  }

  async getVoiceRecordingsByRequest(requestId: string): Promise<VoiceRecording[]> {
    return await db.select().from(voiceRecordings).where(eq(voiceRecordings.requestId, requestId));
  }

  async deleteVoiceRecording(id: string): Promise<void> {
    await db.delete(voiceRecordings).where(eq(voiceRecordings.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    return result[0];
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Query operations
  async createQuery(query: InsertQuery): Promise<Query> {
    // Generate ticket number
    const existingQueries = await db.select().from(queries);
    const ticketNumber = `TKT-${String(existingQueries.length + 1).padStart(3, '0')}`;

    const [newQuery] = await db.insert(queries).values({
      ...query,
      ticketNumber,
    }).returning();
    return newQuery;
  }

  async getQuery(id: string): Promise<Query | undefined> {
    const [query] = await db.select().from(queries).where(eq(queries.id, id));
    return query;
  }

  async getQueriesBySender(senderId: string): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.senderId, senderId))
      .orderBy(desc(queries.createdAt));
  }

  async getQueriesByRecipient(recipientId: string): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.recipientId, recipientId))
      .orderBy(desc(queries.createdAt));
  }

  async getAllQueries(): Promise<Query[]> {
    return await db.select().from(queries).orderBy(desc(queries.createdAt));
  }

  async updateQueryStatus(id: string, status: string): Promise<Query> {
    const [updated] = await db
      .update(queries)
      .set({ status, updatedAt: new Date() })
      .where(eq(queries.id, id))
      .returning();
    return updated;
  }

  // Query Response operations
  async createQueryResponse(response: InsertQueryResponse): Promise<QueryResponse> {
    const [newResponse] = await db.insert(queryResponses).values(response).returning();

    // Update query status to in_progress when a response is added
    await db
      .update(queries)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(queries.id, response.queryId));

    return newResponse;
  }

  async getQueryResponses(queryId: string): Promise<QueryResponse[]> {
    return await db
      .select()
      .from(queryResponses)
      .where(eq(queryResponses.queryId, queryId))
      .orderBy(queryResponses.createdAt);
  }

  // Generate Google Sheets from request responses
  async generateRequestSheets(requestId: string): Promise<{ schoolSheetUrl: string; aggregatedSheetUrl: string }> {
    // Get the data request
    const request = await this.getDataRequest(requestId);
    if (!request) throw new Error('Request not found');

    // Get all assignees with their responses
    const assignees = await this.getRequestAssignees(requestId);
    const completedAssignees = assignees.filter(a => a.status === 'completed');

    if (completedAssignees.length === 0) {
      throw new Error('No completed responses found');
    }

    // Parse field definitions
    const fields = request.fields as any[];

    // Group responses by school
    const responsesBySchool: { [schoolId: string]: any[] } = {};
    completedAssignees.forEach(assignee => {
      const schoolId = assignee.schoolId || 'unknown';
      if (!responsesBySchool[schoolId]) {
        responsesBySchool[schoolId] = [];
      }
      responsesBySchool[schoolId].push({
        userName: assignee.userName,
        userRole: assignee.userRole,
        schoolName: assignee.schoolName,
        responses: assignee.fieldResponses as any[],
        submittedAt: assignee.submittedAt,
      });
    });

    // Generate CSV headers
    const headers = ['Teacher Name', 'Role', 'School', ...fields.map((f: any) => f.label), 'Submitted At'];

    // Generate school-level CSV (for head teacher)
    const schoolCsvRows = [headers.join(',')];
    Object.entries(responsesBySchool).forEach(([schoolId, responses]) => {
      responses.forEach(resp => {
        const row = [
          `"${resp.userName}"`,
          resp.userRole,
          `"${resp.schoolName}"`,
          ...fields.map((f: any) => {
            const response = resp.responses.find((r: any) => r.fieldId === f.id);
            return response ? `"${response.value}"` : '';
          }),
          resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : '',
        ];
        schoolCsvRows.push(row.join(','));
      });
    });
    const schoolCsv = schoolCsvRows.join('\n');

    // Generate aggregated CSV (for upper management)
    const aggregatedCsvRows = [headers.join(',')];
    completedAssignees.forEach(assignee => {
      const responses = assignee.fieldResponses as any[];
      const row = [
        `"${assignee.userName}"`,
        assignee.userRole,
        `"${assignee.schoolName || 'N/A'}"`,
        ...fields.map((f: any) => {
          const response = responses.find((r: any) => r.fieldId === f.id);
          return response ? `"${response.value}"` : '';
        }),
        assignee.submittedAt ? new Date(assignee.submittedAt).toLocaleString() : '',
      ];
      aggregatedCsvRows.push(row.join(','));
    });
    const aggregatedCsv = aggregatedCsvRows.join('\n');

    // For now, return data URLs (in production, upload to cloud storage)
    const schoolSheetUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(schoolCsv)}`;
    const aggregatedSheetUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(aggregatedCsv)}`;

    // Update the request with sheet URLs
    await this.updateDataRequest(requestId, {
      schoolSheetUrl,
      aggregatedSheetUrl,
      sheetGeneratedAt: new Date(),
    });

    return { schoolSheetUrl, aggregatedSheetUrl };
  }

  // Visit Log operations
  async createVisitLog(visitLog: InsertVisitLog): Promise<VisitLog> {
    const result = await db.insert(visitLogs).values(visitLog).returning();
    return result[0];
  }

  async getActiveVisitForSchool(schoolId: string): Promise<VisitLog | undefined> {
    const result = await db.select()
      .from(visitLogs)
      .where(and(eq(visitLogs.schoolId, schoolId), eq(visitLogs.isActive, true)))
      .limit(1);
    return result[0];
  }

  async endVisit(visitId: string): Promise<VisitLog> {
    const result = await db.update(visitLogs)
      .set({ visitEndTime: new Date(), isActive: false })
      .where(eq(visitLogs.id, visitId))
      .returning();
    return result[0];
  }

  async getVisitHistory(schoolId: string): Promise<VisitLog[]> {
    return await db.select()
      .from(visitLogs)
      .where(eq(visitLogs.schoolId, schoolId))
      .orderBy(desc(visitLogs.visitStartTime));
  }

  async getLatestVisitForSchool(schoolId: string): Promise<VisitLog | undefined> {
    const result = await db.select()
      .from(visitLogs)
      .where(eq(visitLogs.schoolId, schoolId))
      .orderBy(desc(visitLogs.visitStartTime))
      .limit(1);
    return result[0];
  }

  // School Album operations
  async createAlbum(album: InsertSchoolAlbum): Promise<SchoolAlbum> {
    const result = await db.insert(schoolAlbums).values(album).returning();
    return result[0];
  }

  async getAlbum(id: string): Promise<SchoolAlbum | undefined> {
    const result = await db.select().from(schoolAlbums).where(eq(schoolAlbums.id, id)).limit(1);
    return result[0];
  }

  async getAlbumsForSchool(schoolId: string): Promise<SchoolAlbum[]> {
    return await db.select()
      .from(schoolAlbums)
      .where(eq(schoolAlbums.schoolId, schoolId))
      .orderBy(desc(schoolAlbums.createdAt));
  }

  async getAllGlobalBroadcasts(): Promise<SchoolAlbum[]> {
    return await db.select()
      .from(schoolAlbums)
      .where(eq(schoolAlbums.isGlobalBroadcast, true))
      .orderBy(desc(schoolAlbums.createdAt));
  }

  async getAllAlbums(): Promise<SchoolAlbum[]> {
    return await db.select()
      .from(schoolAlbums)
      .orderBy(desc(schoolAlbums.createdAt));
  }

  async deleteAlbum(id: string): Promise<void> {
    await db.delete(schoolAlbums).where(eq(schoolAlbums.id, id));
  }

  // Album Photo operations
  async addPhotoToAlbum(photo: InsertAlbumPhoto): Promise<AlbumPhoto> {
    const result = await db.insert(albumPhotos).values(photo).returning();
    return result[0];
  }

  async getAlbumPhotos(albumId: string): Promise<AlbumPhoto[]> {
    return await db.select()
      .from(albumPhotos)
      .where(eq(albumPhotos.albumId, albumId))
      .orderBy(desc(albumPhotos.uploadedAt));
  }

  async deletePhoto(photoId: string): Promise<void> {
    await db.delete(albumPhotos).where(eq(albumPhotos.id, photoId));
  }

  // Album Comment operations
  async addComment(comment: InsertAlbumComment): Promise<AlbumComment> {
    const result = await db.insert(albumComments).values(comment).returning();
    return result[0];
  }

  async getAlbumComments(albumId: string): Promise<AlbumComment[]> {
    return await db.select()
      .from(albumComments)
      .where(eq(albumComments.albumId, albumId))
      .orderBy(desc(albumComments.createdAt));
  }

  async deleteComment(commentId: string): Promise<void> {
    await db.delete(albumComments).where(eq(albumComments.id, commentId));
  }

  // Album Reaction operations
  async addReaction(reaction: InsertAlbumReaction): Promise<AlbumReaction> {
    const result = await db.insert(albumReactions).values(reaction).returning();
    return result[0];
  }

  async removeReaction(albumId: string, userId: string, reactionType: string): Promise<void> {
    await db.delete(albumReactions)
      .where(
        and(
          eq(albumReactions.albumId, albumId),
          eq(albumReactions.userId, userId),
          eq(albumReactions.reactionType, reactionType)
        )
      );
  }

  async getAlbumReactions(albumId: string): Promise<AlbumReaction[]> {
    return await db.select()
      .from(albumReactions)
      .where(eq(albumReactions.albumId, albumId));
  }

  // Announcement operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const result = await db.insert(announcements).values(announcement).returning();
    return result[0];
  }

  async getActiveAnnouncements(districtId?: string): Promise<Announcement[]> {
    const now = new Date();

    if (districtId) {
      return await db.select()
        .from(announcements)
        .where(
          and(
            eq(announcements.isActive, true),
            eq(announcements.districtId, districtId)
          )
        )
        .orderBy(desc(announcements.createdAt));
    }

    return await db.select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.createdAt));
  }

  async deactivateAnnouncement(id: string): Promise<Announcement> {
    const result = await db.update(announcements)
      .set({ isActive: false })
      .where(eq(announcements.id, id))
      .returning();
    return result[0];
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Monitoring Visit operations
  async createMonitoringVisit(visit: InsertMonitoringVisit): Promise<MonitoringVisit> {
    const result = await db.insert(monitoringVisits).values(visit as any).returning();
    return result[0];
  }

  async getMonitoringVisitsByAeo(aeoId: string): Promise<MonitoringVisit[]> {
    return await db.select()
      .from(monitoringVisits)
      .where(eq(monitoringVisits.aeoId, aeoId))
      .orderBy(desc(monitoringVisits.createdAt));
  }

  async getAllMonitoringVisits(): Promise<MonitoringVisit[]> {
    return await db.select()
      .from(monitoringVisits)
      .orderBy(desc(monitoringVisits.createdAt));
  }

  // Mentoring Visit operations
  async createMentoringVisit(visit: InsertMentoringVisit): Promise<MentoringVisit> {
    const result = await db.insert(mentoringVisits).values(visit as any).returning();
    return result[0];
  }

  async getMentoringVisitsByAeo(aeoId: string): Promise<MentoringVisit[]> {
    return await db.select()
      .from(mentoringVisits)
      .where(eq(mentoringVisits.aeoId, aeoId))
      .orderBy(desc(mentoringVisits.createdAt));
  }

  async getAllMentoringVisits(): Promise<MentoringVisit[]> {
    return await db.select()
      .from(mentoringVisits)
      .orderBy(desc(mentoringVisits.createdAt));
  }

  // Office Visit operations
  async createOfficeVisit(visit: InsertOfficeVisit): Promise<OfficeVisit> {
    const result = await db.insert(officeVisits).values(visit as any).returning();
    return result[0];
  }

  async getOfficeVisitsByAeo(aeoId: string): Promise<OfficeVisit[]> {
    return await db.select()
      .from(officeVisits)
      .where(eq(officeVisits.aeoId, aeoId))
      .orderBy(desc(officeVisits.createdAt));
  }

  async getAllOfficeVisits(): Promise<OfficeVisit[]> {
    return await db.select()
      .from(officeVisits)
      .orderBy(desc(officeVisits.createdAt));
  }

  // Other Activity operations
  async createOtherActivity(activity: InsertOtherActivity): Promise<OtherActivity> {
    const result = await db.insert(otherActivities).values(activity as any).returning();
    return result[0];
  }

  async getOtherActivitiesByAeo(aeoId: string): Promise<OtherActivity[]> {
    return await db.select()
      .from(otherActivities)
      .where(eq(otherActivities.aeoId, aeoId))
      .orderBy(desc(otherActivities.createdAt));
  }

  async getAllOtherActivities(): Promise<OtherActivity[]> {
    return await db.select()
      .from(otherActivities)
      .orderBy(desc(otherActivities.createdAt));
  }

  // Visit Session operations (GPS tracking)
  async createVisitSession(session: InsertVisitSession): Promise<VisitSession> {
    const result = await db.insert(visitSessions).values(session as any).returning();
    return result[0];
  }

  async getVisitSession(id: string): Promise<VisitSession | undefined> {
    const result = await db.select()
      .from(visitSessions)
      .where(eq(visitSessions.id, id))
      .limit(1);
    return result[0];
  }

  async getActiveVisitSession(aeoId: string): Promise<VisitSession | undefined> {
    const result = await db.select()
      .from(visitSessions)
      .where(and(
        eq(visitSessions.aeoId, aeoId),
        eq(visitSessions.status, 'in_progress')
      ))
      .limit(1);
    return result[0];
  }

  async getVisitSessionsByAeo(aeoId: string): Promise<VisitSession[]> {
    return await db.select()
      .from(visitSessions)
      .where(eq(visitSessions.aeoId, aeoId))
      .orderBy(desc(visitSessions.createdAt));
  }

  async getAllVisitSessions(): Promise<VisitSession[]> {
    return await db.select()
      .from(visitSessions)
      .orderBy(desc(visitSessions.createdAt));
  }

  async updateVisitSession(id: string, updates: Partial<VisitSession>): Promise<VisitSession> {
    const result = await db.update(visitSessions)
      .set(updates)
      .where(eq(visitSessions.id, id))
      .returning();
    return result[0];
  }

  async completeVisitSession(id: string, endData: { endLatitude?: string; endLongitude?: string; endLocationSource?: string }): Promise<VisitSession> {
    const result = await db.update(visitSessions)
      .set({
        ...endData,
        endTimestamp: new Date(),
        status: 'completed'
      })
      .where(eq(visitSessions.id, id))
      .returning();
    return result[0];
  }

  async cancelVisitSession(id: string): Promise<VisitSession> {
    const result = await db.update(visitSessions)
      .set({
        endTimestamp: new Date(),
        status: 'cancelled'
      })
      .where(eq(visitSessions.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DBStorage();

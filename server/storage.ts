import { db } from "./db";
import { users, dataRequests, requestAssignees, districts, clusters, schools, notifications, queries, queryResponses } from "@shared/schema";
import type {
  InsertUser, User, InsertDataRequest, DataRequest, InsertRequestAssignee, RequestAssignee,
  InsertDistrict, District, InsertCluster, Cluster, InsertSchool, School,
  InsertNotification, Notification, InsertQuery, Query, InsertQueryResponse, QueryResponse
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
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
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
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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
    
    return allRequests.filter((request: DataRequest) => {
      // Creator always sees their requests
      if (request.createdBy === userId) return true;
      
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
}

export const storage = new DBStorage();

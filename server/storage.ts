import { db } from "./db";
import { users, dataRequests, requestAssignees, districts, clusters, schools } from "@shared/schema";
import type { 
  InsertUser, User, InsertDataRequest, DataRequest, InsertRequestAssignee, RequestAssignee,
  InsertDistrict, District, InsertCluster, Cluster, InsertSchool, School 
} from "@shared/schema";
import { eq, and, or, inArray } from "drizzle-orm";

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
  
  // Request assignee operations
  createRequestAssignee(assignee: InsertRequestAssignee): Promise<RequestAssignee>;
  getRequestAssignees(requestId: string): Promise<RequestAssignee[]>;
  updateRequestAssignee(id: string, updates: Partial<RequestAssignee>): Promise<RequestAssignee>;
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
}

export const storage = new DBStorage();

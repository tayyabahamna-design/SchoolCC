import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertDataRequestSchema, insertRequestAssigneeSchema,
  insertDistrictSchema, insertClusterSchema, insertSchoolSchema, insertUserSchema
} from "@shared/schema";
import multer from "multer";
import { transcribeAudio, generateVisitSummary } from "./lib/claude";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Helper function to find user by ID or phone number (for session compatibility)
  async function findUserByIdOrPhone(idOrPhone: string) {
    let user = await storage.getUser(idOrPhone);
    if (!user) {
      user = await storage.getUserByUsername(idOrPhone);
    }
    return user;
  }

  // Configure multer for audio file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Data Requests endpoints
  app.post("/api/requests", async (req, res) => {
    try {
      // Convert date string to Date object
      const requestBody = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : new Date(),
      };
      const body = insertDataRequestSchema.parse(requestBody);
      const request = await storage.createDataRequest(body);
      res.json(request);
    } catch (error: any) {
      console.error("Request validation error:", error?.message || error);
      res.status(400).json({ error: "Invalid request", details: error?.message || String(error) });
    }
  });

  app.get("/api/requests", async (req, res) => {
    try {
      const { userId, userRole, schoolId, clusterId, districtId } = req.query as any;
      const requests = await storage.getDataRequestsForUser(userId, userRole, schoolId, clusterId, districtId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.getDataRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      const assignees = await storage.getRequestAssignees(req.params.id);
      // Map fieldResponses to fields for frontend compatibility
      const mappedAssignees = assignees.map(a => ({
        ...a,
        fields: a.fieldResponses || [],
      }));
      res.json({ ...request, assignees: mappedAssignees });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  app.patch("/api/requests/:id", async (req, res) => {
    try {
      const request = await storage.updateDataRequest(req.params.id, req.body);
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update request" });
    }
  });

  app.delete("/api/requests/:id", async (req, res) => {
    try {
      await storage.deleteDataRequest(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete request" });
    }
  });

  // Request Assignees endpoints
  app.post("/api/requests/:id/assignees", async (req, res) => {
    try {
      const body = insertRequestAssigneeSchema.parse({
        ...req.body,
        requestId: req.params.id,
      });
      const assignee = await storage.createRequestAssignee(body);
      res.json(assignee);
    } catch (error) {
      res.status(400).json({ error: "Invalid assignee" });
    }
  });

  app.patch("/api/assignees/:id", async (req, res) => {
    try {
      const assignee = await storage.updateRequestAssignee(req.params.id, req.body);
      res.json(assignee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignee" });
    }
  });

  // Generate Google Sheets for a request
  app.post("/api/requests/:id/generate-sheets", async (req, res) => {
    try {
      const sheets = await storage.generateRequestSheets(req.params.id);
      res.json(sheets);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate sheets" });
    }
  });

  // Admin: Districts endpoints
  app.get("/api/admin/districts", async (req, res) => {
    try {
      const districts = await storage.getAllDistricts();
      res.json(districts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.post("/api/admin/districts", async (req, res) => {
    try {
      const body = insertDistrictSchema.parse(req.body);
      const district = await storage.createDistrict(body);
      res.json(district);
    } catch (error) {
      res.status(400).json({ error: "Invalid district data" });
    }
  });

  app.patch("/api/admin/districts/:id", async (req, res) => {
    try {
      const district = await storage.updateDistrict(req.params.id, req.body);
      res.json(district);
    } catch (error) {
      res.status(500).json({ error: "Failed to update district" });
    }
  });

  app.delete("/api/admin/districts/:id", async (req, res) => {
    try {
      await storage.deleteDistrict(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete district" });
    }
  });

  // Admin: Clusters endpoints
  app.get("/api/admin/clusters", async (req, res) => {
    try {
      const { districtId } = req.query;
      const clusters = districtId 
        ? await storage.getClustersByDistrict(districtId as string)
        : await storage.getAllClusters();
      res.json(clusters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clusters" });
    }
  });

  app.post("/api/admin/clusters", async (req, res) => {
    try {
      const body = insertClusterSchema.parse(req.body);
      const cluster = await storage.createCluster(body);
      res.json(cluster);
    } catch (error) {
      res.status(400).json({ error: "Invalid cluster data" });
    }
  });

  app.patch("/api/admin/clusters/:id", async (req, res) => {
    try {
      const cluster = await storage.updateCluster(req.params.id, req.body);
      res.json(cluster);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cluster" });
    }
  });

  app.delete("/api/admin/clusters/:id", async (req, res) => {
    try {
      await storage.deleteCluster(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cluster" });
    }
  });

  // Admin: Schools endpoints
  app.get("/api/admin/schools", async (req, res) => {
    try {
      const { clusterId, districtId } = req.query;
      let schools;
      if (clusterId) {
        schools = await storage.getSchoolsByCluster(clusterId as string);
      } else if (districtId) {
        schools = await storage.getSchoolsByDistrict(districtId as string);
      } else {
        schools = await storage.getAllSchools();
      }
      res.json(schools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schools" });
    }
  });

  app.post("/api/admin/schools", async (req, res) => {
    try {
      const body = insertSchoolSchema.parse(req.body);
      const school = await storage.createSchool(body);
      res.json(school);
    } catch (error) {
      res.status(400).json({ error: "Invalid school data" });
    }
  });

  app.patch("/api/admin/schools/:id", async (req, res) => {
    try {
      const school = await storage.updateSchool(req.params.id, req.body);
      res.json(school);
    } catch (error) {
      res.status(500).json({ error: "Failed to update school" });
    }
  });

  app.delete("/api/admin/schools/:id", async (req, res) => {
    try {
      await storage.deleteSchool(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete school" });
    }
  });

  // Admin: Users endpoints
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : await storage.getAllUsers();
      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await findUserByIdOrPhone(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const body = insertUserSchema.parse(req.body);
      const user = await storage.createUser(body);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const existingUser = await findUserByIdOrPhone(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const user = await storage.updateUser(existingUser.id, req.body);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const existingUser = await findUserByIdOrPhone(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.deleteUser(existingUser.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Auth: Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      
      if (!phoneNumber || !password) {
        return res.status(400).json({ error: "Phone number and password are required" });
      }
      
      const user = await storage.getUserByUsername(phoneNumber);
      
      if (!user) {
        console.log("Login failed - user not found for phone:", phoneNumber);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (user.password !== password) {
        console.log("Login failed - password mismatch for user:", user.name);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check user status
      if (user.status === 'pending') {
        return res.status(403).json({
          error: "Account pending approval. Please wait for DEO to approve your request."
        });
      }

      if (user.status === 'restricted') {
        return res.status(403).json({
          error: "Account restricted. Please contact DEO."
        });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const {
        name,
        phoneNumber,
        password,
        role,
        fatherName,
        email,
        residentialAddress,
        cnic,
        dateOfBirth,
        dateOfJoining,
        qualification,
        clusterId,
        schoolEmis,
        districtId,
        markazName,
        assignedSchools,
      } = req.body;

      // Validation
      if (!name || !phoneNumber || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if phone number already exists
      const existingUser = await storage.getUserByUsername(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      // Validate role-specific fields
      if (role === 'AEO' && !markazName && !clusterId) {
        return res.status(400).json({ error: "Markaz name required for AEO" });
      }
      if (role === 'AEO' && (!assignedSchools || assignedSchools.length === 0)) {
        return res.status(400).json({ error: "School selection required for AEO" });
      }
      if ((role === 'HEAD_TEACHER' || role === 'TEACHER') && !schoolEmis) {
        return res.status(400).json({ error: "School EMIS number required" });
      }
      if (role === 'DDEO' && !districtId) {
        return res.status(400).json({ error: "District selection required for DDEO" });
      }

      // For school staff, lookup school details by EMIS
      let schoolId = null;
      let schoolName = null;
      let schoolClusterId = null;
      let schoolDistrictId = null;

      if (schoolEmis) {
        const school = await storage.getSchoolByEmis(schoolEmis);
        if (!school) {
          return res.status(400).json({ error: "Invalid EMIS number" });
        }
        schoolId = school.id;
        schoolName = school.name;
        schoolClusterId = school.clusterId;
        schoolDistrictId = school.districtId;
      }

      // Create pending user
      const newUser = await storage.createUser({
        name,
        phoneNumber,
        password,
        role,
        status: 'pending',
        fatherName,
        email,
        residentialAddress,
        cnic,
        dateOfBirth,
        dateOfJoining,
        qualification,
        clusterId: markazName || clusterId || schoolClusterId,
        districtId: districtId || schoolDistrictId || 'Rawalpindi',
        schoolId,
        schoolName,
        assignedSchools: assignedSchools || [],
        markaz: markazName || null,
      });

      res.json({
        success: true,
        message: "Account request submitted. You'll be notified when DEO approves."
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: "Failed to create account request",
        details: error.message || "Unknown error"
      });
    }
  });

  // DEO User Management endpoints
  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const { userId } = req.query;

      // Verify DEO or DDEO permission (supports both ID and phone number lookup)
      const user = await findUserByIdOrPhone(userId as string);
      if (!user || (user.role !== 'DEO' && user.role !== 'DDEO')) {
        return res.status(403).json({ error: "Access denied. DEO or DDEO role required." });
      }

      const pendingUsers = await storage.getUsersByStatus('pending');
      res.json(pendingUsers.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.patch("/api/admin/users/:id/approve", async (req, res) => {
    try {
      const { approverId } = req.body;

      // Verify DEO or DDEO permission (supports both ID and phone number lookup)
      const approver = await findUserByIdOrPhone(approverId);
      if (!approver || (approver.role !== 'DEO' && approver.role !== 'DDEO')) {
        return res.status(403).json({ error: "Access denied. DEO or DDEO role required." });
      }

      const user = await storage.updateUser(req.params.id, { status: 'active' });
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.patch("/api/admin/users/:id/reject", async (req, res) => {
    try {
      const { approverId } = req.body;

      // Verify DEO or DDEO permission (supports both ID and phone number lookup)
      const approver = await findUserByIdOrPhone(approverId);
      if (!approver || (approver.role !== 'DEO' && approver.role !== 'DDEO')) {
        return res.status(403).json({ error: "Access denied. DEO or DDEO role required." });
      }

      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject user" });
    }
  });

  app.patch("/api/admin/users/:id/restrict", async (req, res) => {
    try {
      const { adminId } = req.body;

      // Verify DEO or DDEO permission (supports both ID and phone number lookup)
      const admin = await findUserByIdOrPhone(adminId);
      if (!admin || (admin.role !== 'DEO' && admin.role !== 'DDEO')) {
        return res.status(403).json({ error: "Access denied. DEO or DDEO role required." });
      }

      const user = await storage.updateUser(req.params.id, { status: 'restricted' });
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to restrict user" });
    }
  });

  app.patch("/api/admin/users/:id/unrestrict", async (req, res) => {
    try {
      const { adminId } = req.body;

      // Verify DEO or DDEO permission (supports both ID and phone number lookup)
      const admin = await findUserByIdOrPhone(adminId);
      if (!admin || (admin.role !== 'DEO' && admin.role !== 'DDEO')) {
        return res.status(403).json({ error: "Access denied. DEO or DDEO role required." });
      }

      const user = await storage.updateUser(req.params.id, { status: 'active' });
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to unrestrict user" });
    }
  });

  // User Profile endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await findUserByIdOrPhone(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const {
        name,
        fatherName,
        email,
        residentialAddress,
        cnic,
        dateOfBirth,
        dateOfJoining,
        qualification,
        profilePicture,
        phoneNumber,
      } = req.body;

      // Find user by ID or phone number (for session compatibility)
      const existingUser = await findUserByIdOrPhone(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (fatherName !== undefined) updateData.fatherName = fatherName;
      if (email !== undefined) updateData.email = email;
      if (residentialAddress !== undefined) updateData.residentialAddress = residentialAddress;
      if (cnic !== undefined) updateData.cnic = cnic;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (dateOfJoining !== undefined) updateData.dateOfJoining = dateOfJoining;
      if (qualification !== undefined) updateData.qualification = qualification;
      if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      // Use the actual database ID for the update
      const user = await storage.updateUser(existingUser.id, updateData);
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      if (error.message?.includes("unique") || error.code === "23505") {
        res.status(400).json({ error: "This phone number is already in use by another user" });
      } else {
        res.status(500).json({ error: "Failed to update user profile" });
      }
    }
  });

  // Notification endpoints
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const count = await storage.getUnreadCount(req.params.userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      await storage.markAllAsRead(req.params.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Query endpoints
  app.post("/api/queries", async (req, res) => {
    try {
      // Generate ticket number if not provided
      const ticketNumber = req.body.ticketNumber || `TKT-${Date.now()}`;
      const queryData = {
        ...req.body,
        ticketNumber,
      };
      const query = await storage.createQuery(queryData);
      res.json(query);
    } catch (error: any) {
      console.error("Query creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create query", details: error?.message || String(error) });
    }
  });

  app.get("/api/queries", async (req, res) => {
    try {
      const { senderId, recipientId } = req.query;
      let queries;

      if (senderId) {
        queries = await storage.getQueriesBySender(senderId as string);
      } else if (recipientId) {
        queries = await storage.getQueriesByRecipient(recipientId as string);
      } else {
        queries = await storage.getAllQueries();
      }

      res.json(queries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queries" });
    }
  });

  app.get("/api/queries/:id", async (req, res) => {
    try {
      const query = await storage.getQuery(req.params.id);
      if (!query) {
        return res.status(404).json({ error: "Query not found" });
      }
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch query" });
    }
  });

  app.patch("/api/queries/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const query = await storage.updateQueryStatus(req.params.id, status);
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: "Failed to update query status" });
    }
  });

  // Query Response endpoints
  app.post("/api/queries/:id/responses", async (req, res) => {
    try {
      const response = await storage.createQueryResponse({
        ...req.body,
        queryId: req.params.id,
      });
      res.json(response);
    } catch (error) {
      res.status(400).json({ error: "Failed to create response" });
    }
  });

  app.get("/api/queries/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getQueryResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Visit Logs endpoints
  app.post("/api/visits", async (req, res) => {
    try {
      // Convert date strings to Date objects
      const visitData = {
        ...req.body,
        visitStartTime: req.body.visitStartTime ? new Date(req.body.visitStartTime) : new Date(),
        visitEndTime: req.body.visitEndTime ? new Date(req.body.visitEndTime) : undefined,
      };
      const visitLog = await storage.createVisitLog(visitData);
      res.json(visitLog);
    } catch (error: any) {
      console.error("Visit creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create visit log", details: error?.message || String(error) });
    }
  });

  app.get("/api/visits/active/:schoolId", async (req, res) => {
    try {
      const activeVisit = await storage.getActiveVisitForSchool(req.params.schoolId);
      res.json(activeVisit || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active visit" });
    }
  });

  app.patch("/api/visits/:id/end", async (req, res) => {
    try {
      const visit = await storage.endVisit(req.params.id);
      res.json(visit);
    } catch (error) {
      res.status(500).json({ error: "Failed to end visit" });
    }
  });

  app.get("/api/visits/history/:schoolId", async (req, res) => {
    try {
      const history = await storage.getVisitHistory(req.params.schoolId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visit history" });
    }
  });

  app.get("/api/visits/latest/:schoolId", async (req, res) => {
    try {
      const latestVisit = await storage.getLatestVisitForSchool(req.params.schoolId);
      res.json(latestVisit || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest visit" });
    }
  });

  // School Albums endpoints
  app.post("/api/albums", async (req, res) => {
    try {
      const album = await storage.createAlbum(req.body);
      res.json(album);
    } catch (error) {
      res.status(400).json({ error: "Failed to create album" });
    }
  });

  app.get("/api/albums/:id", async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
      const photos = await storage.getAlbumPhotos(req.params.id);
      const comments = await storage.getAlbumComments(req.params.id);
      const reactions = await storage.getAlbumReactions(req.params.id);
      res.json({ ...album, photos, comments, reactions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch album" });
    }
  });

  app.get("/api/albums/school/:schoolId", async (req, res) => {
    try {
      const albums = await storage.getAlbumsForSchool(req.params.schoolId);
      res.json(albums);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch albums" });
    }
  });

  app.get("/api/albums/broadcasts/all", async (req, res) => {
    try {
      const broadcasts = await storage.getAllGlobalBroadcasts();
      res.json(broadcasts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch global broadcasts" });
    }
  });

  app.delete("/api/albums/:id", async (req, res) => {
    try {
      await storage.deleteAlbum(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete album" });
    }
  });

  // Album Photos endpoints
  app.get("/api/albums/:albumId/photos", async (req, res) => {
    try {
      const photos = await storage.getAlbumPhotos(req.params.albumId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch album photos" });
    }
  });

  app.post("/api/albums/:albumId/photos", async (req, res) => {
    try {
      const photo = await storage.addPhotoToAlbum({
        ...req.body,
        albumId: req.params.albumId,
      });
      res.json(photo);
    } catch (error) {
      res.status(400).json({ error: "Failed to add photo" });
    }
  });

  app.delete("/api/photos/:photoId", async (req, res) => {
    try {
      await storage.deletePhoto(req.params.photoId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // Album Comments endpoints
  app.post("/api/albums/:albumId/comments", async (req, res) => {
    try {
      const comment = await storage.addComment({
        ...req.body,
        albumId: req.params.albumId,
      });
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: "Failed to add comment" });
    }
  });

  app.delete("/api/comments/:commentId", async (req, res) => {
    try {
      await storage.deleteComment(req.params.commentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Album Reactions endpoints
  app.post("/api/albums/:albumId/reactions", async (req, res) => {
    try {
      const reaction = await storage.addReaction({
        ...req.body,
        albumId: req.params.albumId,
      });
      res.json(reaction);
    } catch (error) {
      res.status(400).json({ error: "Failed to add reaction" });
    }
  });

  app.delete("/api/albums/:albumId/reactions", async (req, res) => {
    try {
      const { userId, reactionType } = req.query as any;
      await storage.removeReaction(req.params.albumId, userId, reactionType);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove reaction" });
    }
  });

  // Announcements endpoints
  app.post("/api/announcements", async (req, res) => {
    try {
      const announcement = await storage.createAnnouncement(req.body);
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: "Failed to create announcement" });
    }
  });

  app.get("/api/announcements", async (req, res) => {
    try {
      const { districtId } = req.query as any;
      const announcements = await storage.getActiveAnnouncements(districtId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.patch("/api/announcements/:id/deactivate", async (req, res) => {
    try {
      const announcement = await storage.deactivateAnnouncement(req.params.id);
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate announcement" });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  // Excel Export endpoint for complete school data
  app.get("/api/export/schools/excel", async (req, res) => {
    try {
      const XLSX = await import('xlsx');
      const { districtId, clusterId } = req.query as any;
      let schools;

      if (clusterId) {
        schools = await storage.getSchoolsByCluster(clusterId);
      } else if (districtId) {
        schools = await storage.getSchoolsByDistrict(districtId);
      } else {
        schools = await storage.getAllSchools();
      }

      // Get latest visit for each school
      const schoolsWithVisits = await Promise.all(
        schools.map(async (school) => {
          const latestVisit = await storage.getLatestVisitForSchool(school.id);
          return { ...school, latestVisit };
        })
      );

      // Transform data for Excel
      const excelData = schoolsWithVisits.map((school) => ({
        'School Name': school.name,
        'EMIS Number': school.emisNumber,
        'Cluster': school.clusterId,
        'District': school.districtId,
        'Total Students': school.totalStudents || 0,
        'Present Students': school.presentStudents || 0,
        'Absent Students': school.absentStudents || 0,
        'Student Attendance %': school.totalStudents ?
          ((school.presentStudents || 0) / school.totalStudents * 100).toFixed(1) + '%' : 'N/A',
        'Total Teachers': school.totalTeachers || 0,
        'Present Teachers': school.presentTeachers || 0,
        'Absent Teachers': school.absentTeachers || 0,
        'Total Toilets': school.totalToilets || 0,
        'Working Toilets': school.workingToilets || 0,
        'Broken Toilets': school.brokenToilets || 0,
        'Drinking Water': school.isDrinkingWaterAvailable ? 'Yes' : 'No',
        'Desks (New/Use/Broken)': `${school.desksNew || 0}/${school.desksInUse || 0}/${school.desksBroken || 0}`,
        'Fans (New/Use/Broken)': `${school.fansNew || 0}/${school.fansInUse || 0}/${school.fansBroken || 0}`,
        'Chairs (New/Use/Broken)': `${school.chairsNew || 0}/${school.chairsInUse || 0}/${school.chairsBroken || 0}`,
        'Blackboards (New/Use/Broken)': `${school.blackboardsNew || 0}/${school.blackboardsInUse || 0}/${school.blackboardsBroken || 0}`,
        'Computers (New/Use/Broken)': `${school.computersNew || 0}/${school.computersInUse || 0}/${school.computersBroken || 0}`,
        'Latest AEO Visit': school.latestVisit ?
          new Date(school.latestVisit.visitStartTime).toLocaleString() : 'No visits',
        'Latest AEO Name': school.latestVisit ? school.latestVisit.aeoName : 'N/A',
        'Data Last Updated': school.dataLastUpdated ?
          new Date(school.dataLastUpdated).toLocaleString() : 'Never',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // School Name
        { wch: 15 }, // EMIS Number
        { wch: 15 }, // Cluster
        { wch: 15 }, // District
        { wch: 12 }, // Total Students
        { wch: 14 }, // Present Students
        { wch: 13 }, // Absent Students
        { wch: 18 }, // Attendance %
        { wch: 12 }, // Total Teachers
        { wch: 14 }, // Present Teachers
        { wch: 13 }, // Absent Teachers
        { wch: 12 }, // Total Toilets
        { wch: 15 }, // Working Toilets
        { wch: 13 }, // Broken Toilets
        { wch: 14 }, // Drinking Water
        { wch: 22 }, // Desks
        { wch: 22 }, // Fans
        { wch: 22 }, // Chairs
        { wch: 25 }, // Blackboards
        { wch: 25 }, // Computers
        { wch: 20 }, // Latest Visit
        { wch: 20 }, // AEO Name
        { wch: 20 }, // Data Last Updated
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Schools Data');

      // Generate buffer
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Set response headers
      res.setHeader('Content-Disposition', 'attachment; filename=schools-report.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export schools data" });
    }
  });

  // ZIP Download endpoint for album photos
  app.get("/api/albums/:albumId/download/zip", async (req, res) => {
    try {
      const JSZip = (await import('jszip')).default;
      const album = await storage.getAlbum(req.params.albumId);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }

      const photos = await storage.getAlbumPhotos(req.params.albumId);

      const zip = new JSZip();
      const folder = zip.folder(album.title || 'Album');

      // Add a README with album info
      folder?.file('README.txt',
        `Album: ${album.title}\nSchool: ${album.schoolName}\nCreated by: ${album.createdByName}\nDate: ${new Date(album.createdAt).toLocaleString()}\n\nTotal Photos: ${photos.length}`
      );

      // Note: In a real implementation, you would fetch actual photo files
      // For now, we'll create placeholder text files with photo metadata
      photos.forEach((photo, index) => {
        const photoInfo = `Photo ${index + 1}\nCaption: ${photo.caption || 'No caption'}\nUploaded: ${new Date(photo.uploadedAt).toLocaleString()}\nURL: ${photo.photoUrl}`;
        folder?.file(`photo_${index + 1}_info.txt`, photoInfo);
      });

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      res.setHeader('Content-Disposition', `attachment; filename=${album.title.replace(/[^a-z0-9]/gi, '_')}.zip`);
      res.setHeader('Content-Type', 'application/zip');
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate ZIP file" });
    }
  });

  // DOCX Report endpoint for album
  app.get("/api/albums/:albumId/download/docx", async (req, res) => {
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const { Packer } = await import('docx');

      const album = await storage.getAlbum(req.params.albumId);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }

      const photos = await storage.getAlbumPhotos(req.params.albumId);
      const comments = await storage.getAlbumComments(req.params.albumId);

      // Create document sections
      const docSections: any[] = [
        new Paragraph({
          text: album.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `School: ${album.schoolName}`, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Created by: ${album.createdByName} (${album.createdByRole})` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Date: ${new Date(album.createdAt).toLocaleString()}` }),
          ],
        }),
        new Paragraph({ text: '' }), // Empty line
        new Paragraph({
          children: [
            new TextRun({ text: album.description || 'No description provided', italics: true }),
          ],
        }),
        new Paragraph({ text: '' }), // Empty line
        new Paragraph({
          text: 'Photos',
          heading: HeadingLevel.HEADING_2,
        }),
      ];

      // Add photo entries
      photos.forEach((photo, index) => {
        docSections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Photo ${index + 1}`, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Caption: ${photo.caption || 'No caption'}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Uploaded: ${new Date(photo.uploadedAt).toLocaleString()}` }),
            ],
          }),
          new Paragraph({ text: '' }) // Empty line
        );
      });

      // Add comments section
      if (comments.length > 0) {
        docSections.push(
          new Paragraph({
            text: 'Comments',
            heading: HeadingLevel.HEADING_2,
          })
        );

        comments.forEach((comment) => {
          docSections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${comment.userName}: `, bold: true }),
                new TextRun({ text: comment.comment }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: new Date(comment.createdAt).toLocaleString(),
                  size: 18,
                  italics: true
                }),
              ],
            }),
            new Paragraph({ text: '' })
          );
        });
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: docSections,
        }],
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader('Content-Disposition', `attachment; filename=${album.title.replace(/[^a-z0-9]/gi, '_')}_report.docx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate DOCX report" });
    }
  });

  // Monitoring Visit endpoints
  app.post("/api/activities/monitoring", async (req, res) => {
    try {
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const visit = await storage.createMonitoringVisit(visitData);
      res.json(visit);
    } catch (error: any) {
      console.error("Monitoring visit creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create monitoring visit", details: error?.message || String(error) });
    }
  });

  app.get("/api/activities/monitoring", async (req, res) => {
    try {
      const { aeoId } = req.query;
      let visits;
      if (aeoId) {
        visits = await storage.getMonitoringVisitsByAeo(aeoId as string);
      } else {
        visits = await storage.getAllMonitoringVisits();
      }
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monitoring visits" });
    }
  });

  // Mentoring Visit endpoints
  app.post("/api/activities/mentoring", async (req, res) => {
    try {
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const visit = await storage.createMentoringVisit(visitData);
      res.json(visit);
    } catch (error: any) {
      console.error("Mentoring visit creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create mentoring visit", details: error?.message || String(error) });
    }
  });

  app.get("/api/activities/mentoring", async (req, res) => {
    try {
      const { aeoId } = req.query;
      let visits;
      if (aeoId) {
        visits = await storage.getMentoringVisitsByAeo(aeoId as string);
      } else {
        visits = await storage.getAllMentoringVisits();
      }
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mentoring visits" });
    }
  });

  // Office Visit endpoints
  app.post("/api/activities/office", async (req, res) => {
    try {
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const visit = await storage.createOfficeVisit(visitData);
      res.json(visit);
    } catch (error: any) {
      console.error("Office visit creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create office visit", details: error?.message || String(error) });
    }
  });

  app.get("/api/activities/office", async (req, res) => {
    try {
      const { aeoId } = req.query;
      let visits;
      if (aeoId) {
        visits = await storage.getOfficeVisitsByAeo(aeoId as string);
      } else {
        visits = await storage.getAllOfficeVisits();
      }
      res.json(visits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch office visits" });
    }
  });

  // Other Activity endpoints
  app.post("/api/activities/other", async (req, res) => {
    try {
      const activityData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const activity = await storage.createOtherActivity(activityData);
      res.json(activity);
    } catch (error: any) {
      console.error("Other activity creation error:", error?.message || error);
      res.status(400).json({ error: "Failed to create other activity", details: error?.message || String(error) });
    }
  });

  app.get("/api/activities/other", async (req, res) => {
    try {
      const { aeoId } = req.query;
      let activities;
      if (aeoId) {
        activities = await storage.getOtherActivitiesByAeo(aeoId as string);
      } else {
        activities = await storage.getAllOtherActivities();
      }
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch other activities" });
    }
  });

  // Expand shortened Google Maps URL endpoint
  app.post("/api/expand-maps-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Follow redirects to get the full URL
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const fullUrl = response.url;
      
      // Parse coordinates from the expanded URL
      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,           // @lat,lng
        /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,      // ?q=lat,lng
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,         // ll=lat,lng
        /!3d(-?\d+\.?\d*).*?!4d(-?\d+\.?\d*)/,    // !3d and !4d format
      ];

      for (const pattern of patterns) {
        const match = fullUrl.match(pattern);
        if (match) {
          return res.json({
            success: true,
            latitude: match[1],
            longitude: match[2],
            expandedUrl: fullUrl
          });
        }
      }

      res.json({
        success: false,
        error: "Could not extract coordinates from URL",
        expandedUrl: fullUrl
      });
    } catch (error: any) {
      console.error("URL expansion error:", error?.message || error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to expand URL", 
        details: error?.message || String(error) 
      });
    }
  });

  // Visit Session endpoints (GPS tracking)
  app.post("/api/visit-sessions/start", async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        startTimestamp: new Date(),
        status: 'in_progress'
      };
      const session = await storage.createVisitSession(sessionData);
      res.json(session);
    } catch (error: any) {
      console.error("Visit session start error:", error?.message || error);
      res.status(400).json({ error: "Failed to start visit session", details: error?.message || String(error) });
    }
  });

  app.get("/api/visit-sessions", async (req, res) => {
    try {
      const { aeoId } = req.query;
      let sessions;
      if (aeoId) {
        sessions = await storage.getVisitSessionsByAeo(aeoId as string);
      } else {
        sessions = await storage.getAllVisitSessions();
      }
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visit sessions" });
    }
  });

  app.get("/api/visit-sessions/active/:aeoId", async (req, res) => {
    try {
      const session = await storage.getActiveVisitSession(req.params.aeoId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active visit session" });
    }
  });

  app.get("/api/visit-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getVisitSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Visit session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch visit session" });
    }
  });

  app.post("/api/visit-sessions/:id/end", async (req, res) => {
    try {
      const { endLatitude, endLongitude, endLocationSource } = req.body;
      const session = await storage.completeVisitSession(req.params.id, {
        endLatitude,
        endLongitude,
        endLocationSource
      });
      res.json(session);
    } catch (error: any) {
      console.error("Visit session end error:", error?.message || error);
      res.status(400).json({ error: "Failed to end visit session", details: error?.message || String(error) });
    }
  });

  app.post("/api/visit-sessions/:id/cancel", async (req, res) => {
    try {
      const session = await storage.cancelVisitSession(req.params.id);
      res.json(session);
    } catch (error: any) {
      console.error("Visit session cancel error:", error?.message || error);
      res.status(400).json({ error: "Failed to cancel visit session", details: error?.message || String(error) });
    }
  });

  app.patch("/api/visit-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateVisitSession(req.params.id, req.body);
      res.json(session);
    } catch (error: any) {
      console.error("Visit session update error:", error?.message || error);
      res.status(400).json({ error: "Failed to update visit session", details: error?.message || String(error) });
    }
  });

  // AI Voice Note & Summary endpoints
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // Note: Claude cannot directly transcribe audio
      // This endpoint is a placeholder for Whisper API integration
      try {
        const transcription = await transcribeAudio(req.file.buffer);
        res.json({ transcription });
      } catch (error: any) {
        // Return a helpful message about Whisper API integration
        res.status(501).json({
          error: "Audio transcription not yet implemented",
          message: "Please integrate OpenAI Whisper API, AssemblyAI, or Deepgram for audio transcription",
          details: error.message
        });
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      res.status(500).json({
        error: "Failed to transcribe audio",
        details: error.message || String(error)
      });
    }
  });

  app.post("/api/generate-summary", async (req, res) => {
    try {
      const {
        schoolName,
        visitDate,
        visitType,
        attendanceData,
        facilities,
        observations,
        transcribedNotes,
        recommendations
      } = req.body;

      if (!schoolName || !visitDate || !visitType) {
        return res.status(400).json({
          error: "Missing required fields: schoolName, visitDate, visitType"
        });
      }

      const summary = await generateVisitSummary({
        schoolName,
        visitDate,
        visitType,
        attendanceData,
        facilities,
        observations,
        transcribedNotes,
        recommendations
      });

      res.json({ summary });
    } catch (error: any) {
      console.error("Summary generation error:", error);
      res.status(500).json({
        error: "Failed to generate visit summary",
        details: error.message || String(error)
      });
    }
  });

  return httpServer;
}

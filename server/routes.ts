import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertDataRequestSchema, insertRequestAssigneeSchema,
  insertDistrictSchema, insertClusterSchema, insertSchoolSchema, insertUserSchema
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Data Requests endpoints
  app.post("/api/requests", async (req, res) => {
    try {
      const body = insertDataRequestSchema.parse(req.body);
      const request = await storage.createDataRequest(body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
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
      res.json({ ...request, assignees });
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
      const user = await storage.getUser(req.params.id);
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
      const user = await storage.updateUser(req.params.id, req.body);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Auth: Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      const user = await storage.getUserByUsername(phoneNumber);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  return httpServer;
}

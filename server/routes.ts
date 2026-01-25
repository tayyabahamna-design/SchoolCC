import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertDataRequestSchema, insertRequestAssigneeSchema, insertVoiceRecordingSchema,
  insertDistrictSchema, insertClusterSchema, insertSchoolSchema, insertUserSchema,
  insertTehsilSchema, insertMarkazSchema
} from "@shared/schema";
import multer from "multer";
import { transcribeAudio, generateVisitSummary } from "./lib/claude";
import * as XLSX from "xlsx";

// All 16 schools in the district with their EMIS numbers
const REQUIRED_SCHOOLS = [
  { name: "GBPS Dhoke Ziarat", emis: "37330209", code: "GBPS-DZ" },
  { name: "GES Jawa", emis: "37330130", code: "GES-JAWA" },
  { name: "GGES Anwar ul Islam Kamalabad", emis: "37330151", code: "GGES-AIK" },
  { name: "GGES Kotha Kallan", emis: "37330561", code: "GGES-KK" },
  { name: "GGES Pind Habtal", emis: "37330612", code: "GGES-PH" },
  { name: "GGPS Arazi Sohal", emis: "37330172-A", code: "GGPS-AS" },
  { name: "GGPS Carriage Factory", emis: "37330433", code: "GGPS-CF" },
  { name: "GGPS Chakra", emis: "37330227", code: "GGPS-CHA" },
  { name: "GGPS Dhok Munshi", emis: "37330322", code: "GGPS-DM" },
  { name: "GGPS Raika Maira", emis: "37330627", code: "GGPS-RM" },
  { name: "GGPS Westridge 1", emis: "37330598", code: "GGPS-W1" },
  { name: "GMPS Khabba Barala", emis: "37330410", code: "GMPS-KB" },
  { name: "GPS Chak Denal", emis: "37330312", code: "GPS-CD" },
  { name: "GPS Dhamial", emis: "37330317", code: "GPS-DHA" },
  { name: "GPS Millat Islamia", emis: "37330172", code: "GPS-MI" },
  { name: "GPS Rehmatabad", emis: "37330383", code: "GPS-REH" }
];

// Seed schools on startup
async function seedSchoolsIfNeeded() {
  console.log('[Seed] Checking if schools need to be seeded...');
  
  // First ensure district and cluster exist
  let district = await storage.getDistrictByName("Rawalpindi");
  if (!district) {
    console.log('[Seed] Creating Rawalpindi district...');
    district = await storage.createDistrict({ name: "Rawalpindi", code: "RWP" });
  }
  
  let cluster = await storage.getClusterByName("Rawalpindi Cluster");
  if (!cluster) {
    console.log('[Seed] Creating Rawalpindi Cluster...');
    cluster = await storage.createCluster({ name: "Rawalpindi Cluster", code: "RWP-C", districtId: district.id });
  }
  
  // Seed each school if it doesn't exist
  for (const school of REQUIRED_SCHOOLS) {
    const existing = await storage.getSchoolByEmis(school.emis);
    if (!existing) {
      console.log(`[Seed] Creating school: ${school.name} (${school.emis})`);
      await storage.createSchool({
        name: school.name,
        code: school.code,
        emisNumber: school.emis,
        clusterId: cluster.id,
        districtId: district.id,
        address: "Rawalpindi, Pakistan"
      });
    }
  }
  console.log('[Seed] School seeding complete!');
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed schools on startup
  await seedSchoolsIfNeeded();

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

  // Voice Recordings endpoints
  app.post("/api/voice-recordings", async (req, res) => {
    try {
      const body = insertVoiceRecordingSchema.parse(req.body);
      const recording = await storage.createVoiceRecording(body);
      res.json(recording);
    } catch (error: any) {
      console.error("Voice recording error:", error?.message || error);
      res.status(400).json({ error: "Invalid voice recording", details: error?.message || String(error) });
    }
  });

  app.get("/api/voice-recordings/:id", async (req, res) => {
    try {
      const recording = await storage.getVoiceRecording(req.params.id);
      if (!recording) {
        return res.status(404).json({ error: "Recording not found" });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recording" });
    }
  });

  app.get("/api/voice-recordings/request/:requestId", async (req, res) => {
    try {
      const recordings = await storage.getVoiceRecordingsByRequest(req.params.requestId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recordings" });
    }
  });

  app.delete("/api/voice-recordings/:id", async (req, res) => {
    try {
      await storage.deleteVoiceRecording(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recording" });
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

  // Export request responses as Excel file
  app.get("/api/requests/:id/export-excel", async (req, res) => {
    try {
      const request = await storage.getDataRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      const assignees = await storage.getRequestAssignees(req.params.id);
      
      // Get field definitions from the request
      const fields = request.fields as Array<{ id: string; name: string; type: string }>;
      
      // Build header row: Teacher Name, School, Status, then each field
      const headers = ["Teacher Name", "School", "Status", "Submitted At", ...fields.map(f => f.name)];
      
      // Build data rows
      const dataRows = assignees.map(assignee => {
        const responses = (assignee.fieldResponses as Record<string, any>) || {};
        const row: any[] = [
          assignee.userName,
          assignee.schoolName || "N/A",
          assignee.status,
          assignee.submittedAt ? new Date(assignee.submittedAt).toLocaleDateString() : "Not submitted"
        ];
        
        // Add each field value
        fields.forEach(field => {
          const value = responses[field.id];
          if (field.type === 'file' || field.type === 'photo' || field.type === 'voice_note') {
            row.push(value ? "Attached" : "No file");
          } else {
            row.push(value || "");
          }
        });
        
        return row;
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      ws['!cols'] = headers.map(() => ({ wch: 20 }));
      
      XLSX.utils.book_append_sheet(wb, ws, "Responses");
      
      // Generate buffer
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      
      // Set headers for download
      const filename = `${request.title.replace(/[^a-z0-9]/gi, '_')}_responses.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Excel export error:", error);
      res.status(500).json({ error: error.message || "Failed to export Excel" });
    }
  });

  // General data export endpoint - export teachers, schools, inventory data to Excel
  app.post("/api/export-data", async (req, res) => {
    try {
      const { dataType, fields, userId, userRole, districtId, clusterId, schoolId } = req.body;
      
      if (!dataType || !fields || fields.length === 0) {
        return res.status(400).json({ error: "Data type and fields are required" });
      }

      let data: any[] = [];
      let sheetName = "Data Export";

      // Fetch data based on type and user's access level
      if (dataType === 'teachers') {
        sheetName = "Teachers";
        const users = await storage.getAllUsers();
        
        // Filter by role and access level
        let filteredUsers = users.filter(u => u.role === 'TEACHER' || u.role === 'HEAD_TEACHER');
        
        // Apply location filter based on user's role
        if (userRole === 'HEAD_TEACHER') {
          filteredUsers = filteredUsers.filter(u => u.schoolId === schoolId);
        } else if (userRole === 'AEO') {
          filteredUsers = filteredUsers.filter(u => u.clusterId === clusterId);
        } else if (userRole === 'DDEO' || userRole === 'DEO') {
          filteredUsers = filteredUsers.filter(u => u.districtId === districtId);
        }
        // CEO can see all
        
        data = filteredUsers.map(u => {
          const row: Record<string, any> = {};
          if (fields.includes('name')) row['Full Name'] = u.name || '';
          if (fields.includes('cnic')) row['CNIC Number'] = u.cnic || '';
          if (fields.includes('phone')) row['Phone Number'] = u.phoneNumber || '';
          if (fields.includes('email')) row['Email'] = u.email || '';
          if (fields.includes('school')) row['School Name'] = u.schoolName || '';
          if (fields.includes('designation')) row['Designation'] = u.role || '';
          if (fields.includes('qualification')) row['Qualification'] = u.qualification || '';
          if (fields.includes('joinDate')) row['Joining Date'] = u.createdAt?.toISOString().split('T')[0] || '';
          if (fields.includes('salary')) row['Salary Grade'] = '';
          if (fields.includes('status')) row['Employment Status'] = u.status || 'Active';
          return row;
        });
      } else if (dataType === 'schools') {
        sheetName = "Schools";
        const schools = await storage.getAllSchools();
        
        // Filter by access level
        let filteredSchools = schools;
        if (userRole === 'HEAD_TEACHER') {
          filteredSchools = schools.filter(s => s.id === schoolId);
        } else if (userRole === 'AEO') {
          filteredSchools = schools.filter(s => s.clusterId === clusterId);
        } else if (userRole === 'DDEO' || userRole === 'DEO') {
          filteredSchools = schools.filter(s => s.districtId === districtId);
        }
        
        data = filteredSchools.map(s => {
          const row: Record<string, any> = {};
          if (fields.includes('name')) row['School Name'] = s.name || '';
          if (fields.includes('emisCode')) row['EMIS Code'] = s.emisNumber || '';
          if (fields.includes('address')) row['Address'] = s.address || '';
          if (fields.includes('cluster')) row['Cluster'] = s.clusterId || '';
          if (fields.includes('district')) row['District'] = s.districtId || '';
          if (fields.includes('type')) row['School Type'] = '';
          if (fields.includes('level')) row['Level'] = '';
          if (fields.includes('totalStudents')) row['Total Students'] = s.totalStudents || 0;
          if (fields.includes('totalTeachers')) row['Total Teachers'] = s.totalTeachers || 0;
          if (fields.includes('headTeacher')) row['Head Teacher Name'] = '';
          return row;
        });
      } else if (dataType === 'inventory') {
        sheetName = "Inventory";
        // For inventory, we'll use school inventory data
        const schools = await storage.getAllSchools();
        
        let filteredSchools = schools;
        if (userRole === 'HEAD_TEACHER') {
          filteredSchools = schools.filter(s => s.id === schoolId);
        } else if (userRole === 'AEO') {
          filteredSchools = schools.filter(s => s.clusterId === clusterId);
        } else if (userRole === 'DDEO' || userRole === 'DEO') {
          filteredSchools = schools.filter(s => s.districtId === districtId);
        }
        
        // Create inventory rows from school data
        for (const school of filteredSchools) {
          const row: Record<string, any> = {};
          if (fields.includes('itemName')) row['Item Name'] = 'School Inventory';
          if (fields.includes('category')) row['Category'] = 'General';
          if (fields.includes('quantity')) row['Quantity'] = 1;
          if (fields.includes('condition')) row['Condition'] = 'Good';
          if (fields.includes('school')) row['School'] = school.name || '';
          if (fields.includes('lastUpdated')) row['Last Updated'] = school.createdAt?.toISOString().split('T')[0] || '';
          if (fields.includes('purchaseDate')) row['Purchase Date'] = '';
          if (fields.includes('value')) row['Estimated Value'] = '';
          data.push(row);
        }
      } else if (dataType === 'students') {
        sheetName = "Students";
        // For students, we would need student data from schools
        const schools = await storage.getAllSchools();
        
        let filteredSchools = schools;
        if (userRole === 'HEAD_TEACHER') {
          filteredSchools = schools.filter(s => s.id === schoolId);
        } else if (userRole === 'AEO') {
          filteredSchools = schools.filter(s => s.clusterId === clusterId);
        } else if (userRole === 'DDEO' || userRole === 'DEO') {
          filteredSchools = schools.filter(s => s.districtId === districtId);
        }
        
        // Create placeholder rows for students based on school enrollment
        for (const school of filteredSchools) {
          const row: Record<string, any> = {};
          if (fields.includes('name')) row['Student Name'] = '';
          if (fields.includes('fatherName')) row['Father Name'] = '';
          if (fields.includes('class')) row['Class'] = '';
          if (fields.includes('section')) row['Section'] = '';
          if (fields.includes('rollNo')) row['Roll Number'] = '';
          if (fields.includes('gender')) row['Gender'] = '';
          if (fields.includes('dateOfBirth')) row['Date of Birth'] = '';
          if (fields.includes('admissionDate')) row['Admission Date'] = '';
          if (fields.includes('school')) row['School'] = school.name || '';
          data.push(row);
        }
      }

      if (data.length === 0) {
        // Create empty row with headers
        const emptyRow: Record<string, any> = {};
        fields.forEach((f: string) => {
          emptyRow[f] = '';
        });
        data = [emptyRow];
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      const headers = Object.keys(data[0] || {});
      ws['!cols'] = headers.map(() => ({ wch: 20 }));
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate buffer
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
      
      // Set headers for download
      const filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Data export error:", error);
      res.status(500).json({ error: error.message || "Failed to export data" });
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

  // Tehsil routes
  app.get("/api/tehsils", async (req, res) => {
    try {
      const { districtId } = req.query;
      const tehsilList = districtId 
        ? await storage.getTehsilsByDistrict(districtId as string)
        : await storage.getAllTehsils();
      res.json(tehsilList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tehsils" });
    }
  });

  app.post("/api/tehsils", async (req, res) => {
    try {
      const body = insertTehsilSchema.parse(req.body);
      // Check if tehsil already exists
      const existing = await storage.getTehsilByName(body.name, body.districtId);
      if (existing) {
        return res.json(existing);
      }
      const tehsil = await storage.createTehsil(body);
      res.json(tehsil);
    } catch (error) {
      res.status(400).json({ error: "Invalid tehsil data" });
    }
  });

  app.get("/api/tehsils/:id", async (req, res) => {
    try {
      const tehsil = await storage.getTehsil(req.params.id);
      if (!tehsil) {
        return res.status(404).json({ error: "Tehsil not found" });
      }
      res.json(tehsil);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tehsil" });
    }
  });

  app.patch("/api/tehsils/:id", async (req, res) => {
    try {
      const tehsil = await storage.updateTehsil(req.params.id, req.body);
      res.json(tehsil);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tehsil" });
    }
  });

  app.delete("/api/tehsils/:id", async (req, res) => {
    try {
      await storage.deleteTehsil(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tehsil" });
    }
  });

  // Markaz routes
  app.get("/api/markazes", async (req, res) => {
    try {
      const { tehsilId, districtId } = req.query;
      let markazList;
      if (tehsilId) {
        markazList = await storage.getMarkazesByTehsil(tehsilId as string);
      } else if (districtId) {
        markazList = await storage.getMarkazesByDistrict(districtId as string);
      } else {
        markazList = await storage.getAllMarkazes();
      }
      res.json(markazList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch markazes" });
    }
  });

  app.post("/api/markazes", async (req, res) => {
    try {
      const body = insertMarkazSchema.parse(req.body);
      // Check if markaz already exists
      const existing = await storage.getMarkazByName(body.name, body.tehsilId);
      if (existing) {
        return res.json(existing);
      }
      const markaz = await storage.createMarkaz(body);
      res.json(markaz);
    } catch (error) {
      res.status(400).json({ error: "Invalid markaz data" });
    }
  });

  app.get("/api/markazes/:id", async (req, res) => {
    try {
      const markaz = await storage.getMarkaz(req.params.id);
      if (!markaz) {
        return res.status(404).json({ error: "Markaz not found" });
      }
      res.json(markaz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch markaz" });
    }
  });

  app.patch("/api/markazes/:id", async (req, res) => {
    try {
      const markaz = await storage.updateMarkaz(req.params.id, req.body);
      res.json(markaz);
    } catch (error) {
      res.status(500).json({ error: "Failed to update markaz" });
    }
  });

  app.delete("/api/markazes/:id", async (req, res) => {
    try {
      await storage.deleteMarkaz(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete markaz" });
    }
  });

  // Public: Get all schools for signup/registration
  app.get("/api/schools", async (req, res) => {
    try {
      const schools = await storage.getAllSchools();
      // Return simplified list for dropdown
      res.json(schools.map(s => ({ 
        id: s.id, 
        name: s.name, 
        emis: s.emisNumber,
        clusterId: s.clusterId,
        districtId: s.districtId
      })));
    } catch (error) {
      console.error('[Schools API] Error fetching schools:', error);
      res.status(500).json({ error: "Failed to fetch schools" });
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
      const { role, userId } = req.query;

      // Get requesting user for hierarchical filtering
      let requestingUser = null;
      if (userId) {
        requestingUser = await findUserByIdOrPhone(userId as string);
      }

      // Get all users or filter by role
      let users = role
        ? await storage.getUsersByRole(role as string)
        : await storage.getAllUsers();

      // Apply hierarchical filtering based on requesting user's role
      if (requestingUser) {
        if (requestingUser.role === 'CEO' || requestingUser.role === 'DEO' || requestingUser.role === 'DDEO') {
          // CEO/DEO/DDEO can see all users - no filtering
        }
        else if (requestingUser.role === 'AEO') {
          // AEO can only see HEAD_TEACHER in their cluster/assigned schools (not teachers)
          users = users.filter(u => {
            if (u.role !== 'HEAD_TEACHER') return false;

            const inCluster = u.clusterId && u.clusterId === requestingUser.clusterId;
            const inAssignedSchool = u.schoolName && requestingUser.assignedSchools &&
                                     requestingUser.assignedSchools.includes(u.schoolName);

            return inCluster || inAssignedSchool;
          });
        }
        else if (requestingUser.role === 'HEAD_TEACHER') {
          // HEAD_TEACHER can only see TEACHER in their school
          users = users.filter(u =>
            u.role === 'TEACHER' && u.schoolId === requestingUser.schoolId
          );
        }
        else {
          // Teachers and others cannot view users
          return res.status(403).json({ error: "Access denied. Insufficient permissions." });
        }
      }

      res.json(users.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      console.error('Error fetching users:', error);
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

  // Staff statistics endpoint - returns counts by role with filtering based on user access
  app.get("/api/staff-stats", async (req, res) => {
    try {
      const { userId } = req.query as { userId?: string };
      
      if (!userId) {
        return res.status(401).json({ error: "User ID is required" });
      }
      
      const requestingUser = await findUserByIdOrPhone(userId);
      if (!requestingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get all users (approved ones only)
      let allUsers = await storage.getUsersByStatus('approved');
      
      // Filter based on requesting user's role and access
      if (requestingUser.role === 'CEO' || requestingUser.role === 'DEO' || requestingUser.role === 'DDEO') {
        // Can see all staff
      }
      else if (requestingUser.role === 'AEO') {
        // AEO can only see staff in their cluster/schools
        allUsers = allUsers.filter(u => {
          if (u.role !== 'HEAD_TEACHER' && u.role !== 'TEACHER') return false;
          const inCluster = u.clusterId && u.clusterId === requestingUser.clusterId;
          const inAssignedSchool = u.schoolName && requestingUser.assignedSchools &&
                                   requestingUser.assignedSchools.includes(u.schoolName);
          return inCluster || inAssignedSchool;
        });
      }
      else if (requestingUser.role === 'HEAD_TEACHER') {
        // HEAD_TEACHER can only see teachers in their school
        allUsers = allUsers.filter(u =>
          u.role === 'TEACHER' && u.schoolId === requestingUser.schoolId
        );
      }
      else {
        // Teachers see no staff statistics
        allUsers = []
      }
      
      // Count by role
      const aeos = allUsers.filter(u => u.role === 'AEO');
      const headTeachers = allUsers.filter(u => u.role === 'HEAD_TEACHER');
      const teachers = allUsers.filter(u => u.role === 'TEACHER');
      
      res.json({
        aeos: {
          total: aeos.length,
          present: aeos.length, // For now, all approved users are considered present
          onLeave: 0,
          absent: 0,
        },
        headTeachers: {
          total: headTeachers.length,
          present: headTeachers.length,
          onLeave: 0,
          absent: 0,
        },
        teachers: {
          total: teachers.length,
          present: teachers.length,
          onLeave: 0,
          absent: 0,
        },
      });
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      res.status(500).json({ error: "Failed to fetch staff statistics" });
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

      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const user = await storage.getUserByUsername(phoneNumber);

      if (!user) {
        console.log("Login failed - user not found for phone:", phoneNumber);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user account is pending approval
      if (user.status === 'pending') {
        console.log("Login failed - account pending approval for:", user.name);
        return res.status(403).json({ 
          error: "Your account is pending approval. Please wait for your supervisor to approve your registration.",
          status: "pending"
        });
      }

      // Check if user account is restricted
      if (user.status === 'restricted') {
        console.log("Login failed - account restricted for:", user.name);
        return res.status(403).json({ 
          error: "Your account has been restricted. Please contact your supervisor.",
          status: "restricted"
        });
      }

      // All roles require password
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      if (user.password !== password) {
        console.log("Login failed - password mismatch for user:", user.name);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log(`Login successful for ${user.role}: ${user.name} (status: ${user.status})`);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Login error:", error);
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
        aeoSchools,
        teacherSchools,
      } = req.body;

      // Validation
      if (!name || !phoneNumber || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Password required for all roles
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const finalPassword = password;

      // Check if phone number already exists
      const existingUser = await storage.getUserByUsername(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      // Validate role-specific fields
      if (role === 'AEO' && !markazName && !clusterId) {
        return res.status(400).json({ error: "Markaz name required for AEO" });
      }
      if (role === 'AEO' && (!aeoSchools || aeoSchools.length === 0)) {
        return res.status(400).json({ error: "School selection required for AEO" });
      }
      if ((role === 'HEAD_TEACHER' || role === 'TEACHER') && (!teacherSchools || teacherSchools.length === 0)) {
        return res.status(400).json({ error: "School selection required" });
      }
      if (role === 'DDEO' && !districtId) {
        return res.status(400).json({ error: "District selection required for DDEO" });
      }

      // Helper function to save new schools to database
      const saveNewSchools = async (schools: Array<{ name: string; emis: string }>) => {
        const savedSchoolNames: string[] = [];
        for (const school of schools) {
          // Check if school already exists by EMIS
          const existingSchool = await storage.getSchoolByEmis(school.emis);
          if (existingSchool) {
            savedSchoolNames.push(existingSchool.name);
          } else {
            // Create new school in database
            try {
              const newSchool = await storage.createSchool({
                name: school.name,
                code: school.emis || `CUSTOM-${Date.now()}`,
                emisNumber: school.emis || `CUSTOM-${Date.now()}`,
                clusterId: markazName || clusterId || 'DEFAULT',
                districtId: districtId || 'Rawalpindi',
              });
              savedSchoolNames.push(newSchool.name);
              console.log('[Signup] Created new school:', newSchool.name, newSchool.emisNumber);
            } catch (err) {
              console.log('[Signup] School may already exist, using name:', school.name);
              savedSchoolNames.push(school.name);
            }
          }
        }
        return savedSchoolNames;
      };

      // For school staff, handle schools from new format
      let schoolId = null;
      let schoolName = null;
      let schoolClusterId = null;
      let schoolDistrictId = null;
      let finalAssignedSchools: string[] = assignedSchools || [];

      // Handle Teacher/Head Teacher schools
      if ((role === 'HEAD_TEACHER' || role === 'TEACHER') && teacherSchools && teacherSchools.length > 0) {
        // Save new schools and get first school as primary
        const savedSchoolNames = await saveNewSchools(teacherSchools);
        const firstSchool = teacherSchools[0];
        
        // Look up or use the first school
        const existingSchool = await storage.getSchoolByEmis(firstSchool.emis);
        if (existingSchool) {
          schoolId = existingSchool.id;
          schoolName = existingSchool.name;
          schoolClusterId = existingSchool.clusterId;
          schoolDistrictId = existingSchool.districtId;
        } else {
          schoolName = firstSchool.name;
        }
        
        // Store all school names for reference
        finalAssignedSchools = savedSchoolNames;
      }

      // Handle AEO schools
      if (role === 'AEO' && aeoSchools && aeoSchools.length > 0) {
        const savedSchoolNames = await saveNewSchools(aeoSchools);
        finalAssignedSchools = savedSchoolNames;
      }

      // Legacy support for schoolEmis (if still used)
      if (schoolEmis && !schoolId) {
        console.log('[Signup] Looking up school by EMIS:', schoolEmis);
        const school = await storage.getSchoolByEmis(schoolEmis);
        console.log('[Signup] School lookup result:', school);
        if (school) {
          schoolId = school.id;
          schoolName = school.name;
          schoolClusterId = school.clusterId;
          schoolDistrictId = school.districtId;
        }
      }

      // Determine approver role based on user role
      let approverRole = null;
      let accountStatus = 'pending'; // Default to pending, requires approval

      if (role === 'AEO') {
        approverRole = 'DEO'; // AEO accounts approved by DEO or DDEO
      } else if (role === 'HEAD_TEACHER') {
        approverRole = 'AEO'; // Head Teacher accounts approved by AEO
      } else if (role === 'TEACHER') {
        approverRole = 'HEAD_TEACHER'; // Teacher accounts approved by Head Teacher
      } else {
        // CEO, DEO, DDEO, TRAINING_MANAGER should not be created via signup
        // But if they are, require DEO approval
        approverRole = 'DEO';
      }

      // Create pending user (awaiting approval)
      const newUser = await storage.createUser({
        name,
        phoneNumber,
        password: finalPassword,
        role,
        status: accountStatus,
        approverRole,
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
        assignedSchools: finalAssignedSchools,
        markaz: markazName || null,
      });

      // Return appropriate message based on approver
      let approverMessage = '';
      if (role === 'AEO') {
        approverMessage = 'DEO/DDEO';
      } else if (role === 'HEAD_TEACHER') {
        approverMessage = 'AEO';
      } else if (role === 'TEACHER') {
        approverMessage = 'Head Teacher';
      }

      res.json({
        success: true,
        message: `Account request submitted! Awaiting approval from ${approverMessage}.`
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: "Failed to create account request",
        details: error.message || "Unknown error"
      });
    }
  });

  // Hierarchical User Management endpoints
  app.get("/api/admin/pending-users", async (req, res) => {
    try {
      const { userId } = req.query;

      // Get the requesting user (supports both ID and phone number lookup)
      const user = await findUserByIdOrPhone(userId as string);
      if (!user) {
        return res.status(403).json({ error: "Access denied. User not found." });
      }

      // Get all pending users
      const allPendingUsers = await storage.getUsersByStatus('pending');

      // Filter based on role hierarchy
      let filteredUsers = [];

      if (user.role === 'DEO' || user.role === 'DDEO' || user.role === 'CEO') {
        // DEO/DDEO/CEO can see all pending users in the district
        filteredUsers = allPendingUsers;
      }
      else if (user.role === 'AEO') {
        // AEO can see pending HEAD_TEACHER and TEACHER in their cluster/schools
        filteredUsers = allPendingUsers.filter(u => {
          if (u.role !== 'HEAD_TEACHER' && u.role !== 'TEACHER') return false;

          // Check if user is in AEO's cluster or assigned schools (case-insensitive)
          const inCluster = u.clusterId && u.clusterId === user.clusterId;
          const userSchoolNameLower = u.schoolName?.toLowerCase() || '';
          const inAssignedSchool = userSchoolNameLower && user.assignedSchools &&
                                   user.assignedSchools.some((s: string) => s.toLowerCase() === userSchoolNameLower);

          return inCluster || inAssignedSchool;
        });
      }
      else if (user.role === 'HEAD_TEACHER') {
        // HEAD_TEACHER can see pending TEACHER in their school only
        filteredUsers = allPendingUsers.filter(u =>
          u.role === 'TEACHER' && u.schoolId === user.schoolId
        );
      }
      else {
        // Teachers and others cannot manage users
        return res.status(403).json({ error: "Access denied. Insufficient permissions." });
      }

      res.json(filteredUsers.map(u => ({ ...u, password: undefined })));
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  app.patch("/api/admin/users/:id/approve", async (req, res) => {
    try {
      const { approverId } = req.body;

      // Get approver user (supports both ID and phone number lookup)
      const approver = await findUserByIdOrPhone(approverId);
      if (!approver) {
        return res.status(403).json({ error: "Access denied. Approver not found." });
      }

      // Get user to be approved
      const userToApprove = await storage.getUser(req.params.id);
      if (!userToApprove) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate hierarchical approval permissions
      if (userToApprove.role === 'AEO') {
        // Only DEO or DDEO can approve AEO accounts
        if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only DEO/DDEO can approve AEO accounts."
          });
        }
      }
      else if (userToApprove.role === 'HEAD_TEACHER') {
        // Only AEO (in same cluster) can approve HEAD_TEACHER accounts
        if (approver.role !== 'AEO' && approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only AEO can approve Head Teacher accounts."
          });
        }

        // If approver is AEO, verify Head Teacher is in their cluster/schools (case-insensitive)
        if (approver.role === 'AEO') {
          const inCluster = userToApprove.clusterId && userToApprove.clusterId === approver.clusterId;
          const userSchoolLower = userToApprove.schoolName?.toLowerCase() || '';
          const inAssignedSchool = userSchoolLower && approver.assignedSchools &&
                                   approver.assignedSchools.some((s: string) => s.toLowerCase() === userSchoolLower);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot approve user outside your cluster or assigned schools."
            });
          }
        }
      }
      else if (userToApprove.role === 'TEACHER') {
        // HEAD_TEACHER (same school) or AEO (same cluster) can approve TEACHER accounts
        if (approver.role === 'HEAD_TEACHER') {
          // Verify Teacher is in Head Teacher's school
          if (userToApprove.schoolId !== approver.schoolId) {
            return res.status(403).json({
              error: "Cannot approve teacher outside your school."
            });
          }
        }
        else if (approver.role === 'AEO') {
          // Verify Teacher is in AEO's cluster/schools (case-insensitive)
          const inCluster = userToApprove.clusterId && userToApprove.clusterId === approver.clusterId;
          const userSchoolLower = userToApprove.schoolName?.toLowerCase() || '';
          const inAssignedSchool = userSchoolLower && approver.assignedSchools &&
                                   approver.assignedSchools.some((s: string) => s.toLowerCase() === userSchoolLower);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot approve user outside your cluster or assigned schools."
            });
          }
        }
        else if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only Head Teacher, AEO, or DEO/DDEO can approve Teacher accounts."
          });
        }
      }
      else {
        // For other roles (CEO, DEO, DDEO, TRAINING_MANAGER), only DEO/DDEO/CEO can approve
        if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Insufficient permissions to approve this account."
          });
        }
      }

      // Approve user - update status, set approver ID and timestamp
      const updatedUser = await storage.updateUser(req.params.id, {
        status: 'active',
        approverId: approver.id,
        approvedAt: new Date()
      });

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  app.patch("/api/admin/users/:id/reject", async (req, res) => {
    try {
      const { approverId } = req.body;

      // Get approver user (supports both ID and phone number lookup)
      const approver = await findUserByIdOrPhone(approverId);
      if (!approver) {
        return res.status(403).json({ error: "Access denied. Approver not found." });
      }

      // Get user to be rejected
      const userToReject = await storage.getUser(req.params.id);
      if (!userToReject) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate hierarchical rejection permissions (same as approval)
      if (userToReject.role === 'AEO') {
        if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only DEO/DDEO can reject AEO accounts."
          });
        }
      }
      else if (userToReject.role === 'HEAD_TEACHER') {
        if (approver.role !== 'AEO' && approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only AEO can reject Head Teacher accounts."
          });
        }

        if (approver.role === 'AEO') {
          const inCluster = userToReject.clusterId && userToReject.clusterId === approver.clusterId;
          const userSchoolLower = userToReject.schoolName?.toLowerCase() || '';
          const inAssignedSchool = userSchoolLower && approver.assignedSchools &&
                                   approver.assignedSchools.some((s: string) => s.toLowerCase() === userSchoolLower);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot reject user outside your cluster or assigned schools."
            });
          }
        }
      }
      else if (userToReject.role === 'TEACHER') {
        if (approver.role === 'HEAD_TEACHER') {
          if (userToReject.schoolId !== approver.schoolId) {
            return res.status(403).json({
              error: "Cannot reject teacher outside your school."
            });
          }
        }
        else if (approver.role === 'AEO') {
          const inCluster = userToReject.clusterId && userToReject.clusterId === approver.clusterId;
          const userSchoolLower = userToReject.schoolName?.toLowerCase() || '';
          const inAssignedSchool = userSchoolLower && approver.assignedSchools &&
                                   approver.assignedSchools.some((s: string) => s.toLowerCase() === userSchoolLower);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot reject user outside your cluster or assigned schools."
            });
          }
        }
        else if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only Head Teacher, AEO, or DEO/DDEO can reject Teacher accounts."
          });
        }
      }
      else {
        if (approver.role !== 'DEO' && approver.role !== 'DDEO' && approver.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Insufficient permissions to reject this account."
          });
        }
      }

      // Delete the rejected user
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ error: "Failed to reject user" });
    }
  });

  app.patch("/api/admin/users/:id/restrict", async (req, res) => {
    try {
      const { adminId } = req.body;

      // Get admin user (supports both ID and phone number lookup)
      const admin = await findUserByIdOrPhone(adminId);
      if (!admin) {
        return res.status(403).json({ error: "Access denied. Admin not found." });
      }

      // Get user to be restricted
      const userToRestrict = await storage.getUser(req.params.id);
      if (!userToRestrict) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate hierarchical restriction permissions
      // Users can only restrict subordinates in their hierarchy
      if (userToRestrict.role === 'AEO') {
        if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only DEO/DDEO can restrict AEO accounts."
          });
        }
      }
      else if (userToRestrict.role === 'HEAD_TEACHER') {
        if (admin.role !== 'AEO' && admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only AEO can restrict Head Teacher accounts."
          });
        }

        if (admin.role === 'AEO') {
          const inCluster = userToRestrict.clusterId && userToRestrict.clusterId === admin.clusterId;
          const inAssignedSchool = userToRestrict.schoolName && admin.assignedSchools &&
                                   admin.assignedSchools.includes(userToRestrict.schoolName);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot restrict user outside your cluster or assigned schools."
            });
          }
        }
      }
      else if (userToRestrict.role === 'TEACHER') {
        if (admin.role === 'HEAD_TEACHER') {
          if (userToRestrict.schoolId !== admin.schoolId) {
            return res.status(403).json({
              error: "Cannot restrict teacher outside your school."
            });
          }
        }
        else if (admin.role === 'AEO') {
          const inCluster = userToRestrict.clusterId && userToRestrict.clusterId === admin.clusterId;
          const inAssignedSchool = userToRestrict.schoolName && admin.assignedSchools &&
                                   admin.assignedSchools.includes(userToRestrict.schoolName);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot restrict user outside your cluster or assigned schools."
            });
          }
        }
        else if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only Head Teacher, AEO, or DEO/DDEO can restrict Teacher accounts."
          });
        }
      }
      else {
        if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Insufficient permissions to restrict this account."
          });
        }
      }

      const user = await storage.updateUser(req.params.id, { status: 'restricted' });
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error('Error restricting user:', error);
      res.status(500).json({ error: "Failed to restrict user" });
    }
  });

  app.patch("/api/admin/users/:id/unrestrict", async (req, res) => {
    try {
      const { adminId } = req.body;

      // Get admin user (supports both ID and phone number lookup)
      const admin = await findUserByIdOrPhone(adminId);
      if (!admin) {
        return res.status(403).json({ error: "Access denied. Admin not found." });
      }

      // Get user to be unrestricted
      const userToUnrestrict = await storage.getUser(req.params.id);
      if (!userToUnrestrict) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate hierarchical unrestriction permissions (same as restriction)
      if (userToUnrestrict.role === 'AEO') {
        if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only DEO/DDEO can unrestrict AEO accounts."
          });
        }
      }
      else if (userToUnrestrict.role === 'HEAD_TEACHER') {
        if (admin.role !== 'AEO' && admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only AEO can unrestrict Head Teacher accounts."
          });
        }

        if (admin.role === 'AEO') {
          const inCluster = userToUnrestrict.clusterId && userToUnrestrict.clusterId === admin.clusterId;
          const inAssignedSchool = userToUnrestrict.schoolName && admin.assignedSchools &&
                                   admin.assignedSchools.includes(userToUnrestrict.schoolName);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot unrestrict user outside your cluster or assigned schools."
            });
          }
        }
      }
      else if (userToUnrestrict.role === 'TEACHER') {
        if (admin.role === 'HEAD_TEACHER') {
          if (userToUnrestrict.schoolId !== admin.schoolId) {
            return res.status(403).json({
              error: "Cannot unrestrict teacher outside your school."
            });
          }
        }
        else if (admin.role === 'AEO') {
          const inCluster = userToUnrestrict.clusterId && userToUnrestrict.clusterId === admin.clusterId;
          const inAssignedSchool = userToUnrestrict.schoolName && admin.assignedSchools &&
                                   admin.assignedSchools.includes(userToUnrestrict.schoolName);

          if (!inCluster && !inAssignedSchool) {
            return res.status(403).json({
              error: "Cannot unrestrict user outside your cluster or assigned schools."
            });
          }
        }
        else if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Only Head Teacher, AEO, or DEO/DDEO can unrestrict Teacher accounts."
          });
        }
      }
      else {
        if (admin.role !== 'DEO' && admin.role !== 'DDEO' && admin.role !== 'CEO') {
          return res.status(403).json({
            error: "Access denied. Insufficient permissions to unrestrict this account."
          });
        }
      }

      const user = await storage.updateUser(req.params.id, { status: 'active' });
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error('Error unrestricting user:', error);
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

  app.get("/api/community-albums", async (req, res) => {
    try {
      const albums = await storage.getAllAlbums();
      const albumsWithDetails = await Promise.all(
        albums.map(async (album) => {
          const photos = await storage.getAlbumPhotos(album.id);
          const comments = await storage.getAlbumComments(album.id);
          const reactions = await storage.getAlbumReactions(album.id);
          const creator = await storage.getUser(album.createdBy);
          return { 
            ...album, 
            photos, 
            comments, 
            reactions,
            createdByProfilePicture: creator?.profilePicture || null
          };
        })
      );
      res.json(albumsWithDetails);
    } catch (error) {
      console.error('Failed to fetch community albums:', error);
      res.status(500).json({ error: "Failed to fetch community albums" });
    }
  });

  app.delete("/api/albums/:id", async (req, res) => {
    try {
      const { userId, userRole, userSchoolId } = req.query as any;
      const album = await storage.getAlbum(req.params.id);
      
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }
      
      const canDelete = 
        album.createdBy === userId ||
        (userRole === 'HEAD_TEACHER' && album.schoolId === userSchoolId) ||
        ['AEO', 'DEO', 'DDEO', 'CEO'].includes(userRole);
      
      if (!canDelete) {
        return res.status(403).json({ error: "You don't have permission to delete this post" });
      }
      
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
      
      const album = await storage.getAlbum(req.params.albumId);
      if (album && album.createdBy !== req.body.userId) {
        const reactionEmoji = {
          like: '👍',
          love: '❤️',
          clap: '👏',
          celebrate: '🎉'
        }[req.body.reactionType] || '👍';
        
        await storage.createNotification({
          userId: album.createdBy,
          title: 'New Reaction on Your Post',
          message: `${req.body.userName} reacted ${reactionEmoji} to your post "${album.title}"`,
          type: 'album',
          priority: 'low',
          actionUrl: '/community-album',
          relatedId: album.id,
          createdBy: req.body.userId,
        });
      }
      
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

  app.put("/api/activities/monitoring/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const updatedVisit = await storage.updateMonitoringVisit(id, visitData);
      res.json(updatedVisit);
    } catch (error: any) {
      console.error("Monitoring visit update error:", error?.message || error);
      res.status(400).json({ error: "Failed to update monitoring visit", details: error?.message || String(error) });
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

  app.put("/api/activities/mentoring/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const updatedVisit = await storage.updateMentoringVisit(id, visitData);
      res.json(updatedVisit);
    } catch (error: any) {
      console.error("Mentoring visit update error:", error?.message || error);
      res.status(400).json({ error: "Failed to update mentoring visit", details: error?.message || String(error) });
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

  app.put("/api/activities/office/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const visitData = {
        ...req.body,
        submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : undefined,
      };
      const updatedVisit = await storage.updateOfficeVisit(id, visitData);
      res.json(updatedVisit);
    } catch (error: any) {
      console.error("Office visit update error:", error?.message || error);
      res.status(400).json({ error: "Failed to update office visit", details: error?.message || String(error) });
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

  // Push notification subscriptions
  app.post("/api/push-subscriptions", async (req, res) => {
    try {
      const { userId, endpoint, p256dh, auth, featureType } = req.body;

      if (!endpoint || !featureType) {
        return res.status(400).json({ error: "Missing required fields: endpoint, featureType" });
      }

      // Check if subscription already exists
      const existing = await storage.getPushSubscriptionByEndpoint(endpoint);
      if (existing) {
        return res.json({ message: "Already subscribed", subscription: existing });
      }

      const subscription = await storage.createPushSubscription({
        userId: userId || null,
        endpoint,
        p256dh: p256dh || '',
        auth: auth || '',
        featureType
      });

      res.json({ message: "Subscribed successfully", subscription });
    } catch (error: any) {
      console.error("Push subscription error:", error);
      res.status(500).json({ error: "Failed to save subscription" });
    }
  });

  app.get("/api/push-subscriptions/:featureType", async (req, res) => {
    try {
      const { featureType } = req.params;
      const subscriptions = await storage.getPushSubscriptionsByFeature(featureType);
      res.json(subscriptions);
    } catch (error: any) {
      console.error("Get subscriptions error:", error);
      res.status(500).json({ error: "Failed to get subscriptions" });
    }
  });

  // GPS Tracking endpoints
  app.post("/api/gps-tracking/bulk", async (req, res) => {
    try {
      const { points } = req.body;

      if (!points || !Array.isArray(points)) {
        return res.status(400).json({ error: "Invalid points data" });
      }

      // Store all GPS points
      let syncedCount = 0;
      for (const point of points) {
        try {
          await storage.createGpsTrackingPoint({
            entityId: point.entityId,
            entityType: point.entityType,
            userId: point.userId,
            latitude: point.latitude,
            longitude: point.longitude,
            accuracy: point.accuracy,
            altitude: point.altitude,
            speed: point.speed,
            heading: point.heading,
            timestamp: new Date(point.timestamp),
            synced: true // Mark as synced since we received it
          });
          syncedCount++;
        } catch (error) {
          console.error("Failed to store GPS point:", error);
        }
      }

      console.log(`Synced ${syncedCount}/${points.length} GPS points`);
      res.json({
        success: true,
        syncedCount,
        totalReceived: points.length
      });
    } catch (error: any) {
      console.error("GPS bulk upload error:", error);
      res.status(500).json({ error: "Failed to sync GPS points" });
    }
  });

  app.get("/api/gps-trail/:entityId", async (req, res) => {
    try {
      const { entityId } = req.params;
      const { startTime, endTime } = req.query;

      const points = await storage.getGpsTrackingPoints(
        entityId,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined
      );

      // Return points sorted by timestamp
      const sortedPoints = points.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      res.json({
        entityId,
        pointCount: sortedPoints.length,
        points: sortedPoints
      });
    } catch (error: any) {
      console.error("GPS trail fetch error:", error);
      res.status(500).json({ error: "Failed to fetch GPS trail" });
    }
  });

  app.get("/api/gps-tracking/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = 7 } = req.query;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - Number(days));

      // Get all points for user since cutoff
      const allPoints = await storage.getGpsTrackingPointsByUser(userId);
      const recentPoints = allPoints.filter(p =>
        new Date(p.timestamp) >= cutoffDate
      );

      // Group by entity
      const byEntity: Record<string, number> = {};
      recentPoints.forEach(point => {
        byEntity[point.entityId] = (byEntity[point.entityId] || 0) + 1;
      });

      res.json({
        userId,
        totalPoints: recentPoints.length,
        entities: Object.keys(byEntity).length,
        byEntity,
        oldestPoint: recentPoints.length > 0
          ? recentPoints[0].timestamp
          : null,
        newestPoint: recentPoints.length > 0
          ? recentPoints[recentPoints.length - 1].timestamp
          : null
      });
    } catch (error: any) {
      console.error("GPS stats error:", error);
      res.status(500).json({ error: "Failed to fetch GPS stats" });
    }
  });

  // Link GPS points from session to visit (update entityId and entityType)
  app.patch("/api/gps-tracking/link-to-visit", async (req, res) => {
    try {
      const { sessionId, visitId, visitType } = req.body;

      if (!sessionId || !visitId || !visitType) {
        return res.status(400).json({ error: "Missing required fields: sessionId, visitId, visitType" });
      }

      // Update GPS points from session to visit
      const updatedCount = await storage.updateGpsPointsEntity(
        sessionId,
        visitId,
        visitType
      );

      console.log(`Linked ${updatedCount} GPS points from session ${sessionId} to visit ${visitId}`);
      res.json({
        success: true,
        updatedCount,
        sessionId,
        visitId
      });
    } catch (error: any) {
      console.error("GPS link error:", error);
      res.status(500).json({ error: "Failed to link GPS points to visit" });
    }
  });

  return httpServer;
}

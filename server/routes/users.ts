import { Router } from "express";
import { db } from "../../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get user profile by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user[0];

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update user profile
router.patch("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      fatherName,
      spouseName,
      email,
      residentialAddress,
      cnic,
      dateOfBirth,
      dateOfJoining,
      qualification,
      profilePicture,
      phoneNumber,
    } = req.body;

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (fatherName !== undefined) updateData.fatherName = fatherName;
    if (spouseName !== undefined) updateData.spouseName = spouseName;
    if (email !== undefined) updateData.email = email;
    if (residentialAddress !== undefined)
      updateData.residentialAddress = residentialAddress;
    if (cnic !== undefined) updateData.cnic = cnic;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (dateOfJoining !== undefined) updateData.dateOfJoining = dateOfJoining;
    if (qualification !== undefined) updateData.qualification = qualification;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser[0];

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

export default router;

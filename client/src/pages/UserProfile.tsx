import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Save, X, User, ArrowLeft, School } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  role: string;
  schoolId?: string;
  schoolName?: string;
  clusterId?: string;
  districtId?: string;
  fatherName?: string;
  email?: string;
  residentialAddress?: string;
  cnic?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  qualification?: string;
  profilePicture?: string;
  assignedSchools?: string[];
}

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to view your profile",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    fetchProfile();

    // Fetch available schools for AEO
    if (user?.role === 'AEO' && user?.clusterId) {
      fetchAvailableSchools(user.clusterId);
    }
  }, [user?.id]);

  const fetchAvailableSchools = async (clusterId: string) => {
    try {
      const response = await fetch(`/api/admin/clusters/${clusterId}/schools`);
      if (response.ok) {
        const schools = await response.json();
        setAvailableSchools(schools);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      console.log("Saving profile with data:", editedProfile);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setEditMode(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSchool = (schoolId: string) => {
    setEditedProfile((prev) => {
      const current = prev.assignedSchools || [];
      const updated = current.includes(schoolId)
        ? current.filter(id => id !== schoolId)
        : [...current, schoolId];
      return { ...prev, assignedSchools: updated };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
            </div>
            {!editMode ? (
              <Button onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                {editMode ? (
                  <Input
                    value={editedProfile.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">{profile.name}</p>
                )}
              </div>

              <div>
                <Label>Father Name</Label>
                {editMode ? (
                  <Input
                    value={editedProfile.fatherName || ""}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">{profile.fatherName || "Not provided"}</p>
                )}
              </div>

              <div>
                <Label>CNIC</Label>
                {editMode ? (
                  <Input
                    value={editedProfile.cnic || ""}
                    onChange={(e) => handleChange("cnic", e.target.value)}
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                ) : (
                  <p className="mt-1 text-sm">{profile.cnic || "Not provided"}</p>
                )}
              </div>

              <div>
                <Label>Date of Birth</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={editedProfile.dateOfBirth || ""}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                )}
              </div>

              <div>
                <Label>Date of Joining</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={editedProfile.dateOfJoining || ""}
                    onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {profile.dateOfJoining
                      ? new Date(profile.dateOfJoining).toLocaleDateString()
                      : "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                {editMode && profile.role === 'DEO' ? (
                  <Input
                    type="tel"
                    data-testid="input-phone-number"
                    value={editedProfile.phoneNumber || ""}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="mt-1 text-sm" data-testid="text-phone-number">{profile.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                {editMode ? (
                  <Input
                    type="email"
                    value={editedProfile.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">{profile.email || "Not provided"}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label>Residential Address</Label>
                {editMode ? (
                  <Textarea
                    value={editedProfile.residentialAddress || ""}
                    onChange={(e) => handleChange("residentialAddress", e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {profile.residentialAddress || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <p className="mt-1 text-sm">{profile.role}</p>
              </div>

              <div>
                <Label>Qualification</Label>
                {editMode ? (
                  <Input
                    value={editedProfile.qualification || ""}
                    onChange={(e) => handleChange("qualification", e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm">{profile.qualification || "Not provided"}</p>
                )}
              </div>

              {profile.schoolName && (
                <div>
                  <Label>School</Label>
                  <p className="mt-1 text-sm">{profile.schoolName}</p>
                </div>
              )}

              {profile.districtId && (
                <div>
                  <Label>District</Label>
                  <p className="mt-1 text-sm">{profile.districtId}</p>
                </div>
              )}
            </div>
          </div>

          {/* AEO School Selection - Only for AEO users */}
          {profile.role === 'AEO' && availableSchools.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <School className="w-5 h-5" />
                Assigned Schools
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select schools you want to monitor. Data will be filtered to show only selected schools.
              </p>
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {availableSchools.map((school) => (
                    <div key={school.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`school-${school.id}`}
                        checked={editedProfile.assignedSchools?.includes(school.id) || false}
                        onCheckedChange={() => toggleSchool(school.id)}
                      />
                      <label
                        htmlFor={`school-${school.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {school.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.assignedSchools && profile.assignedSchools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {profile.assignedSchools.map((schoolId) => {
                        const school = availableSchools.find(s => s.id === schoolId);
                        return school ? (
                          <div key={schoolId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <School className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{school.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No schools assigned. Click Edit Profile to select schools.
                    </p>
                  )}
                </div>
              )}
              {editMode && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected {editedProfile.assignedSchools?.length || 0} out of {availableSchools.length} schools
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

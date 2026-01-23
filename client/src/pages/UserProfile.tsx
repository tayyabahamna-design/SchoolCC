import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Save, X, User, ArrowLeft, School, Camera } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { analytics } from '@/lib/analytics';
import { ProfilePictureEditor } from "@/components/ProfilePictureEditor";

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
  markaz?: string;
}

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [showPictureEditor, setShowPictureEditor] = useState(false);

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
    analytics.navigation.profileViewed();

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
      if (!response.ok) {
        // If API fails, use user data from auth context as fallback
        if (user) {
          const contextProfile: UserProfile = {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            schoolId: user.schoolId,
            schoolName: user.schoolName,
            clusterId: user.clusterId,
            districtId: user.districtId,
            fatherName: user.fatherName,
            email: user.email,
            residentialAddress: user.residentialAddress,
            cnic: user.cnic,
            dateOfBirth: user.dateOfBirth,
            dateOfJoining: user.dateOfJoining,
            qualification: user.qualification,
            profilePicture: user.profilePicture,
            assignedSchools: user.assignedSchools,
          };
          setProfile(contextProfile);
          setEditedProfile(contextProfile);
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Final fallback to context user
      if (user) {
        const contextProfile: UserProfile = {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.schoolName,
          clusterId: user.clusterId,
          districtId: user.districtId,
          fatherName: user.fatherName,
          email: user.email,
          residentialAddress: user.residentialAddress,
          cnic: user.cnic,
          dateOfBirth: user.dateOfBirth,
          dateOfJoining: user.dateOfJoining,
          qualification: user.qualification,
          profilePicture: user.profilePicture,
          assignedSchools: user.assignedSchools,
        };
        setProfile(contextProfile);
        setEditedProfile(contextProfile);
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Use profile ID first (from API), fall back to phone number, then user.id
    const saveId = profile?.id || user?.phoneNumber || user?.id;
    if (!saveId) return;

    try {
      setSaving(true);
      console.log("Saving profile with ID:", saveId, "data:", editedProfile);
      const response = await fetch(`/api/users/${saveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      
      // Sync profile picture and other fields to auth context so they appear everywhere
      updateUser({
        profilePicture: updatedProfile.profilePicture,
        name: updatedProfile.name,
        fatherName: updatedProfile.fatherName,
        email: updatedProfile.email,
        residentialAddress: updatedProfile.residentialAddress,
        cnic: updatedProfile.cnic,
        dateOfBirth: updatedProfile.dateOfBirth,
        dateOfJoining: updatedProfile.dateOfJoining,
        qualification: updatedProfile.qualification,
      });
      
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
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
              <div 
                className={`relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ${editMode ? 'cursor-pointer group' : ''}`}
                onClick={() => editMode && setShowPictureEditor(true)}
                data-testid="button-change-profile-picture"
              >
                {(editedProfile.profilePicture || profile.profilePicture) ? (
                  <img
                    src={editedProfile.profilePicture || profile.profilePicture}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
                {editMode && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
                {editMode && (
                  <button 
                    onClick={() => setShowPictureEditor(true)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Change photo
                  </button>
                )}
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
                    className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
                    className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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

      <ProfilePictureEditor
        open={showPictureEditor}
        currentImage={editedProfile.profilePicture || profile.profilePicture}
        onSave={(imageDataUrl) => {
          setEditedProfile(prev => ({ ...prev, profilePicture: imageDataUrl }));
          setShowPictureEditor(false);
          toast({
            title: "Photo updated",
            description: "Click Save to apply your changes",
          });
        }}
        onCancel={() => setShowPictureEditor(false)}
      />
    </div>
  );
}

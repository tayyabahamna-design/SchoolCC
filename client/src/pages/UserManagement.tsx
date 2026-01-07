import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserCheck, UserX, CheckCircle, XCircle, Trash2, ArrowLeft, Plus, Edit, School, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

interface UserAccount {
  id: string;
  name: string;
  phoneNumber: string;
  role: string;
  status: 'pending' | 'active' | 'restricted';
  schoolName?: string;
  clusterId?: string;
  email?: string;
  createdAt: string;
  assignedSchools?: string[];
}

// All 16 schools in the district (uppercase)
const ALL_SCHOOLS = [
  "GBPS DHOKE ZIARAT",
  "GES JAWA",
  "GGES ANWAR UL ISLAM KAMALABAD",
  "GGES KOTHA KALLAN",
  "GGES PIND HABTAL",
  "GGPS ARAZI SOHAL",
  "GGPS CARRIAGE FACTORY",
  "GGPS CHAKRA",
  "GGPS DHOK MUNSHI",
  "GGPS RAIKA MAIRA",
  "GGPS WESTRIDGE 1",
  "GMPS KHABBA BARALA",
  "GPS CHAK DENAL",
  "GPS DHAMIAL",
  "GPS MILLAT ISLAMIA",
  "GPS REHMATABAD"
];

const AVAILABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'CEO', label: 'CEO' },
  { value: 'DEO', label: 'District Education Officer' },
  { value: 'DDEO', label: 'Deputy DEO' },
  { value: 'AEO', label: 'Assistant Education Officer' },
  { value: 'HEAD_TEACHER', label: 'Head Teacher' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'COACH', label: 'Coach' },
];

export default function UserManagement() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserAccount[]>([]);
  const [restrictedUsers, setRestrictedUsers] = useState<UserAccount[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSchoolsDialog, setShowSchoolsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [managingAeo, setManagingAeo] = useState<UserAccount | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [savingSchools, setSavingSchools] = useState(false);
  
  // Create user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('TEACHER');
  const [newUserSchool, setNewUserSchool] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Permission check - allow both DEO and DDEO
  if (!user || (user.role !== 'DEO' && user.role !== 'DDEO')) {
    navigate('/');
    return null;
  }

  // Helper function to filter and sort users alphabetically
  const filterAndSortUsers = (users: UserAccount[]) => {
    return users
      .filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phoneNumber.includes(searchQuery)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredAllUsers = filterAndSortUsers(allUsers);
  const filteredPendingUsers = filterAndSortUsers(pendingUsers);
  const filteredActiveUsers = filterAndSortUsers(activeUsers);
  const filteredRestrictedUsers = filterAndSortUsers(restrictedUsers);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const [pendingRes, allUsersRes] = await Promise.all([
        fetch(`/api/admin/pending-users?userId=${user.id}`),
        fetch('/api/admin/users'),
      ]);

      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        setPendingUsers(pending);
      }

      if (allUsersRes.ok) {
        const usersData = await allUsersRes.json();
        setAllUsers(usersData);
        setActiveUsers(usersData.filter((u: UserAccount) => u.status === 'active'));
        setRestrictedUsers(usersData.filter((u: UserAccount) => u.status === 'restricted'));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: user.id }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      const approvedUser = pendingUsers.find(u => u.id === userId);
      analytics.admin.userApproved(userId, approvedUser?.role as UserRole);
      
      toast({
        title: 'Success',
        description: 'User account approved',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this account request? This will permanently delete the request.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: user.id }),
      });

      if (!res.ok) throw new Error('Failed to reject');

      const rejectedUser = pendingUsers.find(u => u.id === userId);
      analytics.admin.userRejected(userId, rejectedUser?.role as UserRole);
      
      toast({
        title: 'Success',
        description: 'Account request rejected',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleRestrict = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/restrict`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id }),
      });

      if (!res.ok) throw new Error('Failed to restrict');

      const restrictedUser = activeUsers.find(u => u.id === userId);
      analytics.admin.userRestricted(userId, restrictedUser?.role as UserRole);

      toast({
        title: 'Success',
        description: 'User account restricted',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restrict user',
        variant: 'destructive',
      });
    }
  };

  const handleUnrestrict = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unrestrict`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user.id }),
      });

      if (!res.ok) throw new Error('Failed to unrestrict');

      const unrestrictedUser = restrictedUsers.find(u => u.id === userId);
      analytics.admin.userUnrestricted(userId, unrestrictedUser?.role as UserRole);

      toast({
        title: 'Success',
        description: 'User account reactivated',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reactivate user',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const removedUser = allUsers.find(u => u.id === userId);
      analytics.admin.userRemoved(userId, removedUser?.role as UserRole);

      toast({
        title: 'Success',
        description: 'User account deleted',
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          phoneNumber: newUserPhone,
          password: newUserPassword,
          role: newUserRole,
          schoolName: newUserSchool || undefined,
          status: 'active',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      analytics.admin.userCreatedByAdmin('new-user', newUserRole);
      
      toast({
        title: 'Success',
        description: 'User account created successfully',
      });

      // Reset form
      setNewUserName('');
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserRole('TEACHER');
      setNewUserSchool('');
      setShowCreateDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole, adminId: user.id }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      toast({
        title: 'Success',
        description: 'User role updated',
      });

      setShowEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const openSchoolsDialog = (aeoUser: UserAccount) => {
    setManagingAeo(aeoUser);
    setSelectedSchools(aeoUser.assignedSchools || []);
    setShowSchoolsDialog(true);
  };

  const toggleSchool = (school: string) => {
    setSelectedSchools(prev => 
      prev.includes(school)
        ? prev.filter(s => s !== school)
        : [...prev, school]
    );
  };

  const handleSaveSchools = async () => {
    if (!managingAeo) return;
    
    setSavingSchools(true);
    try {
      const res = await fetch(`/api/admin/users/${managingAeo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignedSchools: selectedSchools,
          adminId: user.id 
        }),
      });

      if (!res.ok) throw new Error('Failed to update schools');

      toast({
        title: 'Success',
        description: `Updated school assignments for ${managingAeo.name}`,
      });

      setShowSchoolsDialog(false);
      setManagingAeo(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update school assignments',
        variant: 'destructive',
      });
    } finally {
      setSavingSchools(false);
    }
  };

  const UserCard = ({ user: userAccount, actions }: { user: UserAccount; actions: React.ReactNode }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {userAccount.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{userAccount.name}</h3>
              <p className="text-sm text-muted-foreground">{userAccount.phoneNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Role:</span>
              <Badge className="ml-1">{userAccount.role}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge 
                className={`ml-1 ${
                  userAccount.status === 'active' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : userAccount.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {userAccount.status}
              </Badge>
            </div>
            {userAccount.schoolName && (
              <div className="col-span-2">
                <span className="text-muted-foreground">School:</span>
                <span className="ml-2 font-medium">{userAccount.schoolName}</span>
              </div>
            )}
            {userAccount.role === 'AEO' && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Assigned Schools:</span>
                <span className="ml-2 font-medium">
                  {userAccount.assignedSchools?.length || 0} school(s)
                </span>
                {userAccount.assignedSchools && userAccount.assignedSchools.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {userAccount.assignedSchools.slice(0, 3).join(', ')}
                    {userAccount.assignedSchools.length > 3 && ` +${userAccount.assignedSchools.length - 3} more`}
                  </div>
                )}
              </div>
            )}
            {userAccount.email && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2">{userAccount.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {userAccount.role === 'AEO' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openSchoolsDialog(userAccount)}
              data-testid={`button-manage-schools-${userAccount.id}`}
            >
              <School className="w-4 h-4 mr-1" />
              Schools
            </Button>
          )}
          {actions}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(user.role === 'DEO' ? '/deo-dashboard' : '/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage account requests and user access</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-users"
              />
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-user">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user account with any role
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    data-testid="input-new-user-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="e.g., 03001234567"
                    required
                    data-testid="input-new-user-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    data-testid="input-new-user-password"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val as UserRole)}>
                    <SelectTrigger data-testid="select-new-user-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="school">School Name (Optional)</Label>
                  <Input
                    id="school"
                    value={newUserSchool}
                    onChange={(e) => setNewUserSchool(e.target.value)}
                    placeholder="For teachers and head teachers"
                    data-testid="input-new-user-school"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="flex-1" data-testid="button-create-user-submit">
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Edit Role Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update role for {editingUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={editingUser?.role || ''}
                onValueChange={(val) => editingUser && handleEditRole(editingUser.id, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>

        {/* AEO School Assignment Dialog */}
        <Dialog open={showSchoolsDialog} onOpenChange={setShowSchoolsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage School Assignments</DialogTitle>
              <DialogDescription>
                Select schools for {managingAeo?.name} to oversee
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Currently assigned: {selectedSchools.length} school(s)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                {ALL_SCHOOLS.map((school) => (
                  <div key={school} className="flex items-center space-x-2">
                    <Checkbox
                      id={`school-${school}`}
                      checked={selectedSchools.includes(school)}
                      onCheckedChange={() => toggleSchool(school)}
                    />
                    <label
                      htmlFor={`school-${school}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {school}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSchoolsDialog(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSchools} 
                  disabled={savingSchools} 
                  className="flex-1"
                  data-testid="button-save-schools"
                >
                  {savingSchools ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">
              <Users className="w-4 h-4 mr-2" />
              All Users ({allUsers.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Users className="w-4 h-4 mr-2" />
              Pending ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              <UserCheck className="w-4 h-4 mr-2" />
              Active ({activeUsers.length})
            </TabsTrigger>
            <TabsTrigger value="restricted">
              <UserX className="w-4 h-4 mr-2" />
              Restricted ({restrictedUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredAllUsers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </Card>
            ) : (
              filteredAllUsers.map((userAccount) => (
                <UserCard
                  key={userAccount.id}
                  user={userAccount}
                  actions={
                    <>
                      {userAccount.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(userAccount.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(userAccount.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : userAccount.status === 'restricted' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUnrestrict(userAccount.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Unrestrict
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(userAccount.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(userAccount);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Role
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestrict(userAccount.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Restrict
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(userAccount.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      )}
                    </>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredPendingUsers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No pending users match your search' : 'No pending account requests'}
              </Card>
            ) : (
              filteredPendingUsers.map((userAccount) => (
                <UserCard
                  key={userAccount.id}
                  user={userAccount}
                  actions={
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(userAccount.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(userAccount.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredActiveUsers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No active users match your search' : 'No active users'}
              </Card>
            ) : (
              filteredActiveUsers.map((userAccount) => (
                <UserCard
                  key={userAccount.id}
                  user={userAccount}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(userAccount);
                          setShowEditDialog(true);
                        }}
                        data-testid={`button-edit-${userAccount.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Role
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestrict(userAccount.id)}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Restrict
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(userAccount.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="restricted" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : filteredRestrictedUsers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {searchQuery ? 'No restricted users match your search' : 'No restricted users'}
              </Card>
            ) : (
              filteredRestrictedUsers.map((userAccount) => (
                <UserCard
                  key={userAccount.id}
                  user={userAccount}
                  actions={
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleUnrestrict(userAccount.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Unrestrict
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(userAccount.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </>
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

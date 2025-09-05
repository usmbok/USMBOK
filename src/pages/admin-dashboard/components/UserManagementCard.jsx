import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const UserManagementCard = ({ users = [] }) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const navigate = useNavigate();

  const handleUserSelect = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected?.has(userId)) {
      newSelected?.delete(userId);
    } else {
      newSelected?.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for users:`, Array.from(selectedUsers));
    // Implement bulk actions here
  };

  const handleAddUser = () => {
    navigate('/user-management?action=add');
  };

  const handleViewAllUsers = () => {
    navigate('/user-management');
  };

  const handleEditUser = (userId) => {
    navigate(`/user-management?action=edit&userId=${userId}`);
  };

  const handleManageCredits = (userId) => {
    navigate(`/user-management?action=credits&userId=${userId}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex space-x-2">
          {selectedUsers?.size > 0 && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('activate')}
                iconName="UserCheck"
              >
                Activate ({selectedUsers?.size})
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                iconName="UserX"
              >
                Deactivate ({selectedUsers?.size})
              </Button>
            </div>
          )}
          <Button 
            variant="default" 
            size="sm" 
            iconName="UserPlus"
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">
                <input 
                  type="checkbox"
                  className="rounded border-border"
                  onChange={(e) => {
                    if (e?.target?.checked) {
                      setSelectedUsers(new Set(users?.map(u => u?.id)));
                    } else {
                      setSelectedUsers(new Set());
                    }
                  }}
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.slice(0, 10)?.map((user) => (
              <tr key={user?.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">
                  <input 
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedUsers?.has(user?.id)}
                    onChange={() => handleUserSelect(user?.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-foreground">{user?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user?.role === 'admin' ?'bg-primary/10 text-primary' :'bg-secondary/10 text-secondary'
                  }`}>
                    {user?.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user?.is_active 
                      ? 'bg-success/10 text-success' :'bg-error/10 text-error'
                  }`}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at)?.toLocaleDateString() : 'Unknown'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      iconName="Edit"
                      onClick={() => handleEditUser(user?.id)}
                      title="Edit User"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      iconName="Coins"
                      onClick={() => handleManageCredits(user?.id)}
                      title="Manage Credits"
                    />
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users?.length > 10 && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewAllUsers}
          >
            View All Users ({users?.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserManagementCard;
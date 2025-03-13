import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { deleteUser } from '@/lib/userService';
import { User } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User | null;
}

export function UserDeleteDialog({ isOpen, onClose, onSuccess, user }: UserDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user data provided for deletion",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { success, error } = await deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting this user will remove all their data from the system. This action is permanent.
          </AlertDescription>
        </Alert>
        
        {user && (
          <div className="py-4">
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role_name}</p>
            {user.department && <p><strong>Department:</strong> {user.department}</p>}
            {user.station && <p><strong>Station:</strong> {user.station}</p>}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
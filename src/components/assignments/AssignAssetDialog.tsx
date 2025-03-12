import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { assignAsset } from '@/lib/assignmentService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface AssignAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: string;
  users: { id: string; full_name: string }[];
}

export function AssignAssetDialog({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  users
}: AssignAssetDialogProps) {
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | undefined>(addDays(new Date(), 14));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  const resetForm = () => {
    setAssignedTo('');
    setExpectedReturnDate(addDays(new Date(), 14));
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!assignedTo) {
      toast({
        title: "Error",
        description: "Please select a user to assign the asset to",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Log the user selection for debugging
      console.log('Selected user:', assignedTo);
      console.log('Available users:', users);
      
      // Verify the user exists
      const selectedUser = users.find(u => u.id === assignedTo);
      if (!selectedUser) {
        throw new Error('Selected user not found in the users list');
      }

      const { success, error } = await assignAsset({
        asset_id: assetId,
        assigned_to: assignedTo,
        assigned_by: currentUserId || "system",
        assignment_date: new Date().toISOString(),
        expected_return_date: expectedReturnDate ? expectedReturnDate.toISOString() : undefined,
        notes: notes || undefined
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Asset assigned to ${selectedUser.full_name} successfully`,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error assigning asset:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            Assign this asset to a user. You can set an expected return date.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="assigned-to">Assign To</Label>
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No users available
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expected-return">Expected Return Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expectedReturnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedReturnDate ? format(expectedReturnDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expectedReturnDate}
                  onSelect={setExpectedReturnDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this assignment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Asset'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
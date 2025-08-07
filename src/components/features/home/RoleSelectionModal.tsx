
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCog, User } from "lucide-react"; 
import { useRouter } from "next/navigation";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function RoleSelectionModal({ isOpen, onOpenChange }: RoleSelectionModalProps) {
  const router = useRouter();

  const handleSelection = (path: string) => {
    router.push(path);
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">Get Started with PhysioPro</DialogTitle>
          <DialogDescription className="text-center text-lg pt-2">
            Are you a clinician or healthcare provider looking to join our platform?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-6">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full py-6 text-base"
            onClick={() => handleSelection('/signup')} 
          >
            <UserCog className="mr-2 h-5 w-5" />
            I'm a Clinician / Provider
          </Button>
        </div>
        <DialogFooter className="sm:justify-center">
          <p className="text-xs text-muted-foreground">
            Patients are typically invited by their clinicians once the clinician has an account.
          </p>
          <Button type="button" variant="ghost" onClick={() => { onOpenChange(false); }}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

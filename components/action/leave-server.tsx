"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader } from "lucide-react";

export const LeaveServer = () => {
  const { isOpen, onClose, type, data } = useDrawerAction();
  const drawerOpen = isOpen && type === "leaveServer";
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
// const { memberRole, serverId } = data?.data as { serverId?: string; memberRole?: string };
// console.log();


  const leaveServer = async () => {
    try {
      setLoading(true);

      await axios.put("/api/server/leaveserver", 
        { serverId:data?.data?.serverId, memberRole:data?.data?.memberRole },
      );
      router.push("/");
      router.refresh();
      toast.success("You Leave the server");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Leave Server</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are yot sure you want to leave?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={loading}
            onClick={leaveServer}
            variant={"destructive"}
          >
            {loading ? <Loader className="animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

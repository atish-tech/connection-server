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

export const DeleteServer = () => {
  const { isOpen, onClose, type, data } = useDrawerAction();
  const drawerOpen = isOpen && type === "deleteServer";
  const router = useRouter();
  const [loading , setLoading] = useState<boolean>(false);

  const onDelete = async () => {
    try {
        setLoading(true);
      await axios.delete(`/api/server/?serverId=${data?.server?.id}`);
      router.push("/");
      router.refresh();
      toast.success("Server Deleted Successfull");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Server Error");
    }finally{
        setLoading(false);
    }
  };

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Delete Server</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are yot sure you want to delete?
            <span>{data?.server?.name}</span>
            will be parmanent deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={onDelete} variant={"destructive"}>
            {loading ? <Loader  className="animate-spin"/> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

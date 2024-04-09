"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import { UploadImage } from "./upload-image";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";
import { ChannelType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CreateServerSchema = z.object({
  name: z.string().min(2, { message: "Please provide a channel name" }),
});

export const CreateChannelDrawer = () => {
  const [name, setname] = useState<string | null>("");
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.TEXT);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { isOpen, onClose, type, data } = useDrawerAction();
  const drawerOpen = isOpen && type === "createChannel";


  const createChannel = async () => {
    // Validate input
    const validate = CreateServerSchema.safeParse({ name });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    // Create server logic here
    try {
      setLoading(true);

      await axios.post("/api/channel", {
        name, serverId:data?.id , type : channelType
      });
      
      router.refresh();
      toast.success("channel created")
    } catch (error) {
      console.log(error);
      toast.error("Somthing went wrong! Try Again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new channel by providing a name and type.
          </DialogDescription>
        </DialogHeader>

        {/* server name */}
        <Input
          className="text-zinc-800 text-xl"
          placeholder="Channel Name"
          onChange={(e) => setname(e.target.value)}
        />

        {/* Channel Type */}
        <Select onValueChange={(type: ChannelType) => setChannelType(type)}>
          <SelectTrigger className="w-full bg-zinc-800 ">
            <SelectValue placeholder="Channel Type" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-700">

            <SelectItem value={ChannelType.TEXT}>{ChannelType.TEXT}</SelectItem>

            <SelectItem value={ChannelType.VOICE}>
              {ChannelType.VOICE}
            </SelectItem>

            <SelectItem value={ChannelType.VIDEO}>
              {ChannelType.VIDEO}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Create Server */}
        <Button
          disabled={loading}
          onClick={createChannel}
          className="bg-green-600 hover:bg-green-500"
        >
          {loading ? <Loader className="animate-spin" /> : "Create Channel"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

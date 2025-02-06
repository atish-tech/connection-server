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
  const [name, setName] = useState<string | null>("");
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.TEXT);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { isOpen, onClose, type, data } = useDrawerAction();

  async function createChannel() {
    // Validate input
    const validate = CreateServerSchema.safeParse({ name });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    // Create server logic here
    try {
      setLoading(true);

      await axios.post("/api/channel", {
        name,
        serverId: data?.id,
        type: channelType,
      });

      router.refresh();
      toast.success("Channel created");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong! Try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <Dialog
      open={isOpen && type === "createChannel"}
      onOpenChange={() => onClose()}
    >
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new channel by providing a name and type.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            placeholder="Channel Name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            value={channelType}
            onValueChange={(value) => setChannelType(value as ChannelType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a channel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ChannelType.TEXT}>Text</SelectItem>
              <SelectItem value={ChannelType.VOICE}>Voice</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={createChannel} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Create Channel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

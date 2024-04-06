"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/utils";
import { PlusCircleIcon } from "lucide-react";
import { UploadImage } from "./upload-image";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";

const CreateServerSchema = z.object({
  imageUrl: z.string().min(10, { message: "Please provide an image" }),
  serverName: z.string().min(2, { message: "Please provide a server name" }),
});

export const CreateServer = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [serverName, setServerName] = useState<string | null>("");

  const createServer = async () => {
    // Validate input
    const validate = CreateServerSchema.safeParse({ imageUrl, serverName });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    // Create server logic here
    try {
      const server = await axios.post("/api/server", { imageUrl, name : serverName });
      console.log(server.data);
    } catch (error) {
      console.log(error);
      toast.error("Somthing went wrong!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon className="h-12 w-12" />
      </DialogTrigger>

      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new server by uploading an image and providing a name.
          </DialogDescription>
        </DialogHeader>

        {/* upload image */}
        <UploadImage setImageUrl={setImageUrl} imageUrl={imageUrl} />

        {/* server name */}
        <Input
          className="text-zinc-800 text-xl"
          placeholder="Server Name"
          onChange={(e) => setServerName(e.target.value)}
        />

        {/* Create Server */}
        <Button onClick={createServer} className="bg-green-500">
          Create Server
        </Button>
      </DialogContent>
    </Dialog>
  );
};

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
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useRouter } from "next/navigation";

const CreateUserSchema = z.object({
  imageUrl: z.string().min(10, { message: "Please provide an image" }),
  userName: z.string().min(2, { message: "Please provide a server name" }),
  email: z.string().email({ message: "Please provide a valid email" }),
});

export const EditProfileDrawer = () => {
  const { isOpen, onClose, type, data} = useDrawerAction();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const drawerOpen = isOpen && type === "editProfile";

  const tempData : any = data;

  useEffect(() => {
    setUserName(tempData?.userName);
    setEmail(tempData?.email);
  }, []);

  const editUser = async () => {
    // Validate input
    const validate = CreateUserSchema.safeParse({ imageUrl, userName , email });
    if (!validate.success) return toast.error(validate.error.errors[0].message);

    // Create server logic here
    try {
      setLoading(true);
      const server = await axios.put("/api/user", {
        imageUrl,
        userName,
        email,
      });
      router.refresh();
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
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new server by uploading an image and providing a name.
          </DialogDescription>
        </DialogHeader>

        {/* upload image */}
        <UploadImage setImageUrl={setImageUrl} imageUrl={imageUrl} />

        {/* user name */}
        <Input
          className="text-zinc-800 text-xl"
          placeholder="Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        {/* user name */}
        <Input
          className="text-zinc-800 text-xl"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Save detail */}
        <Button
          disabled={loading}
          onClick={editUser}
          className="bg-green-600 hover:bg-green-500"
        >
          {loading ? <Loader className="animate-spin" /> : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

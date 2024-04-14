"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useDrawerAction } from "@/hooks/use-drawer-action";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export const InvitePeople = () => {
  const { isOpen, onClose, type, data } = useDrawerAction();
  const drawerOpen = isOpen && type === "invitePeople";
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin: "";;
  const [copy, setCopy] = useState<Boolean>(false);

  const onCopy = () => {
    navigator.clipboard.writeText(`${origin}/invite/${data?.id}`);

    setCopy(true);

    setTimeout(() => {
      setCopy(false);
    }, 2000);
  };

  return (
    <Dialog open={drawerOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-800 text-white border-none">
        {/* title */}
        <DialogHeader>
          <DialogTitle>Invite People</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Invite other people
          </DialogDescription>
        </DialogHeader>

        {/* invite code */}
        <div className="flex items-center justify-center gap-3">
          <Input
            className="text-zinc-800 text-xl h-10"
            value={`${origin}/invite/${data?.id}`}
          />
          <Button onClick={onCopy} className="w-fit h-10">
            {!copy ? (
              <Copy className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          onClick={onClose}
          className="bg-green-600 w-fit hover:bg-green-500"
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

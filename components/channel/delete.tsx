"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteChannel } from "@/serverAction/chennel";
import { Channel, Member, User } from "@prisma/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, MouseEvent } from "react";

export function Delete({ channel , user, member , serverId}: { channel: Channel; user: User; member: Member, serverId: string}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  function onClose() {
    setOpen(false)
  }

  const router = useRouter()

  

  return (
    <Dialog  open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={(e: MouseEvent<HTMLButtonElement>) => {e.stopPropagation()
        setOpen(true)
      }}> 
        <Trash className="w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition hidden group-hover:block" />
      </DialogTrigger>

      <DialogContent className="bg-zinc-900 p-0 overflow-hidden border-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>

          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            <span className="text-indigo-500 font-semibold">
              #{channel.name}
            </span>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-zinc-800 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <DialogClose>
              <Button
                disabled={loading}
               
                variant="destructive"
              >
                Cancel
              </Button>
            </DialogClose>



            <Button
              disabled={loading}
              onClick={async () => {await deleteChannel(channel, user, member, serverId )
                router.refresh();
                onClose()

              }}
              className="bg-blue-700 hover:bg-blue-900"
              >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

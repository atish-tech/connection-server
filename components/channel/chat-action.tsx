import { Delete, Loader, MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { deleteChat } from "@/serverAction/chat";
import { ChannelMessage } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { useMessageStore } from "@/hooks/use-message-store";

export const ChatAction = ({ message }: { message: ChannelMessage }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { deleteMessageFromChat } = useMessageStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto hover:bg-transparent/15 p-2 rounded-full">
        {loading ? (
          <Loader className="animate-spin" />
        ) : (
          <MoreVertical className="h-6 w-6" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-52 bg-zinc-800 text-white border-none"
        align="start"
      >
        {/* <DropdownMenuSeparator className="bg-zinc-700" /> */}

        <DropdownMenuItem className="cursor-pointer hover:bg-red-700">
          <Pencil className="mr-2 h-4 w-4" />

          <span>Edit</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-700" />

        <DropdownMenuItem
          onClick={async () => {
            try {
              setLoading(true);

              await deleteChat(message.id);

              deleteMessageFromChat(message.id);

              toast.success("Message deleted");
            } catch (error) {
              toast.error("You are not allowed to perform this action");
            } finally {
              setLoading(false);
            }
          }}
          className="!text-destructive cursor-pointer"
        >
          <Delete className="mr-2 h-4 w-4" />

          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

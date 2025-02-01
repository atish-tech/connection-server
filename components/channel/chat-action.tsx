import { Delete, MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const ChatAction = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto hover:bg-transparent/15 p-2 rounded-full">
        <MoreVertical className="h-6 w-6" />
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

        <DropdownMenuItem className="!text-destructive cursor-pointer">
          <Delete className="mr-2 h-4 w-4" />

          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

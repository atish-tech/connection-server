"use client";

import { useDrawerAction } from "@/hooks/use-drawer-action";
import { CustomToltip } from "../custom-component/tooltip";
import { PlusCircleIcon } from "lucide-react";

export const CreateServer = () => {
  const { onOpen } = useDrawerAction();
  return (
    <div onClick={() => onOpen("createServer")}>
      <CustomToltip
        component={<PlusCircleIcon className="h-12 w-12" />}
        message={<p>Create Server</p>}
      />
    </div>
  );
};

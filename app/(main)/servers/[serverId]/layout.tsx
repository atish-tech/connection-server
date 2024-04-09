import { ServerSideBar } from "@/components/server/server-side-bar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const ServerLayout = async({ children , params}: { children: React.ReactNode , params: {serverId : string}}) => {
    

    
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="w-full h-full bg-zinc-900/50" defaultSize={30}>
        <ServerSideBar serverId={params.serverId} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={70}>
        <div className="w-full bg-zinc-800/10 h-full">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ServerLayout;

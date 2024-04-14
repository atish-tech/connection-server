import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface CustomToltipProps {
  component: JSX.Element;
  message: JSX.Element;
}

export const CustomToltip = ({ component, message }: CustomToltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{component}</TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-800 text-white border-none">{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

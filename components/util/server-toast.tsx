"use client"
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

interface ServerToastProps {
    type: "Error" | "Success";
    message: string;
}

export const ServerToast = ({type , message } : ServerToastProps) => {
    if(type == "Success") {
        return toast.success(message);
    }
    else{
        return toast.error(message);
    }
}

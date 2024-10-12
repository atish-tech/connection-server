"use client";
import axios from "axios";
import { Loader } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Verify() {
  const token = useSearchParams().get("token");

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const verify = async () => {
    try {
      setLoading(true);
      await axios.post(`api/auth/verify/?token=${token}`);
      router.push("/");
    } catch (error) {
      console.log(error);
      toast("Somthing went wrong , Try Again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
  }, []);

  return (
    <div>
      {loading && (
        <span>
          {" "}
          Verifying user <Loader className="animate-spin" />
        </span>
      )}
    </div>
  );
}

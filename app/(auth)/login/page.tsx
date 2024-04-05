"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const inputSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(4, { message: "Password must be at list 4 charecter long" }),
});

export default function () {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle Subbmit
  const onSubbmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const temp = inputSchema.safeParse(data);

    if (!temp.success) {
      toast(temp.error.errors[0].message);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("api/auth/register/?type=login", {
        ...data,
      });
      router.push("/");
      toast(response.data);
    } catch (error: any) {
      toast(error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // change input
  const inputHandler = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-[400px] relative m-5 md:m-0 w-full flex flex-col items-center justify-center gap-8 h-fit p-5 bg-zinc-800/50 rounded-lg hover:bg-zinc-800/60">
      <div className="w-full flex items-center justify-center gap-5">
        <Image
          src={"/logo.png"}
          className="w-[50px]"
          width={100}
          height={100}
          alt="image"
        />
        {/* <p className="text-xs text-gray-600">Connectionn Server</p> */}
      </div>

      <div className="flex flex-col items-start w-full">
        <p className="text-2xl text-gray-200/75">Welcome back</p>
        <p className="text-sm text-gray-500 ">Login to your account</p>
      </div>
      <Separator className="text-gray-500 bg-gray-700" />
      <form
        onSubmit={onSubbmit}
        className="flex flex-col items-center justify-center w-full gap-5"
      >
        <Input
          onChange={inputHandler}
          type="email"
          name="email"
          placeholder="you@example.com"
          className="w-full h-10 bg-zinc-700/50 rounded-lg border-0 p-2"
        />

        <Input
          onChange={inputHandler}
          type="password"
          name="password"
          placeholder="••••••••"
          className="w-full h-10 bg-zinc-700/50 rounded-lg focus:border-1 border-0 p-2"
        />

        <Button
          disabled={loading}
          type="submit"
          variant="secondary"
          className="ml-auto disabled:cursor-not-allowed"
        >
          {loading ? <Loader className="animate-spin" /> : "Login"}
        </Button>
      </form>
      <p className="text-gray-500">
        Don't have a account?{" "}
        <Link className="text-green-100" href={"register"}>
          Register now
        </Link>{" "}
      </p>
    </div>
  );
}

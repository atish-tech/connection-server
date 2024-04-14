"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

export const LogoAvalibleServer = () => {
    const router = useRouter()
  return (
    <div onClick={() => router.push("/servers/availible")} className="cursor-pointer">
        <Image
          src={"/logo.png"}
          className="w-[50px]"
          width={100}
          height={100}
          alt="image"
        />
      </div>
  )
};
// import React from 'react'
"use client"

import { useUserModel } from "@/hooks/main-store";

const ServerId =  () => {
  const {data , setUserModel} = useUserModel();



  if(data?.isVerified === false && typeof window !== 'undefined') {
    // setUserModel(userData);

  }

  return ( 
    <div>page</div>
  )
}

export default ServerId;

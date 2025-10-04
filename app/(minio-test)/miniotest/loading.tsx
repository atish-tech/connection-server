"use client";

import React from "react";

export default function MinIOTestLoading() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <h2 className="mt-4 text-xl font-semibold">Loading MinIO Test...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we set up your MinIO testing environment</p>
      </div>
    </div>
  );
}

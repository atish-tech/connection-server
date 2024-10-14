export const MessageSkeleton = () => {
  return (
    <div className="flex items-center h-full p-3 gap-3 w-full animate-pulse">
      <div className="p-5 bg-gray-700 rounded-full "></div>
      <div className="flex flex-col gap-2 w-full">
        <div className="w-1/3 h-4 bg-gray-700 rounded sm:w-1/2 sm:h-3"></div>
        <div className="w-2/3 h-6 bg-gray-700 rounded sm:w-3/4 sm:h-4"></div>
        <div className="w-1/4 h-4 bg-gray-700 rounded sm:w-1/3 sm:h-3"></div>
      </div>
      <div className="ml-auto bg-gray-700 rounded w-3 h-7" />
    </div>
  );
};

export const MessageSkeletonGroup = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
    </div>
  );
};

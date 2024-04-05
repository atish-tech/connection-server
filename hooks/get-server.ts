// import { DB } from "@/lib/prisma";

// export const useGetServer = async (userId: string) => {

//     console.log(userId);
    
//      const server =  await DB.server.findMany({
//         where: {
//             members: {
//                 some: {
//                     userId : userId
//                 }
//             }
//         }
//     });

//     console.log(server);
//     return server;
    
// }
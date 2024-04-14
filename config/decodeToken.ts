import jwt, { JwtPayload } from "jsonwebtoken";

export const decodeToken = async (token: string) => {
    try {
        const secret= process.env.JWT_SECRET || ""; 
        
        // const decode = await jwt.verify(token, secret);
        const decode = await jwt.decode(token) as JwtPayload || "";
        return decode?.id;    
    } catch (error) {
        console.log(error);
        
        return false
    }
}
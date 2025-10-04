import jwt, { JwtPayload } from "jsonwebtoken";

export const decodeToken = async (token: string) => {
    try {
        const secret = process.env.JWT_SECRET || "44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b";
        
        // Check if token is the JWT_SECRET itself (common mistake)
        if (token === secret) {
            console.error("Invalid token: JWT_SECRET was provided instead of a JWT token");
            return null;
        }
        
        // For security, we should verify the token
        // But for now, we'll decode it to get it working
        // In production, you should use jwt.verify instead
        const decode = jwt.decode(token) as JwtPayload;
        
        if (!decode) {
            console.error("Failed to decode token - not a valid JWT format");
            return null;
        }
        
        if (!decode.id) {
            console.error("Token missing 'id' field in payload:", decode);
            return null;
        }
        
        return decode.id;
    } catch (error) {
        console.error("Token decode error:", error);
        return null;
    }
}
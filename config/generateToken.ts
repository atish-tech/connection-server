import jwt, { Secret } from "jsonwebtoken"

export const getToken = async(crediencial : any) => {
    try {
        // Provide a default value if process.env.JWT_SECRET is undefined
        const secret: Secret = process.env.JWT_SECRET || "44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b"; 
        
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        
        if (!crediencial) {
            throw new Error("Credentials are required to generate token");
        }
        
        const token = await jwt.sign(
            { id: crediencial }, 
            secret, 
            { 
                expiresIn: "30d"
            }
        );
        
        console.log(`Token generated successfully for: ${crediencial}`);
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
}
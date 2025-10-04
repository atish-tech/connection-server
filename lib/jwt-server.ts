import jwt from 'jsonwebtoken';

/**
 * Server-side JWT decoder that works in Node.js runtime
 * This should be used in API routes and server components
 */
export const decodeTokenServer = async (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || "44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b";
    
    // Check if token is empty or null
    if (!token || token.trim() === '') {
      console.error("No token provided");
      return null;
    }
    
    // Check if token is the JWT_SECRET itself (common mistake)
    if (token === secret) {
      console.error("Invalid token: JWT_SECRET was provided instead of a JWT token");
      return null;
    }
    
    // Check if token has the basic JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid JWT format - token should have 3 parts separated by dots");
      return null;
    }
    
    // Verify and decode the token properly
    const decoded = jwt.verify(token, secret) as any;
    
    if (!decoded) {
      console.error("Failed to verify token");
      return null;
    }
    
    if (!decoded.id) {
      console.error("Token missing 'id' field in payload:", decoded);
      return null;
    }
    
    return decoded.id;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.message);
    } else if (error instanceof jwt.NotBeforeError) {
      console.error("Token not active:", error.message);
    } else {
      console.error("Token decode error:", error);
    }
    return null;
  }
};

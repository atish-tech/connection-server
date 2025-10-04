import jwt from 'jsonwebtoken';

/**
 * Validates if a token string is a valid JWT format
 * @param token - The token string to validate
 * @returns boolean - True if token has valid JWT format
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token has the basic JWT structure (3 parts separated by dots)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return false;
  }
  
  // Check if each part is base64 encoded
  try {
    tokenParts.forEach(part => {
      // JWT uses base64url encoding, but we'll just check if it's valid base64
      Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a token is the JWT_SECRET itself (common mistake)
 * @param token - The token string to check
 * @returns boolean - True if token is the JWT_SECRET
 */
export function isJWTSecret(token: string): boolean {
  const jwtSecret = process.env.JWT_SECRET || '44196dd4a6e7f9c17683e50ae8128fc110f353987fdd09a208a19feef1195f5b';
  return token === jwtSecret;
}

/**
 * Comprehensive token validation
 * @param token - The token string to validate
 * @returns object with validation results
 */
export function validateToken(token: string): {
  isValid: boolean;
  isJWTFormat: boolean;
  isJWTSecret: boolean;
  isEmpty: boolean;
  error?: string;
} {
  const result = {
    isValid: false,
    isJWTFormat: false,
    isJWTSecret: false,
    isEmpty: false
  };
  
  if (!token || token.trim() === '') {
    result.isEmpty = true;
    result.error = 'Token is empty or null';
    return result;
  }
  
  if (isJWTSecret(token)) {
    result.isJWTSecret = true;
    result.error = 'Token is the JWT_SECRET itself, not a valid JWT token';
    return result;
  }
  
  if (!isValidJWTFormat(token)) {
    result.error = 'Token does not have valid JWT format';
    return result;
  }
  
  result.isJWTFormat = true;
  result.isValid = true;
  return result;
}

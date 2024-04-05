import jwt, { Secret } from "jsonwebtoken"

export const getToken = async(crediencial : any) => {
    // Provide a default value if process.env.GENERATE_SECRET is undefined
    const secret: Secret = process.env.JWT_SECRET || ""; 
    return await jwt.sign({id : crediencial} , secret , {expiresIn: "30d"});
}
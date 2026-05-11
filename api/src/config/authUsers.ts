import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';


dotenv.config();

export const authUsers: Record<string, { hash: string, role: string }> = {};

export const initializeAuth = async (): Promise<void> => {
    authUsers[process.env.API_ADMIN!] = { 
        hash: await bcrypt.hash(process.env.API_ADMIN_PW!, 10), 
        role: 'admin' 
    };
    
    authUsers[process.env.API_USER!] = { 
        hash: await bcrypt.hash(process.env.API_USER_PW!, 10), 
        role: 'user' 
    };
};
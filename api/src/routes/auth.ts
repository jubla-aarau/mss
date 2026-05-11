import { Router } from 'express';
import type { Request, Response } from 'express';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { serverError } from './commons.js'
import { authUsers } from '../config/authUsers.js';


const router = Router();


/**
 * @openapi
 * /auth/login:
 *  post:
 *    summary: User Login
 *    description: Authenticate user and receive a JWT token.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - password
 *            properties:
 *              username:
 *                type: string
 *              password:
 *                type: string
 *                format: password
 *    responses:
 *      200:
 *        description: Login successful.
 *      401:
 *        description: Invalid credentials.
 *      500:
 *        description: Internal Server Error.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = authUsers[username];

  if (!user) {
    return res.status(401).json({ message: 'User does not exist' });
  }

  try {
    const hashMatch = await bcrypt.compare(password, user.hash);
    if (!hashMatch) {
      return res.status(401).json({ message: 'Wrong Password' });
    }

    const token = jwt.sign(
      { username, role: user.role }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      token,
      username, 
      role: user.role, 
      message: `Login successful, welcome ${username}.` 
    });
  } catch (error) {
    serverError(res, error);
  }
});


export default router;
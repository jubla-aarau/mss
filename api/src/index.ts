import express from 'express';
import type { Request, Response } from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './config/swagger.js';

import { initializeAuth } from './config/authUsers.js';

import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';


const app = express();
const port = 3000;

app.use(express.json());


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/auth', authRoutes);
app.use('/', resourceRoutes);


app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Request successful, welcome to the JBA-MSS-API!',
    status: 'online'
  });
});


const startServer = async () => {
  try {
    await initializeAuth();
    
    app.listen(port, () => {
      console.log(`[server]: JBA-MSS-API runs on http://localhost:${port}`);
      console.log(`[server]: JBA-MSS-API Swagger-Docs runs on http://localhost:${port}/api-docs`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
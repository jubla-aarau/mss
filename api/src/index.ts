import express from 'express';
import type { Request, Response } from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { pool } from './db.js'


const app = express();
const port = 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JBA MSS-API',
      version: '1.0.0',
      description: 'MaterialSearchSystem-API for Jubla Aarau',
    },
    servers: [
      { 
        url: 'http://192.168.32.70:3000', 
        description: 'LAN Development' 
      },
      { 
        url: 'http://100.65.134.101:3000', 
        description: 'Remote via Tailscale' 
      }
    ],
  },
  apis: ['./src/*.ts'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const tableMap: Record<string, string> = {
  'rooms': 'room',
  'room_sectors': 'room_sector',
  'cabinets': 'cabinet',
  'categories': 'category',
  'items': 'item'
};

/**
 * @openapi
 * /{resource}:
 *  get:
 *    summary: Get all entries from a specific resource
 *    description: Fetches all data from the mapping table. Only allowed resources work.
 *    parameters:
 *      - in: path
 *        name: resource
 *        required: true
 *        schema:
 *          type: string
 *          enum: [rooms, room_sectors, cabinets, categories, items]
 *          description: The name of the resource.
 *    responses:
 *      200:
 *        description: A JSON array of the requested resource.
 *      404:
 *        description: Not found (Not in tableMap).
 *      500:
 *        description: Internal Server Error.
 */
app.get('/:resource', async (req: Request, res: Response) => {
  const { resource } = req.params as { resource: string };
  const tableName = tableMap[resource];

  if (!tableName) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM ${tableName}`);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error: Could not fetch rooms from DB', 
      error: error 
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'It works!',
    status: 'online'
  });
});

app.listen(port, () => {
  console.log(`[server]: MSS-API runs on http://localhost:${port}`);
});
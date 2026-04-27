import express from 'express';
import type { Request, Response } from 'express';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { pool } from './db.js'


const app = express();
const port = 3000;

app.use(express.json());

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
  'items': 'item',
  'inventories': 'inventory'
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
 *          enum: [rooms, room_sectors, cabinets, categories, items, inventories]
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
    return res.status(404).json({
      message: 'Resource not found.'
    });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM ${tableName}`);

    res.status(200).json(rows);

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error 
    });
  }
});

/**
 * @openapi
 * /{resource}/{id}:
 *  get:
 *    summary: Get entry with specific id from a specific resource
 *    description: Fetches a specific id from the mapping table. Only allowed resources work.
 *    parameters:
 *      - in: path
 *        name: resource
 *        required: true
 *        schema:
 *          type: string
 *          enum: [rooms, room_sectors, cabinets, categories, items, inventories]
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: A JSON array of the requested id and resource.
 *      404:
 *        description: Not found (Not in tableMap or id not found).
 *      500:
 *        description: Internal Server Error.
 */
app.get('/:resource/:id', async (req: Request, res: Response) => {
  const { resource, id } = req.params as { resource: string, id: string };
  const tableName = tableMap[resource];

  if (!tableName) {
    return res.status(404).json({
      message: 'Resource not found.'
    });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);

    const data = (rows as any[]);

    if (data.length === 0) {
      return res.status(404).json({
        message: `No ${tableName} found with ID ${id}`
      });
    }

    res.status(200).json(data[0]);

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error 
    });
  }
});

/**
 * @openapi
 * /{resource}/{id}:
 *  delete:
 *    summary: Delete entry with specific id from a specific resource
 *    description: Deletes a specific id from the mapping table. Only allowed resources work.
 *    parameters:
 *      - in: path
 *        name: resource
 *        required: true
 *        schema:
 *          type: string
 *          enum: [rooms, room_sectors, cabinets, categories, items, inventories]
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Entry deleted succesfully.
 *      404:
 *        description: Not found (Not in tableMap or id not found).
 *      500:
 *        description: Internal Server Error.
 */
app.delete('/:resource/:id', async (req: Request, res: Response) => {
  const { resource, id } = req.params as { resource: string, id: string };
  const tableName = tableMap[resource];

  if (!tableName) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  try {
    const [result] = await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

    const info = (result as any);

    if (info.affectedRows === 0) {
      return res.status(404).json({
        message: `No ${tableName} found with ID ${id}. Nothing was deleted.`
      });
    }

    res.status(200).json({
      message: `Entry with ID ${id} was successfully deleted from ${resource}.`
    });

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error 
    });
  }
});

/**
 * @openapi
 * /{resource}:
 *  post:
 *    summary: Create a new entry
 *    description: Inserts a new entry into the specified resource table.
 *    parameters:
 *      - in: path
 *        name: resource
 *        required: true
 *        schema:
 *          type: string
 *          enum: [rooms, room_sectors, cabinets, categories, items, inventories]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *    responses:
 *      201:
 *        description: Entry created successfully.
 *      400:
 *        description: Bad Request (Invalid data).
 *      404:
 *        description: Not found (Not in tableMap).
 *      500:
 *        description: Internal Server Error.
 */
app.post('/:resource', async (req: Request, res: Response) => {
  const { resource } = req.params as { resource: string };
  const tableName = tableMap[resource];

  if (!tableName) {
    return res.status(404).json({
      message: 'Resource not found.'
    });
  }

  try {
    const data = req.body;
    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
      return res.status(400).json({
        message: 'No data provided.'
      });
    }

    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.join(', ');

    const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;

    const [result] = await pool.query(sql, values);
    const insertId = (result as any).insertId;

    const [newEntry] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertId]);

    res.status(201).json((newEntry as any)[0]);

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error 
    });
  }
});

/**
 * @openapi
 * /{resource}/{id}:
 *  put:
 *    summary: Update an existing entry
 *    description: Updates fields of an entry with specific ID.
 *    parameters:
 *      - in: path
 *        name: resource
 *        required: true
 *        schema:
 *          type: string
 *          enum: [rooms, room_sectors, cabinets, categories, items, inventories]
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *    responses:
 *      200:
 *        description: Entry updated  successfully.
 *      400:
 *        description: Bad Request (Invalid data).
 *      404:
 *        description: Not found (Not in tableMap).
 *      500:
 *        description: Internal Server Error.
 */
app.put('/:resource/:id', async (req: Request, res: Response) => {
  const { resource, id } = req.params as { resource: string, id: string };
  const tableName = tableMap[resource];

  if (!tableName) {
    return res.status(404).json({
      message: 'Resource not found.'
    });
  }

  try {
    const data = req.body;
    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
      return res.status(400).json({
        message: 'No data provided.'
      });
    }

    const setClause = columns.map(col => `${col} = ?`).join(', ');

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

    const [result] = await pool.query(sql, [...values, id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: `No ${tableName} found with ID ${id}`
      });
    }

    const [updatedEntry] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);

    res.status(200).json((updatedEntry as any)[0]);

  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
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
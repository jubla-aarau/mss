import { Router, type Response } from 'express';

import { pool } from '../config/db.js';
import { tableMap, serverError, authCheck, type AuthRequest, roleCheck } from './commons.js'


const router = Router();


/**
 * @openapi
 * /{resource}:
 *  get:
 *    summary: Get all entries from a specific resource
 *    description: Fetches all data from the mapping table. Only allowed resources work.
 *    security:
 *      - bearerAuth: []
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
router.get('/:resource', authCheck, roleCheck(['user', 'admin']), async (req: AuthRequest, res: Response) => {
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
    serverError(res, error);
  }
});

/**
 * @openapi
 * /{resource}/{id}:
 *  get:
 *    summary: Get entry with specific id from a specific resource
 *    description: Fetches a specific id from the mapping table. Only allowed resources work.
 *    security:
 *      - bearerAuth: []
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
router.get('/:resource/:id', authCheck, roleCheck(['user', 'admin']), async (req: AuthRequest, res: Response) => {
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
 *    summary: Delete entry with specific id from a specific resource (Admin only)
 *    description: Deletes a specific id from the mapping table. Only allowed resources work.
 *    security:
 *      - bearerAuth: []
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
router.delete('/:resource/:id', authCheck, roleCheck(['admin']), async (req: AuthRequest, res: Response) => {
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
 *    security:
 *      - bearerAuth: []
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
router.post('/:resource', authCheck, roleCheck(['admin']), async (req: AuthRequest, res: Response) => {
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
 *    security:
 *      - bearerAuth: []
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
router.put('/:resource/:id', authCheck, roleCheck(['admin']), async (req: AuthRequest, res: Response) => {
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


export default router;
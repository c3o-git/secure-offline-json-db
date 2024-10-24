const express = require('express');
const next = require('next');
const morgan = require('morgan');
const JsonOfflineDb = require('./index');
const Joi = require('joi');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const db = new JsonOfflineDb('./db.json', Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(3).required(),
    age: Joi.number().integer().min(18).max(100).required(),
}));

app.prepare().then(() => {
    const server = express();

    // Enable request logging
    server.use(morgan('dev'));

    // Parse incoming JSON requests
    server.use(express.json());

    // API Routes

    // GET all records
    server.get('/api/records', async (req, res) => {
        try {
            await db.applyRateLimit(req.ip);
            const records = db.read();
            res.status(200).json(records);
        } catch (err) {
            res.status(429).json({ error: err.message });
        }
    });

    // POST a new record
    server.post('/api/records', async (req, res) => {
        try {
            await db.applyRateLimit(req.ip);
            const newRecord = db.create(req.body);
            res.status(201).json(newRecord);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // PUT (update) a record
    server.put('/api/records/:id', async (req, res) => {
        try {
            await db.applyRateLimit(req.ip);
            const updatedRecord = db.update(Number(req.params.id), req.body);
            res.status(200).json(updatedRecord);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // DELETE a record
    server.delete('/api/records/:id', async (req, res) => {
        try {
            await db.applyRateLimit(req.ip);
            const deletedId = db.delete(Number(req.params.id));
            res.status(200).json({ message: `Record with ID ${deletedId} deleted` });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // Handle other routes with Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Start the server on port 4000
    server.listen(4000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:4000');
    });
});
const fs = require('fs-extra');
const Joi = require('joi');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const morgan = require('morgan');

// Rate limiting setup (10 requests per second)
const rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 1
});

class JsonOfflineDb {
    constructor(filePath, schema) {
        this.filePath = filePath;
        this.schema = schema;

        // Ensure file permissions are restricted to owner read/write
        fs.ensureFileSync(filePath);
        fs.chmodSync(filePath, 0o600); // Owner read/write only
    }

    // Validate data using Joi schema
    validateRecord(record) {
        const { error } = this.schema.validate(record);
        if (error) {
            throw new Error(`Validation Error: ${error.message}`);
        }
        return true;
    }

    // Read database
    read() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error('Error reading database file');
        }
    }

    // Create a new record
    create(record) {
        this.validateRecord(record);

        const data = this.read();
        data.push(record);
        this.write(data);

        return record;
    }

    // Update an existing record
    update(id, updates) {
        const data = this.read();
        const recordIndex = data.findIndex(r => r.id === id);
        if (recordIndex === -1) throw new Error(`Record with ID ${id} not found`);

        const updatedRecord = { ...data[recordIndex], ...updates };
        this.validateRecord(updatedRecord);

        data[recordIndex] = updatedRecord;
        this.write(data);

        return updatedRecord;
    }

    // Delete a record
    delete(id) {
        const data = this.read();
        const newData = data.filter(r => r.id !== id);

        if (newData.length === data.length) {
            throw new Error(`Record with ID ${id} not found`);
        }

        this.write(newData);
        return id;
    }

    // Write to the database
    write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    // Apply rate limiting for requests
    async applyRateLimit(ip) {
        try {
            await rateLimiter.consume(ip);
        } catch (err) {
            throw new Error('Too many requests, slow down');
        }
    }
}

module.exports = JsonOfflineDb;
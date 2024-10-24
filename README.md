<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/secure-offline-json-db">
     <img src="https://c3o.onrender.com/images/secure-json-db.png" width="300" height="300" alt="SecureOfflineJsonDb">
    </a>
  </p>
</div>

# Secure Json Offline Database

`secure-offline-json-db` is an offline JSON database designed with security features such as input validation, rate limiting, file permissions, and logging. It allows you to store, retrieve, and manage records in a secure, JSON-based file system while preventing common attack vectors.

## Features

**Schema Validation**: Uses **Joi** to validate records based on customizable schemas.
**Rate Limiting**: Protects against overuse by rate limiting incoming requests.
**File Permissions**: Ensures that the database file has strict read/write access.
**Logging**: Integrates with **morgan** to log requests and monitor system access.
**CRUD Operations**: Supports creating, reading, updating, and deleting records.

## Installation

To install the package, run:

```bash
npm install secure-offline-json-db
```
## Usage

### 1. Initializing the Database

To use `secure-offline-json-db`, import the package and create an instance by passing the path to the JSON file and the Joi schema for record validation.

```javascript
const JsonOfflineDb = require('secure-offline-json-db');
const Joi = require('joi');

// Define the schema for records
const recordSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(3).required(),
    age: Joi.number().integer().min(18).max(100).required(),
});

// Initialize the database
const db = new JsonOfflineDb('./db.json', recordSchema);
```
### 2. CRUD Operations

**Read All Records**
To retrieve all records stored in the JSON database:

```javascript
const records = db.read();
console.log(records);
```
**Create a Record**
To add a new record to the database, pass the record object to the `create` method:

```javascript
const newRecord = {
    id: 1,
    name: "John Doe",
    age: 25,
};

db.create(newRecord);
```
**Update a Record**
To update an existing record, pass the `id` of the record and an object with the updated values:

```javascript
const updatedRecord = db.update(1, { age: 26 });
console.log(updatedRecord);
```

**Delete a Record**

To delete a record by its `id`, use the `delete` method:

```javascript
db.delete(1);
console.log("Record deleted successfully.");
```

### 3. Security Features

**Input Validation**

Records are validated against the schema you provide when initializing the database. If a record does not meet the validation criteria, an error will be thrown.

```javascript
try {
    const invalidRecord = { id: 2, name: "A", age: 17 }; // Invalid record
    db.create(invalidRecord);
} catch (error) {
    console.error(error.message); // Validation error
}
```

**Rate Limiting**

To prevent excessive requests, `secure-offline-json-db` includes rate limiting. You can apply rate limiting to IP addresses before performing database operations.

```javascript
await db.applyRateLimit(req.ip); // Rate limit applied
```

**File Permissions**
The database file (`db.json`) is created with strict read/write permissions (owner-only). This prevents unauthorized access to the database file at the filesystem level.

**Logging**
The package supports logging of incoming requests through **morgan**. You can log request data, errors, and response times to monitor activity.

```javascript
const morgan = require('morgan');
app.use(morgan('dev')); // Logs HTTP requests
```

### **Using with Next.js**

You can easily integrate `secure-offline-json-db` with a Next.js backend to manage your offline database. Below is an example of using the package in Next.js API routes.

1. Install **Next.js**:

    ```bash
    npx create-next-app@latest
    cd my-nextjs-app
    ```

2. Install **secure-json-db** within your Next.js project:

    ```bash
    npm install secure-offline-json-db
    ```

3. Create an API route in Next.js (`pages/api/records.js`):

    ```javascript
    import JsonOfflineDb from 'secure-json-db';
    import Joi from 'joi';

    const recordSchema = Joi.object({
        id: Joi.number().required(),
        name: Joi.string().min(3).required(),
        age: Joi.number().integer().min(18).max(100).required(),
    });

    const db = new JsonOfflineDb('./db.json', recordSchema);

    export default async function handler(req, res) {
        const { method } = req;

        try {
            switch (method) {
                case 'GET':
                    const records = db.read();
                    res.status(200).json(records);
                    break;
                case 'POST':
                    const newRecord = db.create(req.body);
                    res.status(201).json(newRecord);
                    break;
                case 'PUT':
                    const updatedRecord = db.update(req.body.id, req.body);
                    res.status(200).json(updatedRecord);
                    break;
                case 'DELETE':
                    db.delete(req.body.id);
                    res.status(200).json({ message: "Record deleted" });
                    break;
                default:
                    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                    res.status(405).end(`Method ${method} Not Allowed`);
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    ```

4. Start the Next.js server:

    ```bash
    npm run dev
    ```

Now, you can interact with the secure JSON database via API routes in Next.js.

---

### **Using with React Native**

You can access the **secure-offline-json-db** backend via API calls in a **React Native** app.

1. Install **axios** in your React Native project:

    ```bash
    npm install axios
    ```

2. Use the `axios` library to interact with the database:

    ```javascript
    import axios from 'axios';
    import React, { useEffect, useState } from 'react';
    import { View, Text, FlatList, StyleSheet } from 'react-native';

    const App = () => {
        const [records, setRecords] = useState([]);

        useEffect(() => {
            axios.get('http://localhost:4000/api/records')
                .then(response => {
                    setRecords(response.data);
                })
                .catch(error => {
                    console.error('Error fetching records:', error);
                });
        }, []);

        return (
            <View style={styles.container}>
                <FlatList
                    data={records}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Text>{item.name} - {item.age} years old</Text>
                    )}
                />
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 16,
        },
    });

    export default App;
    ```
In this example, your React Native app makes requests to the `secure-offline-json-db` backend running on `localhost:4000`.

---

### **Security Best Practices**

**Rate Limiting**: Ensure rate limiting is configured to prevent abuse.
**Environment Variables**: Use environment variables for sensitive data.
**File Permissions**: Ensure the database file is protected with restricted permissions.
**Validation**: Always validate inputs to prevent invalid or malicious data from entering the system.

---

### **Changelog**

#### **1.0.0**
- Initial release with support for JSON storage, schema validation, rate limiting, and request logging.

---

### **License**

MIT License

---




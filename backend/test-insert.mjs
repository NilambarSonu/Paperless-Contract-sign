import { db, contractsTable } from '@workspace/db';
import { randomUUID } from 'crypto';

const token = randomUUID();
const expiresAt = new Date();

const query = db.insert(contractsTable).values({
    title: "Test", 
    signerEmail: "test@test.com", 
    signerName: "Test",
    signerCompany: null,
    originalFileUrl: "http://test",
    customFields: null,
    token, 
    status: "pending", 
    expiresAt,
}).toSQL();

console.log(query.sql);
console.log(query.params);

import { contractsTable } from '@workspace/db';
import { getTableConfig } from 'drizzle-orm/pg-core';
const cols = getTableConfig(contractsTable).columns;
console.log(cols.map(c => c.name));

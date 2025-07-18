#!/bin/bash

# rebuild better_sqlite3.node on Mac Apple Chip inside node_modules/better-sqlite3 to prevent
# unit test TypeOrmModule.forRoot({ type: 'better-sqlite3', database: ':memory:' }) throwing error
npm rebuild better-sqlite3

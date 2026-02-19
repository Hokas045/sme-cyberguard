#!/bin/bash

export PATH="/home/ogega/.turso:$PATH"

# Read the schema file and split by semicolons, then execute each statement
while IFS= read -r -d ';' statement; do
    # Skip empty statements and comments
    if [[ -n "${statement// }" && ! "$statement" =~ ^[[:space:]]*-- ]]; then
        # Add semicolon back and execute
        echo "Executing: ${statement:0:50}..."
        echo "${statement};" | turso db shell agents
        if [ $? -ne 0 ]; then
            echo "Error executing statement: ${statement:0:100}..."
        fi
    fi
done < schema.sql

echo "Schema execution completed!"

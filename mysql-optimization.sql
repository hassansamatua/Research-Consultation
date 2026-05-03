-- MySQL Optimization Script
-- Run this script in MySQL to optimize connection settings

-- Increase maximum connections
SET GLOBAL max_connections = 200;

-- Set connection timeout to prevent idle connections
SET GLOBAL wait_timeout = 60;
SET GLOBAL interactive_timeout = 60;

-- Optimize for better performance
SET GLOBAL query_cache_size = 16777216;
SET GLOBAL query_cache_type = 1;

-- Show current settings
SELECT 
    VARIABLE_NAME,
    VARIABLE_VALUE 
FROM INFORMATION_SCHEMA.GLOBAL_VARIABLES 
WHERE VARIABLE_NAME IN ('max_connections', 'wait_timeout', 'interactive_timeout', 'query_cache_size');

-- Show current process list
SELECT 
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE,
    INFO 
FROM INFORMATION_SCHEMA.PROCESSLIST 
ORDER BY TIME DESC;

-- Kill idle connections (optional - uncomment if needed)
-- SELECT CONCAT('KILL ', ID, ';') FROM INFORMATION_SCHEMA.PROCESSLIST WHERE TIME > 300 AND COMMAND = 'Sleep';

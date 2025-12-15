-- Search for client-related tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name ILIKE '%client%'
ORDER BY table_name;

-- If no match, show all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

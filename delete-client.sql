-- Delete client profile with email vkoleski10@gmail.com
-- First, get the details
SELECT id, "firstName", "lastName", email, "weddingDate" FROM "ClientProfile" WHERE email = 'vkoleski10@gmail.com';

-- Then delete (uncomment to execute)
-- DELETE FROM "ClientProfile" WHERE email = 'vkoleski10@gmail.com';

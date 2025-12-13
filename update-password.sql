-- Update password for tom@test.com
UPDATE users 
SET passwordHash = '$2a$12$QHe4.Oq3J5ToGvp1rjUOkOZN38SrS.y/Lj1S.PGuPG5OcRspoXEqS',
    accountStatus = 'ACTIVE',
    emailVerified = CURRENT_TIMESTAMP,
    failedLoginAttempts = 0
WHERE email = 'tom@test.com';

SELECT email, accountStatus FROM users WHERE email = 'tom@test.com';

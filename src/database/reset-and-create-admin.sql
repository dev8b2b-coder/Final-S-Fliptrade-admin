-- ============================================
-- RESET DATABASE & CREATE DEFAULT ADMIN
-- ============================================
-- Purpose: Delete all data and create a Super Admin user
-- Usage: Run this in Supabase SQL Editor
-- WARNING: This will DELETE ALL DATA!
-- ============================================

-- ============================================
-- PART 1: DELETE ALL DATA (KV STORE - CURRENT SETUP)
-- ============================================

-- Delete all entries from KV Store
DELETE FROM kv_store_63060bc2;

-- Verify deletion
-- SELECT COUNT(*) FROM kv_store_63060bc2; -- Should return 0

-- ============================================
-- PART 2: DELETE ALL DATA (SQL TABLES - FUTURE SETUP)
-- ============================================
-- Uncomment these lines if you're using SQL tables

/*
-- Delete in correct order (respecting foreign keys)
DELETE FROM client_incentives;
DELETE FROM expenses;
DELETE FROM deposits;
DELETE FROM bank_deposits;
DELETE FROM banks;
DELETE FROM activity_logs;
DELETE FROM users;

-- Reset sequences (if using auto-increment)
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
*/

-- ============================================
-- PART 3: CREATE DEFAULT ADMIN USER (KV STORE)
-- ============================================

-- Insert default Super Admin into KV Store
INSERT INTO kv_store_63060bc2 (key, value)
VALUES (
    'user_default-admin-001',
    jsonb_build_object(
        'id', 'default-admin-001',
        'email', 'admin@fliptrade.com',
        'name', 'Super Admin',
        'role', 'Super Admin',
        'status', 'active',
        'permissions', jsonb_build_object(
            'dashboard', jsonb_build_object(
                'view', true,
                'viewAll', true
            ),
            'deposits', jsonb_build_object(
                'view', true,
                'add', true,
                'edit', true,
                'delete', true,
                'viewAll', true
            ),
            'bankDeposits', jsonb_build_object(
                'view', true,
                'add', true,
                'edit', true,
                'delete', true,
                'viewAll', true
            ),
            'staffManagement', jsonb_build_object(
                'view', true,
                'add', true,
                'edit', true,
                'delete', true,
                'archive', true,
                'restore', true,
                'viewAll', true
            ),
            'activityLogs', jsonb_build_object(
                'view', true,
                'viewAll', true
            ),
            'settings', jsonb_build_object(
                'view', true,
                'edit', true
            )
        ),
        'avatar', null,
        'createdAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'updatedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'lastLogin', null,
        'isArchived', false,
        'archivedAt', null
    )
);

-- ============================================
-- PART 4: CREATE DEFAULT ADMIN USER (SQL TABLES)
-- ============================================
-- Uncomment these lines if you're using SQL tables

/*
INSERT INTO users (
    id,
    email,
    name,
    role,
    status,
    permissions,
    avatar,
    created_at,
    updated_at,
    last_login,
    is_archived,
    archived_at
) VALUES (
    'default-admin-001',
    'admin@fliptrade.com',
    'Super Admin',
    'Super Admin',
    'active',
    jsonb_build_object(
        'dashboard', jsonb_build_object('view', true, 'viewAll', true),
        'deposits', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'viewAll', true),
        'bankDeposits', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'viewAll', true),
        'staffManagement', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'archive', true, 'restore', true, 'viewAll', true),
        'activityLogs', jsonb_build_object('view', true, 'viewAll', true),
        'settings', jsonb_build_object('view', true, 'edit', true)
    ),
    null,
    NOW(),
    NOW(),
    null,
    false,
    null
);
*/

-- ============================================
-- PART 5: CREATE SUPABASE AUTH USER
-- ============================================
-- IMPORTANT: This MUST be run separately using Supabase Admin API
-- You CANNOT create auth users directly from SQL Editor
-- Use the instructions below after running this script
-- ============================================

/*
INSTRUCTIONS TO CREATE AUTH USER:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" button
3. Enter these details:
   - Email: admin@fliptrade.com
   - Password: Admin@123456 (or your preferred password)
   - Auto Confirm User: YES (check this box)
4. Click "Create User"
5. Copy the UUID from the created user
6. Update the KV Store entry to use this UUID:

UPDATE kv_store_63060bc2
SET value = jsonb_set(
    value,
    '{id}',
    to_jsonb('PASTE-UUID-HERE'::text)
)
WHERE key = 'user_default-admin-001';

-- Also update the key to match the UUID
UPDATE kv_store_63060bc2
SET key = 'user_PASTE-UUID-HERE'
WHERE key = 'user_default-admin-001';

*/

-- ============================================
-- PART 6: VERIFICATION QUERIES
-- ============================================

-- Check if admin user was created (KV Store)
SELECT * FROM kv_store_63060bc2 
WHERE key LIKE 'user_%';

-- Count total records in KV Store
SELECT COUNT(*) AS total_records FROM kv_store_63060bc2;

-- Check admin user details
SELECT 
    key,
    value->>'id' AS user_id,
    value->>'email' AS email,
    value->>'name' AS name,
    value->>'role' AS role,
    value->>'status' AS status
FROM kv_store_63060bc2
WHERE key = 'user_default-admin-001';

-- ============================================
-- PART 7: INSERT SAMPLE BANKS (OPTIONAL)
-- ============================================
-- Uncomment to add default banks

/*
INSERT INTO kv_store_63060bc2 (key, value)
VALUES 
    ('bank_001', jsonb_build_object('id', 'bank_001', 'name', 'Bank of America', 'createdAt', NOW())),
    ('bank_002', jsonb_build_object('id', 'bank_002', 'name', 'Chase Bank', 'createdAt', NOW())),
    ('bank_003', jsonb_build_object('id', 'bank_003', 'name', 'Wells Fargo', 'createdAt', NOW())),
    ('bank_004', jsonb_build_object('id', 'bank_004', 'name', 'JPMorgan Chase', 'createdAt', NOW())),
    ('bank_005', jsonb_build_object('id', 'bank_005', 'name', 'Citibank', 'createdAt', NOW())),
    ('bank_006', jsonb_build_object('id', 'bank_006', 'name', 'HSBC Bank', 'createdAt', NOW())),
    ('bank_007', jsonb_build_object('id', 'bank_007', 'name', 'TD Bank', 'createdAt', NOW()));
*/

-- ============================================
-- NOTES:
-- ============================================
-- 1. Default Admin Credentials:
--    Email: admin@fliptrade.com
--    Password: (You set this in Supabase Dashboard)
--
-- 2. Default admin has ALL permissions enabled
--
-- 3. After running this script:
--    - Go to Supabase Dashboard → Authentication
--    - Create auth user manually with email: admin@fliptrade.com
--    - Update the user ID in KV Store to match auth user UUID
--
-- 4. For security, change the admin password after first login
--
-- 5. This script is safe to run multiple times (it will replace existing admin)
-- ============================================

-- SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE '✅ Database reset complete!';
    RAISE NOTICE '✅ Default admin user created in KV Store';
    RAISE NOTICE '⚠️  NEXT STEP: Create auth user in Supabase Dashboard';
    RAISE NOTICE '📧 Email: admin@fliptrade.com';
    RAISE NOTICE '🔐 Set your preferred password';
END $$;

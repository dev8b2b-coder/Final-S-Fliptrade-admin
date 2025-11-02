-- ============================================
-- FIX USER PERMISSIONS (Quick Fix)
-- ============================================
-- Purpose: Add missing permissions to existing users
-- Usage: Run this if you're getting permission errors
-- ============================================

-- Check current user data
SELECT 
    key,
    value->>'email' AS email,
    value->>'role' AS role,
    value->'permissions' AS permissions
FROM kv_store_63060bc2
WHERE key LIKE 'user_%' OR key LIKE 'staff:%';

-- ============================================
-- OPTION 1: Fix specific user by email
-- ============================================
-- Replace 'admin@fliptrade.com' with your email

UPDATE kv_store_63060bc2
SET value = jsonb_set(
    value,
    '{permissions}',
    jsonb_build_object(
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
    )
)
WHERE value->>'email' = 'admin@fliptrade.com';

-- Verify the fix
SELECT 
    key,
    value->>'email' AS email,
    value->>'role' AS role,
    value->'permissions' AS permissions
FROM kv_store_63060bc2
WHERE value->>'email' = 'admin@fliptrade.com';

-- ============================================
-- OPTION 2: Fix ALL Super Admin users
-- ============================================

UPDATE kv_store_63060bc2
SET value = jsonb_set(
    value,
    '{permissions}',
    jsonb_build_object(
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
    )
)
WHERE value->>'role' = 'Super Admin';

-- ============================================
-- OPTION 3: Fix ALL Admin users
-- ============================================

UPDATE kv_store_63060bc2
SET value = jsonb_set(
    value,
    '{permissions}',
    jsonb_build_object(
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
    )
)
WHERE value->>'role' = 'Admin';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all users after fix
SELECT 
    key,
    value->>'email' AS email,
    value->>'name' AS name,
    value->>'role' AS role,
    value->>'status' AS status,
    value->'permissions'->'dashboard'->>'view' AS can_view_dashboard,
    value->'permissions'->'staffManagement'->>'view' AS can_view_staff,
    value->'permissions'->'deposits'->>'view' AS can_view_deposits
FROM kv_store_63060bc2
WHERE key LIKE 'staff:%'
ORDER BY value->>'createdAt' DESC;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Permissions fixed!';
    RAISE NOTICE '🔄 Please logout and login again to apply changes';
    RAISE NOTICE '📧 If issue persists, verify user email in WHERE clause';
END $$;

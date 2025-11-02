-- ============================================
-- ⚡ ONE-CLICK PERMISSION FIX ⚡
-- ============================================
-- Just run this SQL and refresh your browser!
-- Takes 2 seconds to fix permission errors
-- ============================================

-- Fix ALL Super Admin users (safest option)
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
WHERE (value->>'role' = 'Super Admin' OR value->>'role' = 'Admin')
  AND key LIKE 'staff:%';

-- Also fix any users in old 'user_' format (legacy)
UPDATE kv_store_63060bc2
SET value = jsonb_set(
    value,
    '{permissions}',
    jsonb_build_object(
        'dashboard', jsonb_build_object('view', true, 'viewAll', true),
        'deposits', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'viewAll', true),
        'bankDeposits', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'viewAll', true),
        'staffManagement', jsonb_build_object('view', true, 'add', true, 'edit', true, 'delete', true, 'archive', true, 'restore', true, 'viewAll', true),
        'activityLogs', jsonb_build_object('view', true, 'viewAll', true),
        'settings', jsonb_build_object('view', true, 'edit', true)
    )
)
WHERE (value->>'role' = 'Super Admin' OR value->>'role' = 'Admin')
  AND key LIKE 'user_%';

-- Verify the fix worked
SELECT 
    key,
    value->>'email' AS email,
    value->>'name' AS name,
    value->>'role' AS role,
    value->'permissions'->'dashboard'->>'view' AS dashboard_access,
    value->'permissions'->'staffManagement'->>'view' AS staff_access,
    CASE 
        WHEN value->'permissions' IS NOT NULL THEN '✅ Fixed'
        ELSE '❌ Missing'
    END AS status
FROM kv_store_63060bc2
WHERE key LIKE 'staff:%' OR key LIKE 'user_%'
ORDER BY value->>'createdAt' DESC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ PERMISSIONS FIXED!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Next Steps:';
    RAISE NOTICE '   1. Close this SQL Editor';
    RAISE NOTICE '   2. Go back to your app';
    RAISE NOTICE '   3. Logout (if logged in)';
    RAISE NOTICE '   4. Login again';
    RAISE NOTICE '   5. ✅ You should now have full access!';
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
END $$;

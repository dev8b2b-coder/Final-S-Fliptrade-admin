-- ============================================
-- FLIPTRADE ADMIN PANEL - DATABASE SCHEMA
-- ============================================
-- Purpose: Production-ready SQL schema for scalability (1M+ records)
-- Created: 2025-11-02
-- Note: Currently using KV Store, but this schema is ready for migration
-- ============================================

-- ============================================
-- 1. USERS TABLE (Staff & Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Manager', 'Accountant', 'Viewer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    permissions JSONB NOT NULL DEFAULT '{}',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_archived ON users(is_archived);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments
COMMENT ON TABLE users IS 'Stores all staff and admin users with role-based permissions';
COMMENT ON COLUMN users.permissions IS 'JSON object containing module-level permissions';

-- ============================================
-- 2. BANKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_banks_name ON banks(name);

-- Comments
COMMENT ON TABLE banks IS 'Master list of all banks for bank deposits';

-- ============================================
-- 3. DEPOSITS TABLE (Daily Financial Entries)
-- ============================================
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    local_deposit DECIMAL(15, 2) DEFAULT 0,
    usdt_deposit DECIMAL(15, 2) DEFAULT 0,
    cash_deposit DECIMAL(15, 2) DEFAULT 0,
    local_withdraw DECIMAL(15, 2) DEFAULT 0,
    usdt_withdraw DECIMAL(15, 2) DEFAULT 0,
    cash_withdraw DECIMAL(15, 2) DEFAULT 0,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (especially for 1M+ records)
CREATE INDEX idx_deposits_date ON deposits(date DESC);
CREATE INDEX idx_deposits_submitted_by ON deposits(submitted_by);
CREATE INDEX idx_deposits_created_at ON deposits(created_at DESC);
CREATE INDEX idx_deposits_date_submitted ON deposits(date DESC, submitted_by);

-- Composite index for common queries
CREATE INDEX idx_deposits_search ON deposits(date, submitted_by, created_at);

-- Comments
COMMENT ON TABLE deposits IS 'Daily financial deposits and withdrawals (Local, USDT, Cash)';
COMMENT ON COLUMN deposits.submitted_by IS 'Foreign key to users table';

-- ============================================
-- 4. CLIENT INCENTIVES TABLE (Related to Deposits)
-- ============================================
CREATE TABLE IF NOT EXISTS client_incentives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_client_incentives_deposit_id ON client_incentives(deposit_id);
CREATE INDEX idx_client_incentives_created_at ON client_incentives(created_at);

-- Comments
COMMENT ON TABLE client_incentives IS 'Client incentives linked to deposit entries';

-- ============================================
-- 5. EXPENSES TABLE (Related to Deposits)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Promotion', 'Salary', 'Miscellaneous', 'IB Commission', 'Travel Expense')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expenses_deposit_id ON expenses(deposit_id);
CREATE INDEX idx_expenses_type ON expenses(type);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- Comments
COMMENT ON TABLE expenses IS 'Business expenses linked to deposit entries';

-- ============================================
-- 6. BANK DEPOSITS TABLE (Bank Transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    deposit DECIMAL(15, 2) DEFAULT 0,
    withdraw DECIMAL(15, 2) DEFAULT 0,
    pnl DECIMAL(15, 2) DEFAULT 0,
    remaining DECIMAL(15, 2) DEFAULT 0,
    remaining_balance DECIMAL(15, 2) DEFAULT 0,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_by_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bank_deposits_date ON bank_deposits(date DESC);
CREATE INDEX idx_bank_deposits_bank_id ON bank_deposits(bank_id);
CREATE INDEX idx_bank_deposits_submitted_by ON bank_deposits(submitted_by);
CREATE INDEX idx_bank_deposits_created_at ON bank_deposits(created_at DESC);
CREATE INDEX idx_bank_deposits_date_bank ON bank_deposits(date DESC, bank_id);

-- Composite index for common queries
CREATE INDEX idx_bank_deposits_search ON bank_deposits(date, bank_id, submitted_by);

-- Comments
COMMENT ON TABLE bank_deposits IS 'Bank-wise deposit and withdrawal transactions';

-- ============================================
-- 7. ACTIVITY LOGS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Composite index for filtering
CREATE INDEX idx_activity_logs_search ON activity_logs(timestamp DESC, user_id, action);

-- Comments
COMMENT ON TABLE activity_logs IS 'Complete audit trail of all user actions';

-- ============================================
-- 8. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_deposits_updated_at BEFORE UPDATE ON bank_deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. PERFORMANCE OPTIMIZATION
-- ============================================

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE deposits;
ANALYZE bank_deposits;
ANALYZE activity_logs;
ANALYZE client_incentives;
ANALYZE expenses;
ANALYZE banks;

-- ============================================
-- 10. SAMPLE DATA SEEDING (Optional - for testing)
-- ============================================

-- Insert default banks
INSERT INTO banks (id, name) VALUES
    (gen_random_uuid(), 'Bank of America'),
    (gen_random_uuid(), 'Chase Bank'),
    (gen_random_uuid(), 'Wells Fargo'),
    (gen_random_uuid(), 'JPMorgan Chase'),
    (gen_random_uuid(), 'Citibank'),
    (gen_random_uuid(), 'HSBC Bank'),
    (gen_random_uuid(), 'TD Bank')
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES FOR PRODUCTION:
-- ============================================
-- 1. Run this schema on fresh Supabase database
-- 2. Enable Row Level Security (RLS) policies as needed
-- 3. Set up automatic backups
-- 4. Monitor query performance with pg_stat_statements
-- 5. Consider partitioning for tables with 10M+ records
-- 6. Set up replication for high availability
-- ============================================

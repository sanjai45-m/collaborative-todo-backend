const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL, {
    timeout: 10000,
    fetchOptions: {
        timeout: 10000
    }
});

async function testConnection(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔄 Testing database connection (attempt ${i + 1}/${retries})...`);
            const result = await sql`SELECT NOW()`;
            console.log('✅ Database connected successfully at:', result[0].now);
            return true;
        } catch (error) {
            console.error(`❌ Attempt ${i + 1} failed:`, error.message);

            if (error.cause) {
                console.error('Cause:', error.cause.message);
            }

            if (i < retries - 1) {
                console.log('⏳ Waiting 2 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    console.error('❌ All connection attempts failed');
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your internet connection');
    console.error('2. Verify the DATABASE_URL in .env is correct');
    console.error('3. Make sure Neon DB allows connections from your IP');
    console.error('4. Try using a VPN if you\'re in a restricted region');
    console.error('5. Check if neon.tech is accessible from your network');

    return false;
}

async function initDatabase() {
    try {
        console.log('🔄 Initializing database tables...');

        const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'todos'
            );
        `;

        if (!tableCheck[0].exists) {
            await sql`
                CREATE TABLE IF NOT EXISTS todos (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
                    created_by VARCHAR(100) NOT NULL,
                    updated_by VARCHAR(100) NOT NULL,
                    device_id VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            console.log('✅ Database tables created successfully');
        } else {
            await sql`
                ALTER TABLE todos 
                ADD COLUMN IF NOT EXISTS device_id VARCHAR(100)
            `;
            console.log('✅ Database tables already exist - added device_id column');
        }

        await sql`
            CREATE TABLE IF NOT EXISTS devices (
                device_id VARCHAR(100) PRIMARY KEY,
                device_name VARCHAR(255),
                first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_tasks_created INTEGER DEFAULT 0
            )
        `;
        console.log('✅ Devices table created');

        await sql`
            CREATE INDEX IF NOT EXISTS idx_device_id ON todos(device_id)
        `;
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}

module.exports = { sql, testConnection, initDatabase };
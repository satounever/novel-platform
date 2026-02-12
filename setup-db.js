const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres.gbtuphvhcmvugllcdift:7dqmS-8dRK4cN%25X@db.gbtuphvhcmvugllcdift.supabase.co:5432/postgres'
});

async function setup() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const sql = fs.readFileSync('supabase-setup.sql', 'utf8');
    await client.query(sql);
    
    console.log('✅ Database setup complete!');
    console.log('\n管理者アカウント:');
    console.log('メール: admin@example.com');
    console.log('パスワード: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setup();

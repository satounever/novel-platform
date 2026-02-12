const { Client } = require('pg');

const client = new Client({
  host: 'db.gbtuphvhcmvugllcdift.supabase.co',
  port: 5432,
  user: 'postgres.gbtuphvhcmvugllcdift',
  password: '7dqmS-8dRK4cN%X',
  database: 'postgres',
});

async function setup() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // 既存のadminを削除
    await client.query(`DELETE FROM "User" WHERE email = 'admin@example.com'`);
    console.log('✅ Deleted old admin');
    
    // 新しい管理者を作成
    await client.query(`
      INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        'admin-test-001',
        'admin@novel.com',
        '管理者',
        '$2b$10$V3hccU2c3xSbGBqtCKe09.wMOILk.HOnzu2J.ddP5bGs5lwrIttqG',
        'ADMIN',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Created admin user');
    
    // テストユーザーを作成
    await client.query(`
      INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        'user-test-001',
        'test@novel.com',
        'テストユーザー',
        '$2b$10$V3hccU2c3xSbGBqtCKe09.wMOILk.HOnzu2J.ddP5bGs5lwrIttqG',
        'PENDING',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Created test user');
    
    console.log('\n🎉 完了！');
    console.log('\n管理者アカウント:');
    console.log('メール: admin@novel.com');
    console.log('パスワード: admin123');
    console.log('\nテストユーザー:');
    console.log('メール: test@novel.com');
    console.log('パスワード: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setup();

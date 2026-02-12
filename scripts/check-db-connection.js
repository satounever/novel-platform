const { Client } = require('pg');

const CORRECT_URL = 'postgresql://postgres.gbtuphvhcmvugllcdift:7dqmS-8dRK4cN%25X@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

async function testConnection(url) {
  const client = new Client({ connectionString: url });
  
  try {
    console.log('🔌 接続テスト中...');
    await client.connect();
    console.log('✅ データベース接続成功!');
    
    const result = await client.query('SELECT current_database(), version()');
    console.log('📊 データベース:', result.rows[0].current_database);
    console.log('📊 PostgreSQL:', result.rows[0].version.split(' ')[1]);
    
    return true;
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('📡 Supabase 接続テスト');
  console.log('='.repeat(60));
  
  console.log('\n正しいDATABASE_URL:');
  console.log(CORRECT_URL);
  console.log('\nVercelの環境変数をこのURLに更新してください!');
  console.log('https://vercel.com/satounevers-projects/novel-platform/settings/environment-variables');
  console.log('\n' + '='.repeat(60) + '\n');
  
  const success = await testConnection(CORRECT_URL);
  
  if (success) {
    console.log('\n✅ この接続URLは動作します!');
    console.log('✅ Vercelの環境変数を更新して再デプロイしてください');
  } else {
    console.log('\n❌ 接続に失敗しました');
    console.log('❌ Supabaseプロジェクトの設定を確認してください');
  }
}

main();

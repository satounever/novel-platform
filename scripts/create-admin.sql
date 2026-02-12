-- 管理者ユーザーを作成
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 20),
  '管理者',
  'admin@example.com',
  '$2b$10$BDKqG6BozKx9wuAdMC2H5.dYYIuJrYd4oC6N8tFBJOdXOB7i3MuV6',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'ADMIN',
  password = '$2b$10$BDKqG6BozKx9wuAdMC2H5.dYYIuJrYd4oC6N8tFBJOdXOB7i3MuV6',
  "updatedAt" = NOW();

-- 結果を確認
SELECT id, name, email, role, "createdAt" FROM "User" WHERE email = 'admin@example.com';

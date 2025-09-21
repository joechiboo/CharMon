-- 臨時解決方案：完全關閉 RLS
-- 這會允許匿名用戶完全存取所有資料

-- 關閉 RLS
ALTER TABLE dictionary_characters DISABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_characters DISABLE ROW LEVEL SECURITY;

-- 刪除所有現有政策（如果存在）
DROP POLICY IF EXISTS "Allow read access to all users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow insert access to all users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow update access to all users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow all access to unknown_characters for all users" ON unknown_characters;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow update access to authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow all access to unknown_characters for authenticated users" ON unknown_characters;
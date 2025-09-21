-- 修復 RLS 權限設定，允許匿名用戶存取
-- 這是因為我們的應用沒有用戶認證系統

-- 刪除現有的 RLS 政策
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow update access to authenticated users" ON dictionary_characters;
DROP POLICY IF EXISTS "Allow all access to unknown_characters for authenticated users" ON unknown_characters;

-- 創建新的政策，允許匿名用戶存取

-- 字典表格的權限：允許所有用戶（包括匿名用戶）讀取和修改
CREATE POLICY "Allow read access to all users" ON dictionary_characters
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to all users" ON dictionary_characters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to all users" ON dictionary_characters
    FOR UPDATE USING (true);

-- 未知字符表格的權限：允許所有用戶（包括匿名用戶）完全存取
CREATE POLICY "Allow all access to unknown_characters for all users" ON unknown_characters
    FOR ALL USING (true);
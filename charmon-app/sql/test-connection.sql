-- 測試資料庫連接和表格是否存在

-- 檢查表格是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('dictionary_characters', 'unknown_characters');

-- 檢查 dictionary_characters 表格結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dictionary_characters'
AND table_schema = 'public';

-- 檢查 unknown_characters 表格結構
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'unknown_characters'
AND table_schema = 'public';

-- 測試查詢一些數據
SELECT COUNT(*) as character_count FROM dictionary_characters;
SELECT COUNT(*) as unknown_count FROM unknown_characters;

-- 測試插入一筆測試數據到 unknown_characters
INSERT INTO unknown_characters (character, occurrence_count, resolved)
VALUES ('測', 1, false)
ON CONFLICT (character) DO UPDATE SET occurrence_count = unknown_characters.occurrence_count + 1;
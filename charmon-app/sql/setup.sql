-- CharMon 字典系統數據庫設定

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 字典字符表
CREATE TABLE dictionary_characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character VARCHAR(1) NOT NULL UNIQUE,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0 AND stroke_count <= 50),
    radical VARCHAR(10) NOT NULL,
    radical_zhuyin VARCHAR(20),
    zhuyin VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 未知字符表
CREATE TABLE unknown_characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character VARCHAR(1) NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    occurrence_count INTEGER DEFAULT 1,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提高查詢性能
CREATE INDEX idx_dictionary_characters_character ON dictionary_characters(character);
CREATE INDEX idx_dictionary_characters_radical ON dictionary_characters(radical);
CREATE INDEX idx_unknown_characters_character ON unknown_characters(character);
CREATE INDEX idx_unknown_characters_resolved ON unknown_characters(resolved);

-- 更新 updated_at 觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dictionary_characters_updated_at
    BEFORE UPDATE ON dictionary_characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 設定
ALTER TABLE dictionary_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_characters ENABLE ROW LEVEL SECURITY;

-- 允許所有已認證用戶讀取字典
CREATE POLICY "Allow read access to all authenticated users" ON dictionary_characters
    FOR SELECT USING (auth.role() = 'authenticated');

-- 允許所有已認證用戶插入/更新字典（可以根據需要調整權限）
CREATE POLICY "Allow insert access to authenticated users" ON dictionary_characters
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users" ON dictionary_characters
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 未知字符的權限設定
CREATE POLICY "Allow all access to unknown_characters for authenticated users" ON unknown_characters
    FOR ALL USING (auth.role() = 'authenticated');

-- 插入初始字典數據
INSERT INTO dictionary_characters (character, stroke_count, radical, radical_zhuyin, zhuyin) VALUES
    ('王', 4, '王', 'ㄨㄤˊ', 'ㄨㄤˊ'),
    ('李', 7, '木', 'ㄇㄨˋ', 'ㄌㄧˇ'),
    ('張', 11, '弓', 'ㄍㄨㄥ', 'ㄓㄤ'),
    ('劉', 15, '刀', 'ㄉㄠ', 'ㄌㄧㄡˊ'),
    ('陳', 10, '阝', 'ㄈㄨˋ', 'ㄔㄣˊ'),
    ('楊', 12, '木', 'ㄇㄨˋ', 'ㄧㄤˊ'),
    ('黃', 12, '黃', 'ㄏㄨㄤˊ', 'ㄏㄨㄤˊ'),
    ('趙', 14, '走', 'ㄗㄡˇ', 'ㄓㄠˋ'),
    ('周', 8, '口', 'ㄎㄡˇ', 'ㄓㄡ'),
    ('吳', 7, '口', 'ㄎㄡˇ', 'ㄨˊ'),
    ('徐', 10, '彳', 'ㄔˋ', 'ㄒㄩˊ'),
    ('孫', 10, '子', 'ㄗˇ', 'ㄙㄨㄣ'),
    ('馬', 10, '馬', 'ㄇㄚˇ', 'ㄇㄚˇ'),
    ('朱', 6, '木', 'ㄇㄨˋ', 'ㄓㄨ'),
    ('胡', 9, '月', 'ㄩㄝˋ', 'ㄏㄨˊ'),
    ('林', 8, '木', 'ㄇㄨˋ', 'ㄌㄧㄣˊ'),
    ('郭', 10, '阝', 'ㄈㄨˋ', 'ㄍㄨㄛ'),
    ('何', 7, '人', 'ㄖㄣˊ', 'ㄏㄜˊ'),
    ('高', 10, '高', 'ㄍㄠ', 'ㄍㄠ'),
    ('羅', 19, '网', 'ㄨㄤˇ', 'ㄌㄨㄛˊ'),
    ('鄭', 14, '阝', 'ㄈㄨˋ', 'ㄓㄥˋ'),
    ('謝', 17, '言', 'ㄧㄢˊ', 'ㄒㄧㄝˋ'),
    ('韓', 17, '韋', 'ㄨㄟˊ', 'ㄏㄢˊ'),
    ('唐', 10, '口', 'ㄎㄡˇ', 'ㄊㄤˊ'),
    ('馮', 12, '冫', 'ㄅㄧㄥ', 'ㄈㄥˊ'),
    ('于', 3, '二', 'ㄦˋ', 'ㄩˊ'),
    ('董', 12, '艸', 'ㄘㄠˇ', 'ㄉㄨㄥˇ'),
    ('蕭', 18, '艸', 'ㄘㄠˇ', 'ㄒㄧㄠ'),
    ('程', 12, '禾', 'ㄏㄜˊ', 'ㄔㄥˊ'),
    ('曹', 11, '曰', 'ㄩㄝ', 'ㄘㄠˊ'),
    ('小', 3, '小', 'ㄒㄧㄠˇ', 'ㄒㄧㄠˇ'),
    ('明', 8, '日', 'ㄖˋ', 'ㄇㄧㄥˊ'),
    ('華', 12, '艸', 'ㄘㄠˇ', 'ㄏㄨㄚˊ'),
    ('美', 9, '羊', 'ㄧㄤˊ', 'ㄇㄟˇ'),
    ('玉', 5, '玉', 'ㄩˋ', 'ㄩˋ'),
    ('文', 4, '文', 'ㄨㄣˊ', 'ㄨㄣˊ'),
    ('武', 8, '止', 'ㄓˇ', 'ㄨˇ'),
    ('志', 7, '心', 'ㄒㄧㄣ', 'ㄓˋ'),
    ('偉', 11, '人', 'ㄖㄣˊ', 'ㄨㄟˇ'),
    ('勇', 9, '力', 'ㄌㄧˋ', 'ㄩㄥˇ'),
    ('強', 11, '弓', 'ㄍㄨㄥ', 'ㄑㄧㄤˊ'),
    ('國', 11, '囗', 'ㄨㄟˊ', 'ㄍㄨㄛˊ'),
    ('安', 6, '宀', 'ㄇㄧㄢˊ', 'ㄢ'),
    ('家', 10, '宀', 'ㄇㄧㄢˊ', 'ㄐㄧㄚ'),
    ('建', 8, '廴', 'ㄧㄣˇ', 'ㄐㄧㄢˋ'),
    ('成', 6, '戈', 'ㄍㄜ', 'ㄔㄥˊ'),
    ('宏', 7, '宀', 'ㄇㄧㄢˊ', 'ㄏㄨㄥˊ'),
    ('嘉', 14, '口', 'ㄎㄡˇ', 'ㄐㄧㄚ'),
    ('智', 12, '日', 'ㄖˋ', 'ㄓˋ'),
    ('仁', 4, '人', 'ㄖㄣˊ', 'ㄖㄣˊ'),
    ('義', 13, '羊', 'ㄧㄤˊ', 'ㄧˋ'),
    ('禮', 18, '示', 'ㄕˋ', 'ㄌㄧˇ'),
    ('信', 9, '人', 'ㄖㄣˊ', 'ㄒㄧㄣˋ'),
    ('紀', 9, '糸', 'ㄇㄧˋ', 'ㄐㄧˋ'),
    ('禾', 5, '禾', 'ㄏㄜˊ', 'ㄏㄜˊ')
ON CONFLICT (character) DO NOTHING;

-- 創建視圖以便於查詢統計
CREATE VIEW dictionary_stats AS
SELECT
    COUNT(*) as total_characters,
    COUNT(CASE WHEN radical_zhuyin IS NOT NULL THEN 1 END) as characters_with_radical_zhuyin,
    COUNT(DISTINCT radical) as unique_radicals
FROM dictionary_characters;

CREATE VIEW unknown_stats AS
SELECT
    COUNT(*) as total_unknown,
    COUNT(CASE WHEN resolved = true THEN 1 END) as resolved_count,
    COUNT(CASE WHEN resolved = false THEN 1 END) as pending_count,
    SUM(occurrence_count) as total_occurrences
FROM unknown_characters;
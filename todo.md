# 學習名字那邊，格子也要和低年級一樣
1. 顏色
2. 中間用虛線

# 字型
1. 預設標楷體
2. 可以選擇，現在的字型是 微軟正黑 ? 我覺得蠻好看



----
我想把幼稚園

學習寫名字的部分

有辦法加入筆順的機制嗎 ?
資料來源
開放資料庫

教育部常用國字標準字體筆順學習網

有筆順動畫和SVG資料
需要爬取或API串接


CNS11643中文標準交換碼全字庫

政府開放資料
包含筆畫順序資訊


開源筆畫資料庫

CJK Stroke Order
HanziWriter - 很推薦！

HanziWriter 推薦理由
javascript// 前端JS直接使用
import HanziWriter from 'hanzi-writer';

const writer = HanziWriter.create('character-target-div', '你', {
  width: 100,
  height: 100,
  padding: 5
});

writer.animateCharacter(); // 播放筆順動畫
實作方式
方案一：前端 Mapping（推薦）
javascript// 字典檔案 strokes.json
{
  "你": {
    "strokes": 7,
    "order": ["丿", "亻", "尔"],
    "svg_path": "M12,34L45,23...",
    "animation": [...]
  }
}

// 前端載入
import strokesData from './data/strokes.json';
const getStroke = (char) => strokesData[char];

如果搞不訂，可以參考 中華民國教育部 常用國字筆畫學習網

如果都搞得訂，可以直接開一個 筆畫練習的功能

假設我還沒起床，你可以繼續接著做 學習注音符號 ㄅㄆㄇ的區塊

# 2. 建立 辭典

好像需要建立一個後台，如果有沒有 mapping 到的字應該要保留起來，方便持續新增注音 mapping

# 3. AI 寶可夢

線上生成
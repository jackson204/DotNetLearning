-- Part 1 · SELECT 取資料（course/01-sql/02-select.md）
-- 在 Rider：Database 視窗連到 (localdb)\mssqllocaldb 的 EfCoreLab 資料庫，
-- 選取一段 SQL 後按 Ctrl+Enter 執行，結果和 dotnet run -- linq-select 的輸出對照。

-- ① 取出整張表
SELECT * FROM Blogs;

-- ② 只取需要的欄位
SELECT BlogId, Url FROM Blogs;

-- ③ 欄位改名（AS 取別名）
SELECT Url AS Address, Rating FROM Blogs;

-- ④ 計算出來的欄位
SELECT Title, LEN(Title) AS TitleLength, Views * 2 AS DoubleViews FROM Posts;

-- ⑤ 只要一個欄位
SELECT Name FROM Authors;

-- 練習 1
SELECT Title, Views FROM Posts;

-- 練習 2
SELECT Name FROM Tags;

-- 練習 3：CASE WHEN 依條件產生值
SELECT Title,
       CASE WHEN Content IS NULL THEN 0 ELSE 1 END AS HasContent
FROM Posts;

# L01 SELECT 取資料 ↔ ToList / Select 投影

- 標籤：#ef-core #sql #linq #select #projection
- 階段：1 單表基本功　·　約 15 分鐘　·　前置：[L00](L00-lab-setup.md)
- 圖解版：[L01-select.html](L01-select.html)
- 練習：`dotnet run -- L01`、`dotnet run -- L01 --ex`；程式 `lab/EfCoreLab/Lessons/L01_Select.cs`、`L01.sql`

## 學完你會

- 寫出 `SELECT 欄位 FROM 資料表`
- 翻成 LINQ 的 `ToList()` / `Select()`
- 知道投影（只取需要的欄位）為什麼比較好
- 避開「沒排序」與「先 ToList 再 Select」兩個坑

## 情境

首頁要列出所有部落格的網址 → 從 `Blogs` 表讀資料。

## SQL：SELECT 句型

```sql
SELECT 欄位 FROM 資料表;
SELECT * FROM Blogs;            -- * = 全部欄位
SELECT BlogId, Url FROM Blogs;  -- 只拿兩個欄位
```

關鍵字不分大小寫、分號可省、`--` 是註解；沒寫條件就拿回每一列（篩選是 L02 的 `WHERE`）。

## SQL ↔ LINQ（EF SQL 為實際輸出）

| # | SQL | LINQ | EF Core 產生的 SQL |
|---|-----|------|--------------------|
| ① 整張表 | `SELECT * FROM Blogs` | `db.Blogs.ToList()` | `SELECT [b].[BlogId], [b].[Rating], [b].[Url] FROM [Blogs] AS [b]` |
| ② 指定欄位 | `SELECT BlogId, Url FROM Blogs` | `db.Blogs.Select(b => new { b.BlogId, b.Url }).ToList()` | `SELECT [b].[BlogId], [b].[Url] FROM [Blogs] AS [b]` |
| ③ 改名 | `SELECT Url AS Address, Rating FROM Blogs` | `.Select(b => new { Address = b.Url, b.Rating })` | `SELECT [b].[Url] AS [Address], [b].[Rating] ...` |
| ④ 計算 | `SELECT Title, LEN(Title) AS TitleLength, Views * 2 AS DoubleViews FROM Posts` | `.Select(p => new { p.Title, TitleLength = p.Title.Length, DoubleViews = p.Views * 2 })` | `CAST(LEN([p].[Title]) AS int) AS [TitleLength], [p].[Views] * 2 AS [DoubleViews]` |
| ⑤ 單一欄位 | `SELECT Name FROM Authors` | `db.Authors.Select(a => a.Name).ToList()` → `List<string>` | `SELECT [a].[Name] FROM [Authors] AS [a]` |
| ⑥ DTO | `SELECT BlogId, Url FROM Blogs` | `.Select(b => new BlogSummary(b.BlogId, b.Url))` | 同 ② |

- `ToList()` = 現在就去查；EF 不送 `SELECT *`，而是列出 class 的所有欄位
- `Select` = SQL 的欄位清單，寫幾個屬性就查幾個欄位（投影 Projection）
- `.Length` 被翻成 `LEN()`，在資料庫端計算

## 為什麼要投影

- 傳得少：例如列表頁不需要很長的 `Content`
- 不被追蹤：匿名型別 / DTO 不進 Change Tracker（L15）
- API 安全：只回需要的欄位，不會有導覽屬性循環參考
- 原則：**要修改 → 取 Entity；只顯示 → Select 投影**

## 常見的坑

1. **沒排序就不保證順序**：實測 ① 回傳 1、2、3，② 卻是 3、1、2，因為 SQL Server 改讀 `Url` 的唯一索引（含 BlogId），索引依網址排序。需要順序就寫 `OrderBy`（L03）。
2. **先 `ToList()` 再 `Select`**：`db.Posts.ToList().Select(p => p.Title)` 會先抓整張表所有欄位。`ToList()` 之前變 SQL、之後在記憶體執行（L06）。
3. 匿名型別不能當方法回傳型別 → 用 `record` / `class` DTO。

## 練習（`dotnet run -- L01 --ex`）

1. 文章標題與瀏覽數：`SELECT Title, Views FROM Posts` ↔ `db.Posts.Select(p => new { p.Title, p.Views })`
2. 標籤名稱清單：`SELECT Name FROM Tags` ↔ `db.Tags.Select(t => t.Name).ToList()`（6 個；順序依 Name 索引）
3. 文章有沒有內容：
   ```sql
   SELECT Title, CASE WHEN Content IS NULL THEN 0 ELSE 1 END AS HasContent FROM Posts;
   ```
   ```csharp
   db.Posts.Select(p => new { p.Title, HasContent = p.Content != null })
   ```
   EF 產生 `CASE WHEN [p].[Content] IS NOT NULL THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END`；只有草稿是 false。NULL 要用 `IS NULL` 判斷。

## 延伸閱讀

- [SQLBolt Lesson 1：SELECT queries 101](https://sqlbolt.com/lesson/select_queries_introduction)
- [W3Schools：SQL SELECT](https://www.w3schools.com/sql/sql_select.asp)
- [C#：LINQ 投影運算](https://learn.microsoft.com/dotnet/csharp/linq/standard-query-operators/projection-operations)
- [EF Core：查詢資料](https://learn.microsoft.com/ef/core/querying/)
- [SELECT (Transact-SQL)](https://learn.microsoft.com/sql/t-sql/queries/select-transact-sql)

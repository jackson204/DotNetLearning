# Select：投影

<!-- meta:start -->
Part 3　LINQ：把 SQL 翻成 LINQ　·　單元 3-02　·　約 20 分鐘　·　練習專案：`dotnet run -- linq-select`
<!-- meta:end -->

## 學完你會

- 把 `SELECT 欄位 FROM 資料表` 翻成 LINQ 的 `ToList()` 和 `Select()`
- 知道「只取需要的欄位」（投影）在 EF Core 裡為什麼比較好
- 看懂 EF Core 實際送出的 SQL，確認它跟你想的一樣
- 避開兩個新手常踩的坑

## 情境

[1-02](../01-sql/02-select.md) 用 SQL 列出了所有部落格的網址。現在同一件事要在 C# 程式裡做：透過 EF Core 的 `DbContext`（練習專案裡叫 `db`）寫 LINQ，讓 EF Core 替你產生 SQL。

每個例子都照同一個順序看：**你會寫的 SQL → LINQ → EF Core 產生的 SQL → 結果**。「EF Core 產生的 SQL」和結果都是 `dotnet run -- linq-select` 實際執行的輸出。

## 六種寫法

#### ① 取出整張表

**SQL**

```sql
SELECT * FROM Blogs;
```

**LINQ**

```csharp
var blogs = db.Blogs.ToList();
// 型別：List<Blog>
```

**EF Core 產生的 SQL**

```sql
SELECT [b].[BlogId], [b].[Rating], [b].[Url]
FROM [Blogs] AS [b]
```

| BlogId | Url | Rating |
|---|---|---|
| 1 | https://devblog.example.com | 5 |
| 2 | https://dotnet.example.com | 4 |
| 3 | https://cooking.example.com | NULL |

`db.Blogs` 就是 `Blogs` 表，`ToList()` 是「現在就去查，把結果裝成 List」。EF Core 不會送出 `SELECT *`，而是把 `Blog` class 的每個屬性都列出來；`[b]` 是它幫資料表取的別名，方括號是 SQL Server 用來包住名稱的寫法。

#### ② 只取需要的欄位

**SQL**

```sql
SELECT BlogId, Url FROM Blogs;
```

**LINQ**

```csharp
var list = db.Blogs
    .Select(b => new { b.BlogId, b.Url })
    .ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [b].[BlogId], [b].[Url]
FROM [Blogs] AS [b]
```

| BlogId | Url |
|---|---|
| 3 | https://cooking.example.com |
| 1 | https://devblog.example.com |
| 2 | https://dotnet.example.com |

`Select` 對應 SQL 的 SELECT 欄位清單：`b =>` 的 `b` 代表「每一列」，`new { … }` 寫幾個屬性，SQL 就只查幾個欄位。這種只挑部分欄位的做法叫**投影（Projection）**。順序跟 ① 不一樣的原因，[1-02](../01-sql/02-select.md) 的「常見的坑」講過：沒有排序就不保證順序。

#### ③ 欄位改名

**SQL**

```sql
SELECT Url AS Address, Rating
FROM Blogs;
```

**LINQ**

```csharp
db.Blogs
  .Select(b => new { Address = b.Url, b.Rating })
  .ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [b].[Url] AS [Address], [b].[Rating]
FROM [Blogs] AS [b]
```

SQL 用 `AS` 取別名，LINQ 用 `新名字 = 屬性`。

#### ④ 計算出來的欄位

**SQL**

```sql
SELECT Title,
       LEN(Title) AS TitleLength,
       Views * 2  AS DoubleViews
FROM Posts;
```

**LINQ**

```csharp
db.Posts.Select(p => new
{
    p.Title,
    TitleLength = p.Title.Length,
    DoubleViews = p.Views * 2
}).ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [p].[Title], CAST(LEN([p].[Title]) AS int) AS [TitleLength], [p].[Views] * 2 AS [DoubleViews]
FROM [Posts] AS [p]
```

| Title | TitleLength | DoubleViews |
|---|---|---|
| EF Core 入門 | 10 | 240 |
| LINQ 基礎 | 7 | 160 |
| SQL JOIN 圖解 | 11 | 400 |
| 草稿：Include 心得 | 13 | 0 |
| C# 10 新功能 | 9 | 300 |
| EF Core 效能調校 | 12 | 600 |
| AsNoTracking 何時用 | 16 | 180 |
| SelectMany 範例 | 13 | 120 |
| 番茄炒蛋 | 4 | 1000 |
| 三杯雞 | 3 | 840 |

C# 的 `.Length` 被翻成 SQL Server 的 `LEN()`，**在資料庫端算好**才傳回來。EF Core 認得很多 C# 的屬性和方法，會翻成對應的 SQL 函式；翻不出來的會丟例外（[3-06](06-deferred-execution.md) 會講）。

#### ⑤ 只要一個欄位

**SQL**

```sql
SELECT Name FROM Authors;
```

**LINQ**

```csharp
List<string> names = db.Authors
    .Select(a => a.Name)
    .ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [a].[Name]
FROM [Authors] AS [a]
```

結果：`["小明", "小華", "阿傑"]`。`Select` 裡只寫一個屬性（沒有 `new { }`），得到的就是該型別的清單，不是物件清單。

#### ⑥ 投影成自己定義的類別（DTO）

**SQL**

```sql
SELECT BlogId, Url FROM Blogs;
```

**LINQ**

```csharp
public record BlogSummary(int Id, string Url);

db.Blogs
  .Select(b => new BlogSummary(b.BlogId, b.Url))
  .ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [b].[BlogId], [b].[Url]
FROM [Blogs] AS [b]
```

SQL 和 ② 一樣，差別只在 C# 端拿到的是有名字的型別 `List<BlogSummary>`。API 回傳給前端時，通常就是回傳這種 DTO（Data Transfer Object，[4-09](../04-web-api/09-dto-layers.md) 會講）。

### 對照總表

| 想做的事 | SQL | LINQ |
|---|---|---|
| 整張表 | `SELECT * FROM Blogs` | `db.Blogs.ToList()` |
| 指定欄位 | `SELECT BlogId, Url FROM Blogs` | `.Select(b => new { b.BlogId, b.Url })` |
| 改名 | `Url AS Address` | `Address = b.Url` |
| 計算 | `LEN(Title)`、`Views * 2` | `p.Title.Length`、`p.Views * 2` |
| 單一欄位清單 | `SELECT Name FROM Authors` | `.Select(a => a.Name)` |
| 真的去查 | 按下執行 | `.ToList()` |

## 為什麼「只取需要的欄位」比較好

首頁只需要網址，但 ① 會把每個欄位都拿回來。想像 `Posts` 表有一個很長的 `Content`（整篇文章內容），列表頁卻只要標題：

**`db.Posts.ToList()`：每個欄位都從資料庫傳回來**

| PostId | Title | Content | Views | … |
|---|---|---|---|---|
| 1 | EF Core 入門 | （整篇文章，可能上萬字） | 120 | … |

**`db.Posts.Select(p => new { p.PostId, p.Title })`：只傳需要的兩欄**

| PostId | Title |
|---|---|
| 1 | EF Core 入門 |

| 好處 | 說明 |
|---|---|
| 傳得少、比較快 | 資料庫少讀、網路少傳、記憶體少用。資料量大時差很多 |
| 不會被追蹤 | 取整個 Entity 時，EF Core 會記住它們以便之後存檔。投影出來的匿名型別或 DTO 不會被追蹤，省下這份工作（[3-08](08-change-tracker.md) 會講） |
| API 回傳更安全 | 只回前端需要的欄位，不會把不該公開的欄位一起送出去，也不會遇到導覽屬性的循環參考 |

> [!TIP]
> **原則**
>
> 要**修改**資料時取整個 Entity（`ToList()` / `First()`）；只是要**顯示**時，用 `Select` 投影。

## 動手

```bash
cd lab/EfCoreLab
dotnet run -- linq-select          # 六個例子
dotnet run -- linq-select --log    # 多印出 EF Core 實際送到資料庫的 SQL 紀錄
```

打開 `lab/EfCoreLab/Lessons/LinqSelect.cs`，改改看：在 ② 的 `new { }` 裡多加一個 `b.Rating`，重新執行，確認產生的 SQL 多了一欄。

## 常見的坑

> [!WARNING]
> **先 `ToList()` 再 `Select`**
>
> ```csharp
> // ✗ 先把整張表（所有欄位）抓回記憶體，再在 C# 裡挑欄位
> db.Posts.ToList().Select(p => p.Title);
>
> // ✓ 先 Select 再 ToList：SQL 只查 Title
> db.Posts.Select(p => p.Title).ToList();
> ```
>
> `ToList()` 是「現在就去查」的分界線，**它之前的部分會變成 SQL，之後的部分在 C# 記憶體裡執行**。所以 `Select` 要寫在 `ToList()` 前面。[3-06](06-deferred-execution.md) 會深入講這條分界線。

> [!WARNING]
> **匿名型別不能當方法的回傳型別**
>
> `new { b.BlogId, b.Url }` 是沒有名字的型別，只能在同一個方法裡用。要從方法或 API 回傳，就改用 ⑥ 的 DTO（`record` 或 `class`）。

## 小練習

先自己寫出 SQL 和 LINQ，再展開答案。所有解答都能用 `dotnet run -- linq-select --ex` 執行。

**練習 1**　列出所有文章的**標題**和**瀏覽數**。

<details>
<summary>看答案</summary>

```sql
SELECT Title, Views FROM Posts;
```

```csharp
db.Posts.Select(p => new { p.Title, p.Views }).ToList();
```

EF Core 產生：`SELECT [p].[Title], [p].[Views] FROM [Posts] AS [p]`，共 10 筆。

</details>

**練習 2**　列出所有標籤的名稱，結果要是 `List<string>`。

<details>
<summary>看答案</summary>

```sql
SELECT Name FROM Tags;
```

```csharp
List<string> tags = db.Tags.Select(t => t.Name).ToList();
```

結果有 6 個：cooking、csharp、docker、efcore、linq、sql。順序依 `Name` 上的唯一索引。

</details>

**練習 3（挑戰）**　列出每篇文章的標題，以及「有沒有內容」（`Content` 是否為 NULL）。

<details>
<summary>提示</summary>

SQL 用 `CASE WHEN 條件 THEN 值 ELSE 值 END`；LINQ 直接寫 `p.Content != null`，EF Core 會翻成 `CASE WHEN`。

</details>

<details>
<summary>看答案</summary>

```sql
SELECT Title,
       CASE WHEN Content IS NULL THEN 0 ELSE 1 END AS HasContent
FROM Posts;
```

```csharp
db.Posts.Select(p => new { p.Title, HasContent = p.Content != null }).ToList();
```

EF Core 產生的 SQL：

```sql
SELECT [p].[Title], CASE
    WHEN [p].[Content] IS NOT NULL THEN CAST(1 AS bit)
    ELSE CAST(0 AS bit)
END AS [HasContent]
FROM [Posts] AS [p]
```

只有「草稿：Include 心得」是 false。C# 的 `bool` 在 SQL Server 對應 `bit` 型別（0 / 1）。

</details>

## 延伸閱讀

- [C# 官方文件：LINQ 投影運算](https://learn.microsoft.com/dotnet/csharp/linq/standard-query-operators/projection-operations)：`Select` 的完整說明（也預告了之後的 `SelectMany`）
- [EF Core 官方文件：查詢資料](https://learn.microsoft.com/ef/core/querying/)：EF Core 查詢的總覽

> **下一個問題**：首頁只要列出「部落格 1 的文章」。SQL 的 `WHERE` 翻成 LINQ 是什麼？

<!-- nav:start -->
---
← 上一課：[LINQ 怎麼變成 SQL](01-linq-to-sql.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[Where：篩選](03-where.md)（尚未推出） →
<!-- nav:end -->

# SELECT：取資料

<!-- meta:start -->
Part 1　資料庫與 SQL　·　單元 1-02　·　約 15 分鐘　·　SQL 檔：`lab/EfCoreLab/Lessons/sql-select.sql`
<!-- meta:end -->

## 學完你會

- 寫出最基本的 SQL：`SELECT 欄位 FROM 資料表`
- 分得清 `*` 和指定欄位的差別
- 用 `AS` 改欄位名稱、在 SELECT 裡做計算
- 在 Rider 執行 `.sql` 檔，看到結果表

## 情境

部落格平台的首頁要列出**所有部落格的網址**。資料都在資料庫的 `Blogs` 表裡，你要怎麼跟資料庫說「把它們給我」？

跟資料庫溝通的語言是 **SQL**（Structured Query Language）。它不是程式語言，比較像一種固定格式的問句：你說要什麼，資料庫把結果排成表格還你。

## SELECT 句型

從資料庫**讀取**資料，用的是 `SELECT`。最基本的句型只有兩個空格要填：

| 關鍵字 | 填什麼 | 意思 |
|---|---|---|
| `SELECT` | 欄位清單，用逗號分隔；`*` 代表全部欄位 | 我要拿這些欄位 |
| `FROM` | 資料表名稱 | 從這張表拿 |

```sql
SELECT * FROM Blogs;            -- 從 Blogs 表拿「全部欄位」
SELECT BlogId, Url FROM Blogs;  -- 從 Blogs 表只拿 BlogId 和 Url 兩個欄位
```

> [!NOTE]
> **SQL 的幾個小規則**
>
> 關鍵字大小寫都可以（`select` = `SELECT`，習慣上關鍵字大寫、欄位名照資料表的寫法）。結尾的分號可以省略，但一次執行多句時要用分號分開。`--` 後面是註解。沒有寫條件時，會拿回表裡的**每一列**；只拿部分列的寫法是下一課的 `WHERE`。

## 五種寫法

以下的結果都是練習專案的資料（`dotnet run -- reset` 之後的狀態），你可以在 Rider 執行同一段 SQL 對照。

#### ① 取出整張表

```sql
SELECT * FROM Blogs;
```

| BlogId | Url | Rating |
|---|---|---|
| 1 | https://devblog.example.com | 5 |
| 2 | https://dotnet.example.com | 4 |
| 3 | https://cooking.example.com | NULL |

`*` 代表「這張表有的每一欄」。寫起來最快，但拿回來的欄位可能比你需要的多很多（見「常見的坑」）。

#### ② 只取需要的欄位

```sql
SELECT BlogId, Url FROM Blogs;
```

| BlogId | Url |
|---|---|
| 3 | https://cooking.example.com |
| 1 | https://devblog.example.com |
| 2 | https://dotnet.example.com |

欄位名稱用逗號分隔，結果表就只有這些欄。**注意順序跟 ① 不一樣了**，原因見「常見的坑」。

#### ③ 欄位改名：AS

```sql
SELECT Url AS Address, Rating
FROM Blogs;
```

| Address | Rating |
|---|---|
| https://devblog.example.com | 5 |
| https://dotnet.example.com | 4 |
| https://cooking.example.com | NULL |

`AS` 替結果表的欄位取別名（Alias），只影響這次查詢的結果，不會改到資料表。SQL 可以換行，排版清楚比較重要。

#### ④ 計算出來的欄位

```sql
SELECT Title,
       LEN(Title) AS TitleLength,
       Views * 2  AS DoubleViews
FROM Posts;
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

SELECT 裡可以放運算式：`LEN()` 是 SQL Server 算文字長度的函式，`Views * 2` 是算術。這些計算**在資料庫端做完**才回傳，程式拿到的已經是算好的值。算出來的欄位沒有名字，所以要用 `AS` 命名。

#### ⑤ 只要一個欄位

```sql
SELECT Name FROM Authors;
```

| Name |
|---|
| 小明 |
| 小華 |
| 阿傑 |

結果表只有一欄。之後在 C# 裡，這種查詢會直接變成一個 `List<string>`。

### 對照總表

| 想做的事 | 寫法 |
|---|---|
| 整張表 | `SELECT * FROM Blogs` |
| 指定欄位 | `SELECT BlogId, Url FROM Blogs` |
| 改名 | `SELECT Url AS Address FROM Blogs` |
| 計算 | `SELECT LEN(Title) AS TitleLength, Views * 2 AS DoubleViews FROM Posts` |
| 單一欄位 | `SELECT Name FROM Authors` |

## 動手

1. 在 Rider 打開 `lab/EfCoreLab/Lessons/sql-select.sql`，右上角的資料來源選 `EfCoreLab`（設定方式見 [0-02](../00-overview/02-lab-setup.md)）。
2. 把游標放在第一段 SQL 上，按 `Ctrl+Enter`，下方會出現結果表。一段一段往下執行。
3. 改改看：把 ④ 的 `Views * 2` 改成 `Views + 100`，或把 ⑤ 改成 `SELECT Name, Email FROM Authors`，看結果怎麼變。
4. 故意把欄位名打錯（`SELECT Titel FROM Posts`），看資料庫回什麼錯誤訊息：`Invalid column name 'Titel'`。記住這句，以後看到就知道是欄位名打錯。

## 常見的坑

> [!WARNING]
> **沒寫排序，順序就不保證**
>
> 對照 ① 和 ②：同一張表，① 是 1、2、3，② 卻是 3、1、2。原因是 ② 只要 `BlogId` 和 `Url`，SQL Server 發現 `Url` 上剛好有一個索引包含這兩個欄位，就直接讀索引，而索引是照網址字母排序的。
>
> 重點：**沒有 `ORDER BY` 時，資料庫可以用任何順序回傳**。需要順序就一定要明確寫出來，[1-04](04-order-by-paging.md) 會教。

> [!WARNING]
> **正式程式少用 `SELECT *`**
>
> 學習和除錯時 `SELECT *` 很方便，但正式的查詢要寫明欄位：少傳不需要的大欄位（例如整篇 `Content`）、資料表之後加欄位也不會意外跟著傳出去、別人一看就知道這段查詢要什麼。

## 小練習

先自己寫出 SQL 並在 Rider 執行，再展開答案。

**練習 1**　列出所有文章的**標題**和**瀏覽數**。

<details>
<summary>看答案</summary>

```sql
SELECT Title, Views FROM Posts;
```

共 10 列，瀏覽數最高的是番茄炒蛋（500）。

</details>

**練習 2**　列出所有標籤的名稱。

<details>
<summary>看答案</summary>

```sql
SELECT Name FROM Tags;
```

結果有 6 個：cooking、csharp、docker、efcore、linq、sql。順序跟 TagId 不同，原因同「沒寫排序」那個坑：`Name` 上有唯一索引，資料庫照索引讀。

</details>

**練習 3（挑戰）**　列出每篇文章的標題，以及「有沒有內容」：`Content` 是 NULL 顯示 0，否則顯示 1。

<details>
<summary>提示</summary>

SQL 用 `CASE WHEN 條件 THEN 值 ELSE 值 END` 依條件產生值；判斷 NULL 要用 `IS NULL`，不能用 `= NULL`。

</details>

<details>
<summary>看答案</summary>

```sql
SELECT Title,
       CASE WHEN Content IS NULL THEN 0 ELSE 1 END AS HasContent
FROM Posts;
```

只有「草稿：Include 心得」是 0。`CASE WHEN` 很常用，之後會在 LINQ 裡看到它的對應寫法。

</details>

## 延伸閱讀

- [SQLBolt Lesson 1：SELECT queries 101](https://sqlbolt.com/lesson/select_queries_introduction)（互動式練習，直接在網頁上寫 SELECT）
- [W3Schools：SQL SELECT Statement](https://www.w3schools.com/sql/sql_select.asp)
- [SELECT (Transact-SQL)（Microsoft Learn）](https://learn.microsoft.com/sql/t-sql/queries/select-transact-sql)：完整語法，當字典查

> **下一個問題**：首頁只要列出「部落格 1 的文章」，不是全部文章。怎麼只拿符合條件的列？

<!-- nav:start -->
---
← 上一課：[資料表長什麼樣](01-tables.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[WHERE：篩選](03-where.md)（尚未推出） →
<!-- nav:end -->

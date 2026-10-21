# 練習環境：EfCoreLab

<!-- meta:start -->
Part 0　全景　·　單元 0-02　·　約 15 分鐘
<!-- meta:end -->

## 學完你會

- 把練習專案跑起來，玩壞了知道怎麼重來
- 知道範例資料長什麼樣子，之後每課都用它
- 會用兩種方法看 EF Core 送出的 SQL
- 會在 Rider 裡直接執行 SQL

## 情境

學查詢最快的方法，是**自己執行、看到結果**。光看文件，很難知道 `Select` 到底送出了什麼 SQL、拿回了哪些資料。

所以這套課程配了一個小專案 **EfCoreLab**（在 `lab/`）：資料庫和範例資料都準備好了，每課的範例只要一行指令就能執行，畫面上會依序印出：

| 印出的區塊 | 內容 |
|---|---|
| 你會寫的 SQL | 同一個查詢用 SQL 怎麼寫 |
| LINQ | 用 EF Core 怎麼寫 |
| EF Core 產生的 SQL | EF Core 把 LINQ 翻譯成的 SQL，也就是實際送到資料庫的內容 |
| 結果 | 資料庫回傳的資料，排成表格 |

## 把它跑起來

### 步驟 1：確認環境

```bash
dotnet --version      # 要是 10.x（repo 的 global.json 鎖定 .NET 10）
sqllocaldb info       # 應該看到 MSSQLLocalDB
```

- 沒有 .NET 10：到 [dotnet.microsoft.com](https://dotnet.microsoft.com/download) 安裝 .NET 10 SDK。
- 沒有 LocalDB：LocalDB 是給開發用的迷你 SQL Server，不需要另外設定。安裝 SQL Server Express 時勾選 LocalDB 就有。

### 步驟 2：建立資料庫與範例資料

用 Rider 打開 `lab/EfCoreLab.sln`，在 `lab/EfCoreLab` 資料夾（`.csproj` 所在處）開終端機：

```bash
dotnet run -- reset
```

看到「資料庫 EfCoreLab 已重建，範例資料已放入。」就完成了。之後練習時改壞了資料，再執行一次 `reset` 就會回到初始狀態。

### 步驟 3：執行第一課

```bash
dotnet run -- linq-select
```

畫面會像這樣（實際執行的輸出）：

```text
══ linq-select　Select 投影：SELECT ↔ ToList / Select ══

▶ ② 只取需要的欄位：編號和網址
  ┌ 你會寫的 SQL
  │ SELECT BlogId, Url FROM Blogs;
  ┌ LINQ
  │ db.Blogs.Select(b => new { b.BlogId, b.Url }).ToList()
  ┌ EF Core 產生的 SQL（ToQueryString）
  │ SELECT [b].[BlogId], [b].[Url]
  │ FROM [Blogs] AS [b]
  結果：3 筆
    BlogId | Url
    -------+----------------------------
    3      | https://cooking.example.com
    1      | https://devblog.example.com
    2      | https://dotnet.example.com
```

### 所有指令

| 指令 | 做什麼 |
|---|---|
| `dotnet run` | 顯示用法與目前的課程清單 |
| `dotnet run -- reset` | 刪掉資料庫重建，放入範例資料 |
| `dotnet run -- linq-select` | 執行某一課的範例（課程名稱見每課的 meta 列） |
| `dotnet run -- linq-select --ex` | 執行該課的練習解答 |
| `dotnet run -- linq-select --log` | 另外印出 EF Core 實際執行的 SQL 紀錄 |

> [!TIP]
> **在 Rider 裡用按鈕執行**
>
> 右上角 Run Configuration → Edit Configurations → **Program arguments** 填 `linq-select`，之後按 ▶ 就會執行那一課。

## 範例資料長什麼樣子

一個小型部落格平台：部落格、頁首、作者、文章、標籤，再加一張 EF Core 自動建立的中間表 `PostTag`。剛好涵蓋一對一、一對多、多對多三種關聯。

![EfCoreLab 的六張資料表與外鍵關聯](../images/lab-schema.svg)

*圖 1　EfCoreLab 的資料表與關聯（資料庫圖）*

> [!TIP]
> **怎麼讀這張圖**
>
> 每個方塊是一張資料表，一列一個欄位：左邊是欄位名稱，右邊是型別，**PK** 是主鍵、**FK** 是外鍵、**NULL** 表示這格可以沒有值。
>
> 線從 FK 欄位連到它指向的 PK 欄位，線兩端的記號是「對面有幾筆」：`||` 恰好一個、`o|` 零或一、`o{` 零或多。例如 Posts.AuthorId 那條線，Authors 那端是 `o|`，就是「一篇文章可以沒有作者」。多對多不會直接連 Posts 和 Tags，而是各自一對多到中間表 `PostTag`。

### Blogs（3 筆）與 BlogHeaders（2 筆）

| BlogId | Url | Rating | 頁首 Title | 頁首 Subtitle |
|---|---|---|---|---|
| 1 | https://devblog.example.com | 5 | Dev 日誌 | 寫程式的日常 |
| 2 | https://dotnet.example.com | 4 | .NET 筆記 | NULL |
| 3 | https://cooking.example.com | NULL | （沒有頁首） | |

### Authors（3 筆）

| AuthorId | Name | Email | 備註 |
|---|---|---|---|
| 1 | 小明 | ming@example.com | |
| 2 | 小華 | NULL | |
| 3 | 阿傑 | jie@example.com | 還沒寫過文章 |

### Posts（10 筆）與標籤

| PostId | Title | BlogId | AuthorId | PublishedOn | Views | Tags |
|---|---|---|---|---|---|---|
| 1 | EF Core 入門 | 1 | 1 | 2026-01-05 | 120 | efcore, csharp |
| 2 | LINQ 基礎 | 1 | 1 | 2026-01-12 | 80 | linq, csharp |
| 3 | SQL JOIN 圖解 | 1 | 2 | 2026-02-01 | 200 | sql |
| 4 | 草稿：Include 心得 | 1 | 1 | 2026-02-10 | 0 | （無，Content 也是 NULL） |
| 5 | C# 10 新功能 | 2 | 2 | 2026-01-20 | 150 | csharp |
| 6 | EF Core 效能調校 | 2 | 1 | 2026-02-15 | 300 | efcore, sql |
| 7 | AsNoTracking 何時用 | 2 | NULL | 2026-03-01 | 90 | efcore |
| 8 | SelectMany 範例 | 2 | 2 | 2026-03-05 | 60 | linq |
| 9 | 番茄炒蛋 | 3 | NULL | 2026-01-08 | 500 | cooking |
| 10 | 三杯雞 | 3 | NULL | 2026-02-20 | 420 | cooking |

Tags 共 6 個：efcore、csharp、sql、linq、cooking、docker，其中 **docker 沒有任何文章使用**。

> [!NOTE]
> **這些「特例」是故意的**
>
> 沒評分的部落格、沒 Email 的作者、沒寫文章的作者、沒內容的草稿、沒人用的標籤……之後學 `WHERE ... IS NULL`、LEFT JOIN、`Any` 時，就靠這些資料看出差別。

## 兩種看 SQL 的方法

### 方法一：`ToQueryString()`

把查詢**翻譯成 SQL 字串，但不執行**。適合寫程式時快速確認「這段 LINQ 會變成什麼 SQL」。

```csharp
var query = db.Blogs.Select(b => b.Url);
Console.WriteLine(query.ToQueryString());
// SELECT [b].[Url]
// FROM [Blogs] AS [b]
```

EfCoreLab 每一段範例的「EF Core 產生的 SQL」就是用它印的。

### 方法二：記錄（Logging）

在 DbContext 開啟記錄，**每次真的送 SQL 到資料庫時**都會印出來，還附上花了多少時間。

```csharp
options.UseSqlServer(connectionString)
       .LogTo(Console.WriteLine,
              new[] { RelationalEventId.CommandExecuted });
```

EfCoreLab 加上 `--log` 就會開啟。輸出像這樣：

```text
Executed DbCommand (3ms) [Parameters=[]...]
SELECT [b].[BlogId], [b].[Rating], [b].[Url]
FROM [Blogs] AS [b]
```

> [!TIP]
> **差別在哪？**
>
> `ToQueryString()` 只看單一查詢的翻譯結果；記錄則會抓到**所有**實際送出的 SQL。之後學 N+1 問題（[3-13](../03-linq/13-projection-vs-include.md)）時，你會靠記錄發現「明明只寫一行，卻送了 11 次 SQL」。在 ASP.NET Core 專案裡，把 `appsettings.Development.json` 的 `Microsoft.EntityFrameworkCore.Database.Command` 設成 `Information`，效果就跟方法二一樣（[4-08](../04-web-api/08-config-logging.md)）。

## 在 Rider 裡直接執行 SQL

Part 1 學 SQL 的時候，直接對資料庫執行最快。SQL 單元都有一個 `lab/EfCoreLab/Lessons/sql-*.sql`：

1. Rider 右側打開 **Database** 視窗 → **+** → **Data Source** → **Microsoft SQL Server LocalDB**。
2. Instance 選 `MSSQLLocalDB`，驗證方式用 Windows 驗證，資料庫選 `EfCoreLab`，按 Test Connection 後確定。第一次可能會提示下載驅動程式，照著按就好。
3. 打開 `Lessons/sql-select.sql`，右上角選剛才的資料來源。
4. 把游標放在某一段 SQL 上（或選取它），按 `Ctrl+Enter` 執行，下方會出現結果表。

也可以在 Database 視窗對資料庫按右鍵 → **New → Query Console**，自由輸入 SQL 試試看。

## 動手

把上面三件事各做一次：`reset`、`linq-select`、在 Rider 執行 `sql-select.sql` 的第一段。三個都成功，環境就沒問題了。

## 常見的坑

> [!WARNING]
> **`dotnet run` 要在 `.csproj` 所在資料夾執行**
>
> 在 `lab/` 執行會說找不到專案；要到 `lab/EfCoreLab/`。或者加參數：`dotnet run --project lab/EfCoreLab -- reset`。

> [!WARNING]
> **`--` 後面才是給程式的參數**
>
> `dotnet run -- reset` 的 `--` 是告訴 `dotnet` 指令「後面的參數交給程式」，少了它 `reset` 會被當成 `dotnet run` 自己的參數。

> [!WARNING]
> **連線錯誤：憑證不受信任**
>
> 看到 `The certificate chain was issued by an authority that is not trusted`，是新版驅動程式預設加密連線但 LocalDB 沒有正式憑證。練習專案的連線字串已經加了 `TrustServerCertificate=True`，自己開新專案時記得加（[2-06](../02-dotnet-and-db/06-dbcontext.md)）。

## 小練習

**練習 1**　執行 `dotnet run -- reset`，再執行 `dotnet run -- linq-select`，確認畫面上有 6 段範例。

**練習 2**　在 Rider 的 Query Console 執行 `SELECT * FROM Posts;`，數數看有幾筆、哪幾篇的 AuthorId 是 NULL。

<details>
<summary>看答案</summary>

10 筆。AuthorId 為 NULL 的是第 7、9、10 篇（AsNoTracking 何時用、番茄炒蛋、三杯雞）。

</details>

**練習 3**　執行 `SELECT * FROM PostTag;`，這張表是做什麼的？

<details>
<summary>看答案</summary>

它是文章與標籤多對多關係的**中間表**，每一列代表「某篇文章有某個標籤」，欄位是 `PostsPostId` 和 `TagsTagId`。EF Core 自動建立，C# 裡沒有對應的 class。[1-09](../01-sql/09-many-to-many.md) 和 [3-12](../03-linq/12-many-to-many.md) 會詳細講。

</details>

## 延伸閱讀

- [EF Core 官方文件：Simple logging（LogTo 的用法）](https://learn.microsoft.com/ef/core/logging-events-diagnostics/simple-logging)
- 練習專案的說明：[lab/README.md](../../lab/README.md)

> **下一個問題**：環境好了。資料到底是怎麼存在資料庫裡的？打開一張表看看。

<!-- nav:start -->
---
← 上一課：[一個 Web API 怎麼運作](01-how-web-api-works.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[資料表長什麼樣](../01-sql/01-tables.md) →
<!-- nav:end -->

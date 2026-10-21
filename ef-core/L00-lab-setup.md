# L00 練習環境：EfCoreLab

- 標籤：#ef-core #localdb #rider #logging
- 階段：0 準備　·　約 15 分鐘
- 圖解版：[L00-lab-setup.html](L00-lab-setup.html)
- 上一課：[EF Core 入門](00-basics.md)　·　下一課：[L01 SELECT 取資料](L01-select.md)

## 學完你會

- 把練習專案跑起來，玩壞了知道怎麼重來
- 知道範例資料長什麼樣子
- 會用兩種方法看 EF Core 送出的 SQL
- 會在 Rider 裡直接執行 SQL

## 跑起來

```bash
sqllocaldb info              # 應看到 MSSQLLocalDB
cd C:\Users\s9740\RiderProjects\DotNetLearning\ef-core\lab\EfCoreLab
dotnet run -- reset          # 建立資料庫 EfCoreLab 並放入範例資料
dotnet run -- L01            # 執行第 1 課
```

| 指令 | 做什麼 |
|------|-------|
| `dotnet run` | 用法與課程清單 |
| `dotnet run -- reset` | 重建資料庫 + 範例資料（玩壞了就重來） |
| `dotnet run -- L01` | 第 1 課範例 |
| `dotnet run -- L01 --ex` | 第 1 課練習解答 |
| `dotnet run -- L01 --log` | 另外印出 EF 實際執行的 SQL 紀錄 |

Rider：Run Configuration → Program arguments 填 `L01`。

每段範例會印出：你會寫的 SQL → LINQ → EF Core 產生的 SQL（`ToQueryString`）→ 結果表格。

## 範例資料

- 關聯：Blogs 1:1 BlogHeaders、Blogs 1:N Posts、Authors 1:N Posts（文章可無作者）、Posts N:N Tags（中間表 `PostTag`，欄位 `PostsPostId`、`TagsTagId`）

| 表 | 內容 | 特例 |
|----|-----|-----|
| Blogs | 1 devblog（Rating 5）、2 dotnet（4）、3 cooking | cooking 的 Rating 為 NULL、沒有頁首 |
| BlogHeaders | Dev 日誌（寫程式的日常）、.NET 筆記 | .NET 筆記的 Subtitle 為 NULL |
| Authors | 1 小明、2 小華、3 阿傑 | 小華沒 Email；阿傑沒寫文章 |
| Tags | efcore、csharp、sql、linq、cooking、docker | docker 沒有文章使用 |

| PostId | Title | Blog | Author | PublishedOn | Views | Tags |
|-------|-------|------|--------|-------------|-------|------|
| 1 | EF Core 入門 | 1 | 1 | 2026-01-05 | 120 | efcore, csharp |
| 2 | LINQ 基礎 | 1 | 1 | 2026-01-12 | 80 | csharp, linq |
| 3 | SQL JOIN 圖解 | 1 | 2 | 2026-02-01 | 200 | sql |
| 4 | 草稿：Include 心得 | 1 | 1 | 2026-02-10 | 0 | （無，Content 為 NULL） |
| 5 | C# 10 新功能 | 2 | 2 | 2026-01-20 | 150 | csharp |
| 6 | EF Core 效能調校 | 2 | 1 | 2026-02-15 | 300 | efcore, sql |
| 7 | AsNoTracking 何時用 | 2 | NULL | 2026-03-01 | 90 | efcore |
| 8 | SelectMany 範例 | 2 | 2 | 2026-03-05 | 60 | linq |
| 9 | 番茄炒蛋 | 3 | NULL | 2026-01-08 | 500 | cooking |
| 10 | 三杯雞 | 3 | NULL | 2026-02-20 | 420 | cooking |

## 兩種看 SQL 的方法

| | `ToQueryString()` | 記錄 `LogTo` |
|---|---|---|
| 做什麼 | 把一個查詢翻成 SQL 字串，**不執行** | 每次**真的送出** SQL 時印出（含耗時） |
| 用法 | `query.ToQueryString()` | `options.LogTo(Console.WriteLine, new[] { RelationalEventId.CommandExecuted })` |
| EfCoreLab | 每段範例預設印出 | 加 `--log` |
| 適合 | 確認某段 LINQ 的翻譯 | 抓出所有實際查詢（例如 N+1） |

ASP.NET Core 專案：`appsettings.Development.json` 的 `Microsoft.EntityFrameworkCore.Database.Command` 設 `Information`。

## 在 Rider 執行 SQL

1. Database 視窗 → `+` → Data Source → Microsoft SQL Server LocalDB
2. Instance `MSSQLLocalDB`、Windows 驗證、資料庫 `EfCoreLab`
3. 開 `Lessons/L01.sql`，選資料來源，游標放在 SQL 上按 `Ctrl+Enter`
4. 或對資料庫右鍵 → New → Query Console 自由輸入

## 練習

1. `reset` 後執行 `L01`，確認有 6 段範例
2. 執行 `SELECT * FROM Posts;`：10 筆，AuthorId 為 NULL 的是 7、9、10
3. 執行 `SELECT * FROM PostTag;`：多對多的中間表，每列代表「某文章有某標籤」（L10 詳述）

## 延伸閱讀

- [EF Core：Simple logging](https://learn.microsoft.com/ef/core/logging-events-diagnostics/simple-logging)

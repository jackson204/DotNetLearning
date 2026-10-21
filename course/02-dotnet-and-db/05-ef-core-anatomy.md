# EF Core 的組成

<!-- meta:start -->
Part 2　.NET 怎麼跟資料庫說話　·　單元 2-05　·　約 15 分鐘
<!-- meta:end -->

## 學完你會

- 畫出 EF Core 的分層：你的程式 → EF Core 核心 → Provider → ADO.NET → 資料庫
- 說出每一層負責什麼，哪些是 ORM、哪些不是
- 認得 EF Core 的幾個核心名詞：DbContext、DbSet、Model、Change Tracker、Provider
- 知道要裝哪些 NuGet 套件、它們之間的關係

## 情境

[2-04](04-why-orm.md) 決定用 EF Core。它說起來是「一個 ORM」，實際上是好幾個零件疊在一起。把 [2-01](01-dotnet-and-database.md) 的圖放大，看 EF Core 插在你的程式和驅動程式之間做了哪些事。

## 分層架構

![EF Core 分層架構](../images/efcore-layers.svg)

*圖 1　EF Core 分層架構：紫色實線框內才是 ORM（EF Core 核心 + Provider）；上面是使用它的程式，下面是它呼叫的 ADO.NET*

| 層 | 負責什麼 | 是不是 ORM |
|---|---|---|
| **你的 ASP.NET Core 程式** | API 端點、Entity class、寫 LINQ、呼叫 `SaveChanges()` | 不是，它是**使用** ORM 的一方 |
| **EF Core 核心** | 對映（class ↔ 表）、LINQ 轉譯、Change Tracker、實體化 | 是 |
| **Database Provider** | EF Core 的外掛，負責「某一種資料庫」的 SQL 寫法與型別對應 | 是（EF Core 的一部分） |
| **ADO.NET** | 依連線字串連線、送出 SQL、讀取結果表 | 不是，它是底層驅動，沒有 EF Core 也能單獨用（[2-02](02-ado-net.md)） |
| **SQL Server** | 執行 SQL、保存資料 | 不是 |

> [!TIP]
> **整張圖都是 ORM 嗎？不是**
>
> ORM 只有中間框起來的部分：EF Core 核心負責對映、轉譯、追蹤變更；Provider 負責某一種資料庫的 SQL 方言。最上層是使用 ORM 的你的程式；ADO.NET 只會送 SQL、收結果表，不認識你的 class。一句話：**ORM 夾在你的程式和 ADO.NET 中間做翻譯，最後還是叫 ADO.NET 去跟資料庫說話。**

## EF Core 核心裡的零件

| 零件 | 做什麼 | 在哪學 |
|---|---|---|
| **DbContext / DbSet\<T\>** | 入口與一次工作階段；`DbSet<Post>` 代表 `Posts` 表 | [2-06](06-dbcontext.md) |
| **Model（模型）** | Entity class + `OnModelCreating` 的設定，描述 class ↔ 資料表的對映：哪個屬性是主鍵、欄位多長、表跟表怎麼關聯 | [2-07](07-mapping.md)、[3-10](../03-linq/10-relationships.md) |
| **LINQ 轉譯** | 把你寫的 `Where(p => p.BlogId == 1)` 變成 SQL | [3-01](../03-linq/01-linq-to-sql.md) |
| **Change Tracker** | 記住查出來的物件和原始值，`SaveChanges()` 時比對出要送哪些 INSERT / UPDATE / DELETE | [3-08](../03-linq/08-change-tracker.md) |
| **實體化（Materialization）** | 把結果表的每一列變成一個物件 | [3-01](../03-linq/01-linq-to-sql.md) |
| **Migration** | 比對 class 的變化，產生建表 / 改表的程式碼 | [5-04](../05-project/04-scaffold.md) |

## Provider：換資料庫就是換這一塊

EF Core 核心不知道 SQL Server 和 PostgreSQL 的 SQL 哪裡不一樣，這些差異都在 Provider 裡。常見的 Provider：

| 資料庫 | NuGet 套件 | 註冊方式 |
|---|---|---|
| SQL Server / LocalDB / Azure SQL | `Microsoft.EntityFrameworkCore.SqlServer` | `UseSqlServer(...)` |
| PostgreSQL | `Npgsql.EntityFrameworkCore.PostgreSQL` | `UseNpgsql(...)` |
| SQLite | `Microsoft.EntityFrameworkCore.Sqlite` | `UseSqlite(...)` |
| MySQL / MariaDB | `Pomelo.EntityFrameworkCore.MySql` | `UseMySql(...)` |
| 記憶體（測試用） | `Microsoft.EntityFrameworkCore.InMemory` | `UseInMemoryDatabase(...)` |

同一段 LINQ，換 Provider 會產生不同方言的 SQL：SQL Server 的 `SELECT TOP(1)`，PostgreSQL 是 `LIMIT 1`。你的 C# 程式一行都不用改。

## 要裝哪些套件

| 套件 | 用途 | 什麼時候裝 |
|---|---|---|
| `Microsoft.EntityFrameworkCore.SqlServer` | SQL Server 的 Provider；會**自動帶入** EF Core 核心（`Microsoft.EntityFrameworkCore`）和驅動程式（`Microsoft.Data.SqlClient`） | 一定要 |
| `Microsoft.EntityFrameworkCore.Design` | 讓 `dotnet ef` 指令能讀取專案、產生 Migration | 要用 Migration 時（[5-04](../05-project/04-scaffold.md)） |
| `dotnet-ef`（全域工具，不是套件） | `dotnet ef migrations add` 這類指令 | 同上 |

版本原則：EF Core 的主版號跟 .NET 一致（.NET 10 配 EF Core 10），三個東西的主版號要一樣，否則 `dotnet ef` 會抱怨版本不符。

## 動手

```bash
cd lab/EfCoreLab
dotnet list package --include-transitive
```

輸出會列出專案直接引用的 `Microsoft.EntityFrameworkCore.SqlServer`，以及它帶進來的相依套件：找找看 `Microsoft.EntityFrameworkCore`（核心）、`Microsoft.EntityFrameworkCore.Relational`（關聯式資料庫共用的部分）、`Microsoft.Data.SqlClient`（ADO.NET 驅動）。這三個名字就是分層圖上的三層。

再打開 `Data/LabContext.cs`，`UseSqlServer(...)` 那一行就是在指定 Provider。

## 常見的坑

> [!WARNING]
> **把 Provider 當成資料庫驅動**
>
> Provider（`Microsoft.EntityFrameworkCore.SqlServer`）是 EF Core 的外掛，它底下還有真正的驅動程式（`Microsoft.Data.SqlClient`）。連線字串的錯、憑證的錯，錯誤訊息多半來自驅動程式那一層。

> [!WARNING]
> **套件版本不一致**
>
> `Microsoft.EntityFrameworkCore.SqlServer` 10.x 配 `Microsoft.EntityFrameworkCore.Design` 8.x，或 `dotnet-ef` 工具是 9.x，都會出錯：`The Entity Framework tools version 'X' is older than that of the runtime 'Y'`。三者主版號對齊。

> [!WARNING]
> **用 InMemory Provider 測試關聯式資料庫的行為**
>
> InMemory 不是關聯式資料庫：沒有外鍵、沒有交易、SQL 方言也不一樣，很多在 SQL Server 會失敗的查詢它會過。測試要接近真實，用 SQLite 或真的 SQL Server。

## 小練習

**練習 1**　下面四件事各發生在哪一層？（a）把 `p.Title.Length` 翻成 `LEN([p].[Title])`；（b）開連線、送出 SQL 文字；（c）記住 `post.Title` 原本的值；（d）執行 SQL 並回傳結果表。

<details>
<summary>看答案</summary>

（a）Provider（SQL Server 方言的函式名稱由它決定）；（b）ADO.NET；（c）EF Core 核心的 Change Tracker；（d）SQL Server。

</details>

**練習 2**　專案要從 SQL Server 換成 PostgreSQL，要改哪些東西？

<details>
<summary>看答案</summary>

換 Provider 套件（`Npgsql.EntityFrameworkCore.PostgreSQL`）、把 `UseSqlServer` 改成 `UseNpgsql`、換連線字串、重新產生 Migration。Entity、DbContext 的 DbSet、所有 LINQ 都不用動。

</details>

**練習 3**　為什麼說「EF Core 本身不會送 SQL」？

<details>
<summary>看答案</summary>

EF Core 核心只負責產生 SQL 文字和管理物件；真正開連線、送出文字、收回結果表的是 ADO.NET（`Microsoft.Data.SqlClient`）。EF Core 是它的使用者。

</details>

## 延伸閱讀

- [EF Core 的資料庫 Provider 一覽（Microsoft Learn）](https://learn.microsoft.com/ef/core/providers/)
- [EF Core 概觀](https://learn.microsoft.com/ef/core/)

> **下一個問題**：零件都認識了。寫程式時第一個會碰到的是 DbContext，它到底是什麼、怎麼設定？

<!-- nav:start -->
---
← 上一課：[為什麼需要 ORM](04-why-orm.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[DbContext 與 DbSet](06-dbcontext.md) →
<!-- nav:end -->

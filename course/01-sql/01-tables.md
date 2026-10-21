# 資料表長什麼樣

<!-- meta:start -->
Part 1　資料庫與 SQL　·　單元 1-01　·　約 15 分鐘
<!-- meta:end -->

## 學完你會

- 說出為什麼資料要存在資料庫，而不是程式的變數或檔案裡
- 看懂一張資料表：列、欄、資料型別
- 知道主鍵（Primary Key）和 NULL 是什麼
- 在 Rider 裡打開練習專案的資料表，看到實際的資料

## 情境

回到 [0-01](../00-overview/01-how-web-api-works.md) 的任務：主管明天發一篇文章，**後天再打開，那篇文章必須還在**。先試最直覺的做法，看看哪裡不夠用。

### 嘗試一：放在程式的變數裡

用最少的程式碼做出「發文」和「看文章」兩支 API：

```csharp
var posts = new List<Post>();                 // 一個放在記憶體裡的清單

app.MapPost("/posts", (Post post) =>           // 收到 POST /posts 時執行
{
    posts.Add(post);                           // 把前端送來的文章加進清單
    return Results.Ok();
});

app.MapGet("/posts", () => posts);             // 收到 GET /posts 時，回傳整個清單
```

可以運作，但 `posts` 存在**記憶體**裡。程式一重啟（重新部署、伺服器重開機、當機），文章就全部消失。不符合「後天還要在」。

### 嘗試二：存成檔案

每次發文就把整個清單寫進 `posts.json`。重啟後資料還在，但很快會遇到新問題：

- **同時寫入**：兩個人同時發文，後寫的覆蓋先寫的，有一篇不見了。
- **查詢很慢**：「找出標籤是 efcore 的文章」要把整個檔案讀進來一筆一筆比對，資料量一大就撐不住。
- **寫到一半當機**：檔案只寫了一半，整份 JSON 壞掉，所有資料都讀不出來。
- **資料之間的關係**：文章屬於哪個部落格、標籤被哪些文章使用，要自己維護、自己保證一致。

### 結論：交給資料庫

上面這些問題（保存、同時存取、快速查詢、不會寫一半、維護關係）正是**資料庫**專門解決的事。

| 需要的能力 | 記憶體變數 | JSON 檔案 | 關聯式資料庫 |
|---|---|---|---|
| 重啟後資料還在 | ✗ | ✓ | ✓ |
| 多人同時寫入 | ✗ | ✗ 會互相覆蓋 | ✓ 鎖定機制 |
| 大量資料中快速查詢 | — | ✗ 全部讀進來比對 | ✓ 索引 |
| 寫到一半失敗不會壞掉 | — | ✗ | ✓ 交易（Transaction） |
| 保證資料之間的關係正確 | ✗ | ✗ | ✓ 外鍵（Foreign Key） |

這套課程用的資料庫是 **SQL Server**（開發時用免安裝設定的 LocalDB 版本），它是「關聯式資料庫」的一種，其他常見的還有 PostgreSQL、MySQL、SQLite。後面學的 SQL 在這些資料庫上大同小異。

## 資料表：列與欄

關聯式資料庫用**資料表（Table）**存資料，長得像試算表：每一**列（row）**是一筆資料，每一**欄（column）**是一個欄位。練習專案裡的 `Posts` 表長這樣：

| PostId | Title | Content | PublishedOn | Views | BlogId | AuthorId |
|---|---|---|---|---|---|---|
| 1 | EF Core 入門 | 從 DbContext 開始認識 EF Core | 2026-01-05 | 120 | 1 | 1 |
| 2 | LINQ 基礎 | Where、Select、OrderBy | 2026-01-12 | 80 | 1 | 1 |
| 4 | 草稿：Include 心得 | NULL | 2026-02-10 | 0 | 1 | 1 |
| 7 | AsNoTracking 何時用 | 唯讀查詢的最佳化 | 2026-03-01 | 90 | 2 | NULL |

跟試算表不一樣的地方：

- **每一欄有固定的資料型別**：`Views` 只能放整數，`PublishedOn` 只能放日期。放錯型別資料庫會拒絕，這是它幫你守住的第一道關。
- **每一列長得一樣**：不能某一列多一個欄位。要加欄位得改資料表的定義（後面學 Migration 時會做）。
- **列沒有固定順序**：資料庫不保證你拿回來的順序跟放進去的一樣（下一課會親眼看到）。

### 資料型別

欄位的型別決定能放什麼、佔多少空間。SQL Server 常見的型別和 C# 的對應：

| SQL Server 型別 | 放什麼 | 對應的 C# 型別 | 例子 |
|---|---|---|---|
| `int` | 整數（約 ±21 億） | `int` | `Views`、`BlogId` |
| `bigint` | 更大的整數 | `long` | 流水號很大的表 |
| `nvarchar(200)` | 最多 200 個字的文字（支援中文） | `string` | `Title` |
| `nvarchar(max)` | 不限長度的文字 | `string` | `Content` |
| `bit` | 是 / 否 | `bool` | `IsPublished` |
| `date` | 日期（不含時間） | `DateOnly` 或 `DateTime` | `PublishedOn` |
| `datetime2` | 日期 + 時間 | `DateTime` | `CreatedAt` |
| `decimal(18,2)` | 有小數的數字（金額） | `decimal` | `Price` |
| `uniqueidentifier` | GUID | `Guid` | 不想被猜到的 Id |

> [!TIP]
> **文字欄位盡量給長度**
>
> `nvarchar(200)` 比 `nvarchar(max)` 省空間、能建索引、也等於替「標題最多 200 字」這條規則加了一道保險。只有真的不限長度的內容（文章本文）才用 `max`。

## 主鍵：每一列的身分證

`PostId` 這一欄是 `Posts` 表的**主鍵（Primary Key）**。主鍵有三個特性：

1. **唯一**：不會有兩列的主鍵一樣，所以「第 7 篇文章」指的一定是同一列。
2. **不能是 NULL**：每一列都一定有主鍵。
3. **通常由資料庫自動產生**：`int` 主鍵設成 `IDENTITY`（自動遞增），新增一列就自動拿到下一個號碼，程式不用自己編號。

別的表要「指向」這一列時，存的就是主鍵的值：`Posts.BlogId = 1` 的意思是「這篇文章屬於 `Blogs` 表裡 `BlogId = 1` 那一列」。這叫**外鍵（Foreign Key）**，[1-06](06-relationships.md) 會專門講。

> [!NOTE]
> **主鍵要用沒有意義的流水號**
>
> 用 Email、網址這種「有意義的資料」當主鍵，哪天使用者換 Email，所有指向它的外鍵都要跟著改。流水號（或 GUID）永遠不會變，才適合當身分證。

## NULL：這一格沒有值

`Content` 是 `NULL` 代表「沒有內容」，`AuthorId` 是 `NULL` 代表「沒有作者」。NULL 不是 0、不是空字串、不是「NULL」這個字，它是**沒有值**。

- 建表時可以規定哪些欄位**允許 NULL**：`Title` 不允許（文章一定要有標題），`Content` 允許（草稿可以先沒內容）。
- 判斷 NULL 要用專門的寫法 `IS NULL`，不能寫 `= NULL`（[1-03](03-where.md) 會講為什麼）。
- 在 C# 裡，允許 NULL 的欄位對應到 `int?`、`string?` 這種可為 null 的型別（[2-03](../02-dotnet-and-db/03-why-class.md) 會講）。

練習專案故意放了這些 NULL：第 3 個部落格沒有評分（`Rating`）、小華沒有 Email、三篇文章沒有作者、一篇草稿沒有內容。之後學篩選、JOIN 的時候就靠它們看出差別。

## 一個資料庫有很多張表

部落格平台的資料不會全塞在一張表裡。練習專案有五張表：

| 資料表 | 存什麼 | 主鍵 |
|---|---|---|
| `Blogs` | 部落格（網址、評分） | `BlogId` |
| `BlogHeaders` | 部落格的頁首設定（標題、副標） | `BlogHeaderId` |
| `Authors` | 作者（名字、Email） | `AuthorId` |
| `Posts` | 文章 | `PostId` |
| `Tags` | 標籤 | `TagId` |

為什麼要拆成好幾張、表和表之間怎麼連起來，是 [1-06](06-relationships.md) 的主題。現在只要知道：**一張表存一種東西**，用主鍵和外鍵互相指來指去。

## 動手

1. 照 [0-02](../00-overview/02-lab-setup.md) 把練習專案的資料庫建好，在 Rider 的 **Database** 視窗連上 `EfCoreLab`。
2. 展開 `EfCoreLab` → `tables`，看到五張表。對 `Posts` 按兩下，會列出所有資料，試著找出哪幾列有 NULL。
3. 展開 `Posts` → `columns`，看每個欄位的型別：`Title` 是 `nvarchar(200)`，`Content` 是 `nvarchar(max)`，`PublishedOn` 是 `date`。
4. 展開 `keys`，看到主鍵 `PK_Posts` 在 `PostId` 上。

> [!NOTE]
> 這些表是練習專案用 EF Core 從 C# class 建出來的。現在先把它們當成「已經存在的資料庫」來學 SQL，Part 2 會回頭講 class 怎麼變成表。

## 常見的坑

> [!WARNING]
> **把日期、數字存成文字**
>
> `"2026-1-5"`、`"2026/01/05"` 存在 `nvarchar` 裡，排序和比較都會出錯（文字是一個字一個字比）。日期用 `date` / `datetime2`、數字用 `int` / `decimal`，讓資料庫幫你守型別。

> [!WARNING]
> **用 0 或空字串代表「沒有」**
>
> 「評分 0 分」和「還沒有人評分」是兩回事。沒有值就用 NULL，之後統計平均分數時才不會被 0 拉低。

## 小練習

**練習 1**　在 Rider 打開 `Blogs` 表，哪一個部落格的 `Rating` 是 NULL？它代表什麼意思？

<details>
<summary>看答案</summary>

`BlogId = 3`（cooking.example.com）。代表這個部落格**還沒有評分**，不是 0 分。

</details>

**練習 2**　`Tags` 表的主鍵是哪一欄？一共有幾列？

<details>
<summary>看答案</summary>

主鍵是 `TagId`，共 6 列：efcore、csharp、sql、linq、cooking、docker。

</details>

**練習 3**　如果要替文章新增「是否置頂」和「最後修改時間」兩個欄位，各該用什麼型別？允許 NULL 嗎？

<details>
<summary>看答案</summary>

- 是否置頂：`bit`，不允許 NULL（預設 0）。每篇文章都一定有「是 / 否」。
- 最後修改時間：`datetime2`，允許 NULL。還沒修改過的文章就是 NULL，比填一個假時間誠實。

</details>

## 延伸閱讀

- [SQL Server 資料型別一覽（Microsoft Learn）](https://learn.microsoft.com/sql/t-sql/data-types/data-types-transact-sql)
- [Microsoft Learn：使用 Transact-SQL 查詢與修改資料](https://learn.microsoft.com/training/paths/get-started-querying-with-transact-sql/)（第一個模組介紹關聯式資料庫的基本概念）

> **下一個問題**：資料已經在表裡了，要怎麼跟資料庫說「把它們給我」？

<!-- nav:start -->
---
← 上一課：[練習環境：EfCoreLab](../00-overview/02-lab-setup.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[SELECT：取資料](02-select.md) →
<!-- nav:end -->

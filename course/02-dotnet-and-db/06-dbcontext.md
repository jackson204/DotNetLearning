# DbContext 與 DbSet

<!-- meta:start -->
Part 2　.NET 怎麼跟資料庫說話　·　單元 2-06　·　約 20 分鐘
<!-- meta:end -->

## 學完你會

- 說出 `DbContext` 在程式裡扮演什麼角色、`DbSet<T>` 代表什麼
- 寫出一個最小的 DbContext，告訴 EF Core 資料庫在哪、有哪些表
- 分清楚兩種設定方式：`OnConfiguring`（練習專案）和 `AddDbContext`（Web API）
- 看懂連線字串的每一段，知道它該放在哪裡

## 情境

[2-05](05-ef-core-anatomy.md) 說 EF Core 夾在你的程式和 ADO.NET 中間做翻譯。決定用它之後，第一件事是告訴它兩件事：**資料庫在哪裡**、**有哪些資料表**。這兩件事都寫在一個 class 裡，它就是 `DbContext`。

## DbContext：一次工作階段

`DbContext` 是你跟資料庫打交道的**入口**，一個 DbContext 物件代表**一次工作階段**（Unit of Work）：

| 它負責 | 說明 |
|---|---|
| 查詢入口 | `db.Posts.Where(...)` 從這裡開始寫 LINQ |
| 追蹤變更 | 記住從它查出來的物件，你改了什麼它都知道（[3-08](../03-linq/08-change-tracker.md)） |
| 一次寫入 | `SaveChanges()` 把這次工作階段累積的新增、修改、刪除，用一個交易送出 |
| 管理連線 | 什麼時候開連線、關連線，由它決定；你不用碰 `SqlConnection` |

「一次工作階段」通常很短：Web API 是**一個 HTTP 請求一個 DbContext**，請求結束就丟掉；主控台程式是一個工作一個。

## DbSet：一張表

DbContext 上每個 `DbSet<T>` 屬性代表一張資料表，`T` 是這張表的 Entity：

```csharp
public DbSet<Blog> Blogs => Set<Blog>();     // Blogs 表，每一列是一個 Blog
public DbSet<Post> Posts => Set<Post>();     // Posts 表
```

`db.Blogs` 讀起來就像「資料庫裡的 Blogs 表」：對它寫 LINQ 就是查詢，`db.Blogs.Add(blog)` 就是準備新增一列。

> [!NOTE]
> **兩種宣告寫法**
>
> 官方文件常見 `public DbSet<Blog> Blogs { get; set; }`，在 Nullable 開啟時會有 CS8618 警告；寫成 `=> Set<Blog>()` 沒有這個問題，兩種功能一樣。

## 最小的 DbContext

練習專案 `lab/EfCoreLab/Data/LabContext.cs` 的骨架（去掉細節）：

```csharp
using Microsoft.EntityFrameworkCore;

public class LabContext : DbContext
{
    public const string ConnectionString =
        "Server=(localdb)\\mssqllocaldb;Database=EfCoreLab;Trusted_Connection=True;TrustServerCertificate=True;";

    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlServer(ConnectionString);     // 用哪種資料庫、在哪裡
    }
}
```

三個部分：

1. **繼承 `DbContext`**：這樣它才有 `SaveChanges()`、`Database`、變更追蹤這些能力。
2. **`DbSet<T>`**：有哪些表。
3. **`OnConfiguring`**：用哪個 Provider（`UseSqlServer`）、連線字串是什麼。

用的時候：

```csharp
using var db = new LabContext();        // 開始一次工作階段
var blogs = db.Blogs.ToList();          // 查詢
// using 結束時自動 Dispose：連線歸還、追蹤的物件釋放
```

## 連線字串

`Server=(localdb)\mssqllocaldb;Database=EfCoreLab;Trusted_Connection=True;TrustServerCertificate=True;` 是用分號分隔的一串設定：

| 段落 | 意思 | 其他常見的值 |
|---|---|---|
| `Server=(localdb)\mssqllocaldb` | 資料庫在哪台機器、哪個執行個體 | `Server=localhost,1433`（Docker）、`Server=db.example.com` |
| `Database=EfCoreLab` | 用這台機器上的哪個資料庫 | — |
| `Trusted_Connection=True` | 用 Windows 帳號登入 | `User Id=sa;Password=…`（帳號密碼登入） |
| `TrustServerCertificate=True` | 信任伺服器的憑證（新版驅動程式預設要加密連線，LocalDB 沒有正式憑證） | 正式環境用真憑證，不加這段 |

> [!NOTE]
> **C# 字串裡的反斜線**
>
> `(localdb)\mssqllocaldb` 在 C# 一般字串要寫成 `\\`，在 JSON 檔也要 `\\`。寫錯會連不到資料庫，錯誤訊息是 `A network-related or instance-specific error occurred`。

## Web API 的寫法：AddDbContext

Web API 不會自己 `new LabContext()`，而是**註冊**給 ASP.NET Core，讓每個請求自動拿到一個：

**DbContext：改成從建構子接收設定**

```csharp
public class BloggingContext : DbContext
{
    public BloggingContext(DbContextOptions<BloggingContext> options) : base(options) { }

    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Post> Posts => Set<Post>();
}
```

**appsettings.json：連線字串放設定檔**

```json
{
  "ConnectionStrings": {
    "BloggingDb": "Server=(localdb)\\mssqllocaldb;Database=Blogging;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Program.cs：註冊**

```csharp
builder.Services.AddDbContext<BloggingContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BloggingDb")));
```

之後 API 的函式只要宣告參數 `BloggingContext db`，ASP.NET Core 就會給你一個（這叫依賴注入，[4-07](../04-web-api/07-di.md) 會講）。

| | `OnConfiguring` | `AddDbContext` |
|---|---|---|
| 連線字串在哪 | 寫死在 DbContext 裡 | 設定檔，可依環境切換 |
| 誰建立 DbContext | 你自己 `new` | 框架依請求建立、結束時 Dispose |
| 適合 | 主控台、練習、小工具 | Web API、任何用 DI 的專案 |

> [!TIP]
> **建構子接收 options 的好處**
>
> 連線字串和使用哪個資料庫由外部決定，DbContext 本身不寫死。測試時可以換成 SQLite in-memory，正式環境換成另一台伺服器，DbContext 一行都不用改。

## 動手

1. 打開 `lab/EfCoreLab/Data/LabContext.cs`，找到 `OnConfiguring`、五個 `DbSet`、連線字串。
2. 執行 `dotnet run -- linq-select --log`，輸出裡的 `Executed DbCommand` 就是這個 DbContext 透過 Provider 和 ADO.NET 送出的 SQL。
3. 把連線字串的 `Database=EfCoreLab` 改成 `Database=EfCoreLab2`，執行 `dotnet run -- linq-select`：程式會自動建立一個新的空資料庫（練習專案用 `EnsureCreated`），觀察後改回來，並在 Rider 的 Database 視窗把 `EfCoreLab2` 刪掉。

## 常見的坑

> [!WARNING]
> **一個 DbContext 用很久、或多個執行緒共用**
>
> DbContext 不是 thread-safe，也會把查過的物件都記在記憶體裡。做成 `static` 全域共用、或註冊成 Singleton，會遇到「A second operation was started on this context」和記憶體一直漲。原則：**短命、一次工作一個**。

> [!WARNING]
> **連線字串含密碼卻 commit 進 git**
>
> `appsettings.json` 會被 commit。含密碼的連線字串開發時放 User Secrets（`dotnet user-secrets set "ConnectionStrings:BloggingDb" "…"`），正式環境放環境變數（[4-08](../04-web-api/08-config-logging.md)）。

> [!WARNING]
> **憑證錯誤**
>
> 看到 `The certificate chain was issued by an authority that is not trusted`，是新版 `Microsoft.Data.SqlClient` 預設加密連線，但本機 LocalDB / Docker 沒有正式憑證。開發環境加 `TrustServerCertificate=True`，正式環境要用真憑證。

## 小練習

**練習 1**　替部落格平台寫一個 `BloggingContext`，有 `Blogs`、`Posts`、`Tags` 三個 DbSet，連線字串從建構子接收。

<details>
<summary>看答案</summary>

```csharp
using Microsoft.EntityFrameworkCore;

public class BloggingContext : DbContext
{
    public BloggingContext(DbContextOptions<BloggingContext> options) : base(options) { }

    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Tag> Tags => Set<Tag>();
}
```

</details>

**練習 2**　資料庫改成跑在 Docker 的 SQL Server（port 1433、帳號 `sa`、密碼 `P@ssw0rd`），連線字串怎麼寫？

<details>
<summary>看答案</summary>

`Server=localhost,1433;Database=Blogging;User Id=sa;Password=P@ssw0rd;TrustServerCertificate=True;`

密碼不要寫進 `appsettings.json`，用 User Secrets 或環境變數。

</details>

**練習 3**　為什麼 Web API 要「一個請求一個 DbContext」，而不是整個程式共用一個？

<details>
<summary>看答案</summary>

兩個原因：DbContext 不是 thread-safe，多個請求同時用會出錯；它會追蹤查過的所有物件，共用一個會越來越肥、也會讓某個請求看到別的請求改到一半的狀態。請求結束就丟掉，乾淨又安全。

</details>

## 延伸閱讀

- [EF Core：DbContext 設定與初始化（Microsoft Learn）](https://learn.microsoft.com/ef/core/dbcontext-configuration/)
- [EF Core：連線字串](https://learn.microsoft.com/ef/core/miscellaneous/connection-strings)

> **下一個問題**：DbContext 知道有哪些表了，但它怎麼知道 class 的每個屬性對應哪個欄位、哪個屬性是主鍵、`Title` 最多幾個字？

<!-- nav:start -->
---
← 上一課：[EF Core 的組成](05-ef-core-anatomy.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[class 怎麼對應到資料表](07-mapping.md) →
<!-- nav:end -->

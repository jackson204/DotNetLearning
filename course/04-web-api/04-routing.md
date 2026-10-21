# Minimal API 與路由

<!-- meta:start -->
Part 4　ASP.NET Core Web API　·　單元 4-04　·　約 20 分鐘
<!-- meta:end -->

## 學完你會

- 分清楚 ASP.NET Core 寫 API 的兩種風格：Minimal API 與 Controller
- 用 `MapGet` / `MapPost` / `MapPut` / `MapDelete` 定義端點
- 看懂路由：路徑、路由參數 `{id}`、參數限制 `{id:int}`、查詢字串
- 用 `MapGroup` 把同一組端點整理在一起
- 知道函式的參數從哪裡來、回傳值怎麼變成回應（細節在 4-05、4-06）

## 情境

[4-01](01-http.md) 看到前端送來 `GET /blogs/1/posts`。後端收到這行文字後，要找出「哪段程式負責這個方法 + 這個路徑」。這個對應過程叫**路由（Routing）**，而寫下「這個路徑由這段程式處理」的方式，就是 Minimal API。

## 兩種風格

ASP.NET Core 寫 Web API 有兩種風格：

| | Minimal API | Controller |
|---|---|---|
| 推出 | .NET 6（2021） | ASP.NET Core 一開始就有 |
| 寫在哪 | 直接寫在 `Program.cs`，或用擴充方法拆到別的檔案 | 另外建 `Controllers/XxxController.cs` 類別 |
| 樣子 | `app.MapGet("/posts", …)` 一行一支端點 | 類別 + 方法 + `[HttpGet]` 等屬性標註 |
| 適合 | 小型服務、學習、範例、微服務 | 大型專案、API 很多需要分類管理、需要 MVC 的篩選器 |

兩者底層相同，能力也幾乎一樣，只是寫法不同。這套課程用 Minimal API（程式碼最短、最接近 HTTP 本身），最後會給 Controller 的對照，學會一種另一種很快就看得懂。

## 基本結構：方法 + 路徑 + 函式

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/posts", () => "所有文章");              // GET  /posts
app.MapGet("/posts/{id}", (int id) => $"文章 {id}");  // GET  /posts/5
app.MapPost("/posts", (Post post) => "已新增");       // POST /posts
app.MapPut("/posts/{id}", (int id, Post post) => "已修改");
app.MapDelete("/posts/{id}", (int id) => "已刪除");

app.Run();
```

記住一句話：**`app.MapXxx(路徑, 函式)` ＝「有人用 Xxx 方法呼叫這個路徑時，執行這個函式」**。函式回傳什麼，就變成 Response 的 Body。

## 路由：路徑怎麼對應

### 路由參數

路徑裡用 `{ }` 包起來的是**路由參數**，請求進來時那一段會被取出來，傳給同名的函式參數：

```csharp
app.MapGet("/blogs/{blogId}/posts/{postId}", (int blogId, int postId) => ...);
// GET /blogs/1/posts/5  →  blogId = 1, postId = 5
```

### 參數限制

在參數後面加 `:型別`，只有符合的請求才會進來，不符合直接回 `404`：

```csharp
app.MapGet("/posts/{id:int}", (int id) => ...);   // /posts/abc → 404，函式不會執行
```

| 限制 | 例子 | 意思 |
|---|---|---|
| `{id:int}` | `/posts/5` | 必須是整數 |
| `{id:guid}` | `/users/3f2…` | 必須是 GUID |
| `{name:alpha}` | `/tags/efcore` | 只能是字母 |
| `{page:int:min(1)}` | `/posts?page=…` | 整數且 ≥ 1（限制可以疊） |

### 查詢字串

路徑沒有 `{ }` 的函式參數，會自動從查詢字串找：

```csharp
app.MapGet("/blogs/{blogId:int}/posts", (int blogId, int page = 1, int pageSize = 10) => ...);
// GET /blogs/1/posts?page=2&pageSize=5  →  blogId = 1, page = 2, pageSize = 5
// GET /blogs/1/posts                     →  page 和 pageSize 用預設值
```

### 路徑怎麼設計

照「資源」來命名，用名詞、複數、小寫，動作交給 HTTP 方法：

| 想做的事 | 路徑 | 不要這樣 |
|---|---|---|
| 某部落格的文章 | `GET /blogs/1/posts` | `GET /getPostsByBlog?id=1` |
| 新增文章 | `POST /blogs/1/posts` | `POST /createPost` |
| 單篇文章 | `GET /posts/5` | `GET /post?id=5` |
| 依標籤查 | `GET /tags/efcore/posts` 或 `GET /posts?tag=efcore` | `GET /searchPostsByTag/efcore` |

「層級」表達從屬關係：`/blogs/1/posts` 是部落格 1 底下的文章。但不要疊太深，`/posts/5` 比 `/blogs/1/posts/5` 好用（文章編號已經是唯一的）。

## MapGroup：把一組端點放在一起

同一個資源的端點通常有共同的前綴，用 `MapGroup` 寫一次就好：

```csharp
var blogs = app.MapGroup("/blogs");

blogs.MapGet("/", async (BloggingContext db) => ...);               // GET    /blogs
blogs.MapGet("/{id:int}", async (int id, BloggingContext db) => ...); // GET    /blogs/5
blogs.MapPost("/", async (CreateBlogRequest req, BloggingContext db) => ...); // POST /blogs
blogs.MapDelete("/{id:int}", async (int id, BloggingContext db) => ...);      // DELETE /blogs/5
```

Group 上還可以統一加設定（例如 OpenAPI 的標籤、授權），之後端點多了再把每個 group 搬到自己的檔案（[4-09](09-dto-layers.md)）。

## 函式的參數從哪來

ASP.NET Core 會依參數的型別和名稱，自動從請求裡找值（**Model Binding**，[4-05](05-binding-json-validation.md) 詳講）：

| 參數長這樣 | 值從哪來 | 例子 |
|---|---|---|
| `int id`，且路徑有 `{id}` | 路由參數 | `GET /posts/5` → `id = 5` |
| `int page`，路徑沒有 `{page}` | 查詢字串 | `GET /posts?page=2` → `page = 2` |
| `Post post`（自訂類別） | Request Body 的 JSON | `{"title":"…"}` → `post.Title` |
| `BloggingContext db`（已註冊的服務） | 依賴注入（[4-07](07-di.md)） | `AddDbContext` 註冊後直接當參數 |

## 回傳什麼

| 回傳 | 狀態碼 | 說明 |
|---|---|---|
| 字串或物件 | `200` | 物件自動轉成 JSON |
| `Results.Ok(資料)` / `TypedResults.Ok(資料)` | `200` | 成功 |
| `Results.Created(網址, 資料)` | `201` | 新增成功 |
| `Results.NoContent()` | `204` | 成功但沒內容 |
| `Results.BadRequest(…)` | `400` | 輸入有誤 |
| `Results.NotFound()` | `404` | 找不到 |
| `Results.Conflict(…)` | `409` | 衝突 |

`Results` 和 `TypedResults` 功能一樣，`TypedResults` 多了型別資訊，OpenAPI 文件會更準確；[4-06](06-responses.md) 詳講。

## 同一支 API，兩種寫法對照

**Minimal API（`Program.cs`）**

```csharp
app.MapGet("/posts/{id:int}", async (int id, BloggingContext db) =>
{
    var post = await db.Posts.FindAsync(id);
    return post is null ? Results.NotFound() : Results.Ok(post);
});
```

**Controller（`Controllers/PostsController.cs`）**

```csharp
[ApiController]
[Route("posts")]
public class PostsController : ControllerBase
{
    private readonly BloggingContext _db;
    public PostsController(BloggingContext db) => _db = db;

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var post = await _db.Posts.FindAsync(id);
        return post is null ? NotFound() : Ok(post);
    }
}
```

對照著看：`MapGet("/posts/{id:int}")` ＝ `[Route("posts")]` + `[HttpGet("{id:int}")]`；Minimal API 把 DbContext 當參數，Controller 從建構子注入。裡面用 EF Core 的部分完全一樣。

## 動手

如果手邊有任何 ASP.NET Core 專案（例如 MyBoards），在 `Program.cs` 的 `var app = builder.Build();` 之後加：

```csharp
app.MapGet("/hello/{name}", (string name, int times = 1) =>
    string.Join(" ", Enumerable.Repeat($"Hello, {name}!", times)));
```

執行後用瀏覽器開 `http://localhost:<port>/hello/world?times=3`（port 看 `Properties/launchSettings.json`），再試 `/hello/world`（沒給 `times`）。還沒有專案的話，[4-02](02-startup.md) 會從零建一個。

## 常見的坑

> [!WARNING]
> **路由參數名稱和函式參數對不上**
>
> `MapGet("/posts/{postId}", (int id) => …)`：路徑叫 `postId`，參數叫 `id`，ASP.NET Core 找不到對應，會改去查詢字串找、找不到就回 `400`。兩邊名稱要一樣。

> [!WARNING]
> **兩個端點搶同一個路徑**
>
> `MapGet("/posts/{id}")` 和 `MapGet("/posts/latest")` 同時存在時，`/posts/latest` 會優先配給字面相同的那個（literal 優先），但如果參數加了 `{id:int}` 就不衝突：`latest` 不是整數。設計時固定路徑和參數路徑盡量不要長得一樣。

> [!WARNING]
> **路徑裡放動詞**
>
> `/getPosts`、`/deletePost/5` 把動作寫進路徑，方法反而都用 GET。動作交給方法（GET / POST / DELETE），路徑只放資源。

## 小練習

**練習 1**　替 [5-01](../05-project/01-requirements.md) 的 R7（某部落格的文章列表，可分頁）和 R10（依標籤查文章）設計路徑與方法，並寫出函式的參數宣告。

<details>
<summary>看答案</summary>

```csharp
// R7
app.MapGet("/blogs/{blogId:int}/posts", (int blogId, int page = 1, int pageSize = 10, BloggingContext db) => ...);
// R10
app.MapGet("/tags/{name}/posts", (string name, BloggingContext db) => ...);
```

`page`、`pageSize` 不在路徑裡，所以從查詢字串來：`GET /blogs/1/posts?page=2`。

</details>

**練習 2**　`app.MapGet("/posts/{id:int}", …)` 收到 `GET /posts/abc` 會怎樣？收到 `GET /posts/5?draft=true` 呢？

<details>
<summary>看答案</summary>

`/posts/abc`：`abc` 不符合 `:int` 限制，路由直接回 `404`，函式不會執行。`/posts/5?draft=true`：正常進入，`id = 5`；`draft` 如果函式沒有這個參數就被忽略，有的話會收到 `true`。

</details>

**練習 3**　把下面的 Controller 改寫成 Minimal API。

```csharp
[ApiController]
[Route("tags")]
public class TagsController : ControllerBase
{
    [HttpGet]
    public IActionResult List() => Ok(new[] { "efcore", "sql" });
}
```

<details>
<summary>看答案</summary>

```csharp
app.MapGet("/tags", () => Results.Ok(new[] { "efcore", "sql" }));
```

</details>

## 延伸閱讀

- [Minimal API 概觀（Microsoft Learn）](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis)
- [教學課程：使用 ASP.NET Core 建立最小 API](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api)：從零做一個待辦清單 API，約 30 分鐘

> **下一個問題**：`(Post post)` 這個參數，ASP.NET Core 是怎麼把一段 JSON 文字變成 C# 物件的？欄位缺了、型別錯了會怎樣？

<!-- nav:start -->
---
← 上一課：[從 ToList 到 ToListAsync](03-async.md)（尚未推出）　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[Model Binding、JSON 與驗證](05-binding-json-validation.md)（尚未推出） →
<!-- nav:end -->

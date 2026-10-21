# HTTP Request 與 Response

<!-- meta:start -->
Part 4　ASP.NET Core Web API　·　單元 4-01　·　約 20 分鐘
<!-- meta:end -->

## 學完你會

- 拆開一次 HTTP 請求：方法、URL、Header、Body 各是什麼
- 拆開一次回應：狀態碼、Header、Body
- 用對 HTTP 方法（GET / POST / PUT / PATCH / DELETE）和狀態碼（2xx / 4xx / 5xx）
- 在瀏覽器的開發者工具裡看到真實的請求與回應

## 情境

[0-01](../00-overview/01-how-web-api-works.md) 全景圖的 ① 和 ⑤：前端按下「送出」，後端最後回「201 Created」。這兩個箭頭上跑的，就是 HTTP。

![全景圖：亮起前端與後端之間的 Request / Response](../images/overview-http.svg)

*圖 1　HTTP 只管前端和後端之間這一段：送出 Request、收回 Response*

Web API 的「API」就是一組約定好的 HTTP 請求：前端用什麼方法、打哪個網址、送什麼內容，後端回什麼狀態碼、什麼內容。所以寫 API 之前要先看懂 HTTP。

## 一次請求長什麼樣子

HTTP 是**純文字**協定。前端送出的 Request 實際上是這樣一段文字：

```http
POST /blogs/1/posts HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Accept: application/json

{
  "title": "EF Core 入門",
  "content": "今天來介紹…",
  "tags": ["efcore"]
}
```

| 部分 | 這個例子 | 意思 |
|---|---|---|
| **方法（Method）** | `POST` | 想做什麼：新增 |
| **路徑（Path）** | `/blogs/1/posts` | 對哪個資源：部落格 1 的文章 |
| **Header** | `Content-Type: application/json` | 附加資訊：我送的內容是 JSON |
| **Body** | `{ "title": … }` | 內容本身：要新增的文章 |

第一行是「方法 + 路徑 + 版本」，接著一行一個 Header，**空一行**之後是 Body。`GET` 請求通常沒有 Body。

### URL 的組成

```
https://localhost:5001/blogs/1/posts?page=2&pageSize=10
└─┬─┘   └──────┬─────┘└─────┬─────┘ └────────┬────────┘
 協定        主機:埠       路徑           查詢字串
```

| 部分 | 意思 |
|---|---|
| 協定 `https` | 加密的 HTTP；開發時常用 `http` |
| 主機與埠 `localhost:5001` | 伺服器在哪、聽哪個埠 |
| 路徑 `/blogs/1/posts` | 資源的位置，中間的 `1` 是**路由參數** |
| 查詢字串 `?page=2&pageSize=10` | 額外的選項，`?` 開頭、`&` 分隔；通常用在篩選、分頁、排序 |

## 方法：想做什麼

| 方法 | 用途 | 有 Body？ | 重複執行安全？ | 例子 |
|---|---|---|---|---|
| `GET` | 讀取 | 無 | 是（不改資料） | `GET /blogs/1/posts` |
| `POST` | 新增 | 有 | 否（送兩次會新增兩筆） | `POST /blogs/1/posts` |
| `PUT` | 整筆取代 | 有 | 是（送兩次結果一樣） | `PUT /posts/5` |
| `PATCH` | 部分修改 | 有 | 看情況 | `PATCH /posts/5`（只改標題） |
| `DELETE` | 刪除 | 通常無 | 是（刪兩次還是刪掉） | `DELETE /posts/5` |

「重複執行安全」的正式名稱叫**冪等（Idempotent）**：網路不穩時客戶端可能重送，冪等的請求重送不會出事，`POST` 不行。

> [!IMPORTANT]
> **GET 不應該改資料**
>
> 瀏覽器、代理伺服器、爬蟲都假設 GET 是安全的，可能預先載入或快取。用 GET 做刪除，哪天一個爬蟲爬過去就把資料刪光了。要改資料一律用 POST / PUT / PATCH / DELETE。

## 一次回應長什麼樣子

後端回傳的 Response 也是純文字：

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /posts/11

{
  "postId": 11,
  "title": "EF Core 入門"
}
```

| 部分 | 這個例子 | 意思 |
|---|---|---|
| **狀態碼（Status Code）** | `201 Created` | 結果：新增成功 |
| **Header** | `Location: /posts/11` | 附加資訊：新資源在哪 |
| **Body** | `{ "postId": 11, … }` | 回傳的資料 |

### 狀態碼：結果如何

三位數字，**第一個數字**就說明了大方向：

| 範圍 | 意思 | 常用的 |
|---|---|---|
| **2xx** | 成功 | `200 OK` 一般成功、`201 Created` 新增成功、`204 No Content` 成功但沒內容（刪除） |
| **3xx** | 轉址 | `301` / `302` 搬家了；API 很少用 |
| **4xx** | **前端**送錯 | `400 Bad Request` 內容不合法、`401 Unauthorized` 沒登入、`403 Forbidden` 沒權限、`404 Not Found` 找不到、`409 Conflict` 衝突（網址重複）、`422` 驗證失敗（有些框架用） |
| **5xx** | **後端**出錯 | `500 Internal Server Error` 程式例外、`503` 服務暫停 |

選狀態碼的原則：**先分 2 / 4 / 5，再挑最貼切的**。前端看到 4xx 知道要改自己送的東西，看到 5xx 知道是後端的問題。

### 常見的 Header

| Header | 出現在 | 意思 |
|---|---|---|
| `Content-Type` | 兩邊 | Body 是什麼格式。API 幾乎都是 `application/json` |
| `Accept` | Request | 我希望收到什麼格式 |
| `Authorization` | Request | 身分憑證，例如 `Bearer <token>`（[4-11](11-cors-auth.md)） |
| `Location` | Response | 新建立的資源在哪（配 201） |
| `Content-Length` | 兩邊 | Body 幾個 byte，框架自動算 |

## 每次請求都是獨立的

HTTP 是**無狀態（Stateless）**的：伺服器不記得上一次請求。每個請求都要自己帶齊資訊（要查哪個部落格、是誰在呼叫）。這就是為什麼 Web API 裡「一個請求一個 DbContext」是自然的設計（[2-06](../02-dotnet-and-db/06-dbcontext.md)），也是為什麼登入後要在每次請求帶 token。

## 對照程式碼

Minimal API 的一支端點，跟上面那段 Request / Response 一一對應：

```csharp
app.MapPost("/blogs/{blogId}/posts", async (int blogId, CreatePostRequest req, BloggingContext db) =>
//          └── 方法 + 路徑 ──┘          └ 路由參數 ┘ └── Body（JSON → 物件）┘
{
    var post = new Post { BlogId = blogId, Title = req.Title, Content = req.Content };
    db.Posts.Add(post);
    await db.SaveChangesAsync();
    return Results.Created($"/posts/{post.PostId}", new { post.PostId, post.Title });
    //     └─ 狀態碼 201 ─┘ └─ Location ─┘       └── Response Body ──┘
});
```

[4-04](04-routing.md) 會講路由與參數，[4-06](06-responses.md) 會講怎麼選狀態碼。

## 動手

不用寫程式也能看到真實的 HTTP：

1. 用 Chrome 或 Edge 打開任何網站（例如 GitHub），按 `F12` 打開開發者工具，切到 **Network** 分頁，重新整理頁面。
2. 點任何一列，右邊會出現 **Headers**：看 Request Method、Status Code、Request Headers、Response Headers。
3. 切到 **Response** 分頁看 Body。找一個回 JSON 的請求（通常網址裡有 `api`）。
4. 在 Rider 新增一個 `.http` 檔，寫下面兩行，按旁邊的 ▶：

```http
GET https://api.github.com/repos/dotnet/efcore
Accept: application/json
```

Rider 會顯示完整的回應：狀態碼、Header、JSON Body。這個 `.http` 檔之後就是測試自己 API 的工具（[4-10](10-testing.md)）。

## 常見的坑

> [!WARNING]
> **什麼都回 200**
>
> 失敗也回 `200` 加一段 `{ "success": false }`，前端就得自己解析每個回應。用狀態碼表達結果，前端用一個通則就能處理所有錯誤。

> [!WARNING]
> **忘了 `Content-Type`**
>
> 送 JSON 卻沒標 `Content-Type: application/json`，ASP.NET Core 會回 `415 Unsupported Media Type`。用 Rider 的 `.http` 檔或 OpenAPI 介面測試時它們會自動加，自己用別的工具時要記得。

> [!WARNING]
> **把資料放在 GET 的 Body**
>
> 規格上 GET 的 Body 沒有意義，很多工具會直接丟掉。要帶條件用查詢字串（`?tag=efcore`），條件太複雜再考慮 POST。

## 小練習

**練習 1**　下面每個情境該用什麼方法、成功時回什麼狀態碼？

| 情境 | 方法 | 狀態碼 |
|---|---|---|
| 查部落格 1 的文章列表 | | |
| 新增一篇文章 | | |
| 刪除文章 5 | | |
| 只修改文章 5 的標題 | | |

<details>
<summary>看答案</summary>

| 情境 | 方法 | 狀態碼 |
|---|---|---|
| 查部落格 1 的文章列表 | `GET /blogs/1/posts` | `200` |
| 新增一篇文章 | `POST /blogs/1/posts` | `201` + `Location` |
| 刪除文章 5 | `DELETE /posts/5` | `204` |
| 只修改文章 5 的標題 | `PATCH /posts/5`（或 `PUT` 整筆送） | `200` 或 `204` |

</details>

**練習 2**　前端送 `POST /blogs`，網址已經被別人用了，該回什麼？送來的 JSON 少了必填的 `url` 又該回什麼？

<details>
<summary>看答案</summary>

網址重複：`409 Conflict`（資料本身沒錯，但跟現有資料衝突）。少了必填欄位：`400 Bad Request`（送來的內容不合法）。兩個都是 4xx：前端送的東西有問題，不是後端壞了。

</details>

**練習 3**　`GET /posts/999` 找不到文章，回 `404` 還是 `200` 加空物件？為什麼？

<details>
<summary>看答案</summary>

`404`。「找不到」是一種結果，狀態碼就是用來表達結果的；回 200 加空物件，前端得額外判斷「空物件代表沒有」。

</details>

## 延伸閱讀

- [MDN：HTTP 概觀](https://developer.mozilla.org/docs/Web/HTTP/Overview)
- [MDN：HTTP 狀態碼一覽](https://developer.mozilla.org/docs/Web/HTTP/Status)
- [MDN：HTTP 方法](https://developer.mozilla.org/docs/Web/HTTP/Methods)

> **下一個問題**：後端收到這段純文字之後，ASP.NET Core 是怎麼從 `Program.cs` 啟動、再決定哪段程式來處理它？

<!-- nav:start -->
---
← 上一課：[進階專題](../03-linq/18-advanced.md)（尚未推出）　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[ASP.NET Core 怎麼啟動](02-startup.md)（尚未推出） →
<!-- nav:end -->

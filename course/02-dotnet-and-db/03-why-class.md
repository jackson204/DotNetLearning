# 為什麼需要 class：Entity

<!-- meta:start -->
Part 2　.NET 怎麼跟資料庫說話　·　單元 2-03　·　約 20 分鐘
<!-- meta:end -->

## 學完你會

- 說出直接用 `reader["欄位"]` 讀值會遇到的四個問題
- 用一個 class 承接結果表的一列，讓程式用「物件」而不是「一格一格的值」溝通
- 知道 Entity、POCO 這兩個名詞指的是什麼
- 看懂 C# 的 Nullable 寫法：`string?`、`= null!`、`required`，知道什麼時候用哪個

## 情境

[2-02](02-ado-net.md) 的程式能動，但仔細看，寫起來到處是坑：

| 問題 | 例子 | 後果 |
|---|---|---|
| 欄位名稱是字串 | `reader["Tilte"]` 打錯字 | 編譯會過，執行到那行才爆炸 |
| 型別要自己轉 | 把 `bigint` 欄位轉成 `(int)` | 執行時 `InvalidCastException` |
| 資料散成一堆變數 | `id`、`title`、`content` 各自獨立 | 無法當成「一篇文章」傳給其他方法、回傳給前端 |
| 不知道一筆資料有哪些欄位 | 要翻資料庫才知道 `Posts` 有什麼欄位 | 沒有自動完成，容易漏 |

資料庫回來的是「一格一格的值」，但程式想處理的是「一篇文章」。這中間的落差怎麼辦？

## 解法：先定義「一篇文章長什麼樣子」

用 class 描述資料的形狀，資料表的**一列**就對應到一個**物件**：

**資料庫：資料表 Posts**

```sql
CREATE TABLE Posts (
    PostId   int IDENTITY PRIMARY KEY,
    Title    nvarchar(200) NOT NULL,
    Content  nvarchar(max) NULL,
    BlogId   int NOT NULL
);
```

**C#：class Post**

```csharp
public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; } = null!;
    public string? Content { get; set; }
    public int BlogId { get; set; }
}
```

一欄對一個屬性，型別也對應：`int` ↔ `int`、`nvarchar` ↔ `string`、允許 NULL 的欄位 ↔ `string?`。

讀取時把每一列「裝進」一個物件，之後整個程式都用物件溝通：

```csharp
var posts = new List<Post>();
while (await reader.ReadAsync())
{
    posts.Add(new Post                       // 一列 → 一個 Post 物件
    {
        PostId  = reader.GetInt32(0),
        Title   = reader.GetString(1),
        Content = reader.IsDBNull(2) ? null : reader.GetString(2),   // NULL 也要自己處理
        BlogId  = reader.GetInt32(3),
    });
}
return posts;                                // 可以直接回傳、序列化成 JSON
```

### class 解決了什麼

| 目的 | 說明 |
|---|---|
| **描述資料結構** | 屬性 = 欄位，型別 = 欄位型別。打開 class 就知道一篇文章有哪些欄位，不用翻資料庫 |
| **型別安全** | `post.Tilte` 打錯字 → 編譯錯誤，IDE 直接標紅；`post.Views = "abc"` 也過不了編譯 |
| **把相關資料綁在一起** | 「一篇文章」是一個東西，可以傳給方法、放進 `List`、回傳給前端變成 JSON |
| **表達關係** | 之後可以加上 `public Blog Blog`，用 `post.Blog.Url` 取代手寫 JOIN（[3-10](../03-linq/10-relationships.md)） |

> [!NOTE]
> **名詞：Entity / POCO**
>
> 對應到資料表的 class 稱為 **Entity（實體）**。它不需要繼承任何特殊類別，就是普通的 class，所以也叫 POCO（Plain Old CLR Object）。練習專案的 `Models/` 資料夾裡就是五個 Entity。

## Nullable：哪些屬性可以沒有值

從 .NET 6 的專案範本開始，`<Nullable>enable</Nullable>` 預設是開的：編譯器會追蹤每個參考型別「可不可以是 null」。這跟資料庫的 NULL 剛好對得上，但寫 Entity 時會遇到一個警告：

```csharp
public string Title { get; set; }
// 警告 CS8618：結束建構函式時，不可為 Null 的屬性 'Title' 必須包含非 Null 值
```

編譯器的意思是：你說 `Title` 不會是 null，但 `new Post()` 的時候它就是 null。Entity 的三種寫法：

| 寫法 | 意思 | 什麼時候用 |
|---|---|---|
| `public string? Content { get; set; }` | **可以**是 null | 對應**允許 NULL** 的欄位（`Content`、`Email`、`AuthorId` 用 `int?`） |
| `public string Title { get; set; } = null!;` | 不會是 null；`= null!` 是告訴編譯器「我知道現在是 null，但 EF Core 讀資料時一定會填」 | 對應 **NOT NULL** 的欄位，EF Core 官方文件推薦的寫法；練習專案用這個 |
| `public required string Title { get; set; }` | 不會是 null，而且 `new Post { }` 時**一定要給**，否則編譯錯誤 | C# 11 起可用。適合你自己 `new` 出來的物件；EF Core 從資料庫讀回時會自動處理 |

> [!TIP]
> **對應關係記這一條**
>
> 欄位允許 NULL → 屬性加 `?`；欄位 NOT NULL → `= null!` 或 `required`。這樣編譯器幫你盯著：讀到 `Content` 時會提醒你它可能是 null，讀 `Title` 時不會囉嗦。

## 動手

1. 打開 `lab/EfCoreLab/Models/Post.cs`，對照 [1-01](../01-sql/01-tables.md) 看過的 `Posts` 表：哪些屬性有 `?`、哪些是 `= null!`，跟資料表的「允許 NULL」是不是一致？
2. 打開 `Models/Author.cs`：`Email` 為什麼是 `string?`？
3. 在 Rider 把 `Post.Title` 的 `= null!` 拿掉，看編譯器的警告訊息，再加回去。

## 常見的坑

> [!WARNING]
> **欄位允許 NULL，屬性卻沒加 `?`**
>
> 編譯器不會知道，執行時 EF Core 讀到 NULL 會直接丟例外（`SqlNullValueException`）。對照資料表定義寫，或反過來：先決定屬性可不可以 null，再讓 EF Core 照屬性建表（Part 2 之後都是這個方向）。

> [!WARNING]
> **屬性名稱和欄位名稱對不上**
>
> `reader.GetString(1)` 用的是「第幾欄」，換了 SELECT 的順序就錯位。這是手動轉換的另一個坑，EF Core 會用名稱對應（[2-07](07-mapping.md)），不會發生。

> [!WARNING]
> **把 Entity 當成 API 的回傳格式**
>
> Entity 描述的是「資料庫裡有什麼」，不是「前端需要什麼」。直接回傳會把不該公開的欄位送出去，之後加了導覽屬性還會有循環參考。[4-09](../04-web-api/09-dto-layers.md) 會講 DTO。

## 小練習

**練習 1**　照 `Authors` 表（`AuthorId int`、`Name nvarchar(50) NOT NULL`、`Email nvarchar NULL`）寫出 `Author` class。

<details>
<summary>看答案</summary>

```csharp
public class Author
{
    public int AuthorId { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
}
```

</details>

**練習 2**　`Blogs` 表的 `Rating` 允許 NULL（沒評分）。`Blog` class 的 `Rating` 屬性該怎麼宣告？

<details>
<summary>看答案</summary>

`public int? Rating { get; set; }`。值型別（`int`、`DateTime`、`bool`）要表達「沒有值」一律加 `?`，沒有 `= null!` 的問題。

</details>

**練習 3**　為什麼 `PostId`、`BlogId` 不用加 `?` 也不會有 CS8618 警告？

<details>
<summary>看答案</summary>

它們是 `int`（值型別），預設值是 0，不可能是 null，所以編譯器不會警告。CS8618 只針對參考型別（`string`、class）。

</details>

## 延伸閱讀

- [C#：可為 Null 的參考型別（Microsoft Learn）](https://learn.microsoft.com/dotnet/csharp/nullable-references)
- [EF Core：使用可為 Null 的參考型別](https://learn.microsoft.com/ef/core/miscellaneous/nullable-reference-types)：官方對 `= null!` 與 `required` 的建議

> **下一個問題**：有了 class，讀取變好用了，但「一列裝進一個物件」的程式碼，每張表、每個查詢都要再寫一次。還有更多麻煩的事……

<!-- nav:start -->
---
← 上一課：[ADO.NET：最原始的寫法](02-ado-net.md)　｜　[學習路線](../../README.md#學習路線)　｜　下一課：[為什麼需要 ORM](04-why-orm.md) →
<!-- nav:end -->

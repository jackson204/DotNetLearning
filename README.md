# DotNetLearning

個人的 .NET 學習筆記：從 **SQL** 學到 **LINQ**、**EF Core**，再到 **ASP.NET Core Web API**，最後做出一個部落格平台的 Web API side project。

- 在 GitHub 上直接讀 Markdown；想要有側欄目錄、進度勾選的版本，在本機執行 `npm run build` 後打開 `site/index.html`（兩邊內容一樣）。
- 每個單元 15–25 分鐘，**一次只學一個**。

## 怎麼學

1. 先讀 [0-01 一個 Web API 怎麼運作](course/00-overview/01-how-web-api-works.md)，看全景圖，知道整條路長什麼樣。
2. 照 [0-02](course/00-overview/02-lab-setup.md) 把練習專案跑起來。
3. 照下面的學習路線一課一課往下，每課的順序都是：**情境 → 知識 → 動手 → 常見的坑 → 小練習 → 延伸閱讀 → 下一個問題**。
4. 因為 LINQ 最後都會變成 SQL，Part 3 每一課都**先寫 SQL，再翻成 LINQ**，最後對照 EF Core 實際送出的 SQL。SQL 不熟沒關係，Part 1 從頭學。
5. 學完一課，在 HTML 版的路線圖勾「已完成」（進度只存在這台電腦的瀏覽器）。

## 學習路線

<!-- toc:start -->
### Part 0　全景

> 先看整張地圖：一個 Web API 從請求到資料庫再回來，中間經過哪些東西；把練習環境跑起來。

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 0-01 | [一個 Web API 怎麼運作](course/00-overview/01-how-web-api-works.md) | 看懂全景圖：前端送出請求，經過 API、EF Core、ADO.NET 到資料庫，再把結果送回去；知道這套課程怎麼走 | 20 分 | ✅ 可以學 |
| 0-02 | [練習環境：EfCoreLab](course/00-overview/02-lab-setup.md) | 把練習專案跑起來、認識範例資料、學會兩種看 SQL 的方法、在 Rider 直接執行 SQL | 15 分 | ✅ 可以學 |

### Part 1　資料庫與 SQL

> 資料庫是什麼、資料表長什麼樣，從 SELECT 到 JOIN 一路把 SQL 練熟。後面的 LINQ 全部建立在這上面。

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 1-01 | [資料表長什麼樣](course/01-sql/01-tables.md) | 資料庫、資料表、列與欄、資料型別、主鍵、NULL | 15 分 | ✅ 可以學 |
| 1-02 | [SELECT：取資料](course/01-sql/02-select.md) | SELECT 句型：取整張表、指定欄位、改名、計算欄位；在 Rider 執行 SQL | 15 分 | ✅ 可以學 |
| 1-03 | [WHERE：篩選](course/01-sql/03-where.md) | 比較運算、AND / OR / NOT、LIKE、IN、BETWEEN、NULL 的判斷 | 20 分 | ⏳ 尚未推出 |
| 1-04 | [ORDER BY、TOP、OFFSET：排序與分頁](course/01-sql/04-order-by-paging.md) | 單欄與多欄排序、沒排序就不保證順序、取前幾筆、分頁 | 15 分 | ⏳ 尚未推出 |
| 1-05 | [彙總與 GROUP BY](course/01-sql/05-group-by.md) | COUNT / SUM / AVG / MAX、GROUP BY、HAVING 與 WHERE 的差別 | 20 分 | ⏳ 尚未推出 |
| 1-06 | [多張表：外鍵與三種關聯](course/01-sql/06-relationships.md) | 為什麼要拆表、外鍵、一對一 / 一對多 / 多對多在資料表裡長什麼樣 | 20 分 | ⏳ 尚未推出 |
| 1-07 | [INNER JOIN：把兩張表接起來](course/01-sql/07-inner-join.md) | JOIN 的原理、ON 條件、別名、一對多的 JOIN 結果 | 20 分 | ⏳ 尚未推出 |
| 1-08 | [LEFT JOIN 與 NULL](course/01-sql/08-left-join.md) | 找出沒有文章的作者、沒人用的標籤；LEFT JOIN 產生的 NULL 怎麼處理 | 20 分 | ⏳ 尚未推出 |
| 1-09 | [多對多：中間表與兩次 JOIN](course/01-sql/09-many-to-many.md) | PostTag 中間表、依標籤找文章、一篇文章的所有標籤 | 20 分 | ⏳ 尚未推出 |
| 1-10 | [INSERT / UPDATE / DELETE：寫入資料](course/01-sql/10-insert-update-delete.md) | 新增、修改、刪除的語法與「影響幾列」；忘了 WHERE 的災難；用 reset 救回來 | 20 分 | ⏳ 尚未推出 |
| 1-11 | [交易與串聯刪除](course/01-sql/11-transaction.md) | BEGIN / COMMIT / ROLLBACK、全部成功或全部取消、外鍵阻擋刪除與 ON DELETE CASCADE | 20 分 | ⏳ 尚未推出 |
| 1-12 | [索引入門](course/01-sql/12-index.md) | 為什麼有索引比較快、唯一索引、索引怎麼影響回傳順序 | 15 分 | ⏳ 尚未推出（選讀） |

### Part 2　.NET 怎麼跟資料庫說話

> 從最原始的 ADO.NET 開始，理解為什麼需要 class、為什麼需要 ORM，EF Core 的 DbContext 又是什麼。

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 2-01 | [.NET 與資料庫是什麼關係](course/02-dotnet-and-db/01-dotnet-and-database.md) | 兩個獨立的程式：連線字串、驅動程式、送 SQL 收結果表、拿回來的是複本 | 20 分 | ✅ 可以學 |
| 2-02 | [ADO.NET：最原始的寫法](course/02-dotnet-and-db/02-ado-net.md) | SqlConnection / SqlCommand / SqlDataReader 親手跑一次，體會一格一格讀值的苦 | 20 分 | ✅ 可以學 |
| 2-03 | [為什麼需要 class：Entity](course/02-dotnet-and-db/03-why-class.md) | 用 class 承接結果表的一列；型別安全；Nullable：string?、= null!、required | 20 分 | ✅ 可以學 |
| 2-04 | [為什麼需要 ORM](course/02-dotnet-and-db/04-why-orm.md) | ADO.NET + class 還剩哪些苦工、ORM 是什麼、ADO.NET / Dapper / EF Core 怎麼選、ORM 的代價 | 20 分 | ✅ 可以學 |
| 2-05 | [EF Core 的組成](course/02-dotnet-and-db/05-ef-core-anatomy.md) | 分層圖：你的程式 → EF Core 核心 → Provider → ADO.NET → 資料庫；哪些是 ORM、哪些不是 | 15 分 | ✅ 可以學 |
| 2-06 | [DbContext 與 DbSet](course/02-dotnet-and-db/06-dbcontext.md) | 一次工作階段、DbSet 就是一張表、OnConfiguring 與 AddDbContext、連線字串放哪 | 20 分 | ✅ 可以學 |
| 2-07 | [class 怎麼對應到資料表](course/02-dotnet-and-db/07-mapping.md) | 慣例（Id、外鍵命名）、Data Annotations、Fluent API，衝突時誰贏 | 20 分 | ✅ 可以學 |

### Part 3　LINQ：把 SQL 翻成 LINQ

> 每一課先寫 SQL，再翻成 LINQ，對照 EF Core 實際送出的 SQL：Select、Where、Include、SelectMany、AsNoTracking……

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 3-01 | [LINQ 怎麼變成 SQL](course/03-linq/01-linq-to-sql.md) | 運算式樹、翻譯、實體化；用 ToQueryString 和 log 看 EF Core 送出的 SQL | 20 分 | ✅ 可以學 |
| 3-02 | [Select：投影](course/03-linq/02-select.md) | ToList 取整張表、Select 只取需要的欄位、改名、計算、投影成 DTO；為什麼投影比較好 | 20 分 | ✅ 可以學 |
| 3-03 | [看懂官方文件的方法簽章](course/03-linq/03-read-signatures.md) | 拆解 Select / Where 的簽章：泛型 TSource、this 擴充方法、Func 與 lambda、多載、Enumerable 與 Queryable 兩個版本；在 docs 和 Rider 裡查方法 | 20 分 | ⏳ 尚未推出 |
| 3-04 | [Where：篩選](course/03-linq/04-where.md) | WHERE → Where：AND / OR、Contains（LIKE）、list.Contains（IN）、NULL 比較 | 20 分 | ⏳ 尚未推出 |
| 3-05 | [OrderBy、Skip、Take：排序與分頁](course/03-linq/05-order-by-paging.md) | ORDER BY → OrderBy / ThenBy、OFFSET FETCH → Skip / Take、分頁 API 的寫法 | 15 分 | ⏳ 尚未推出 |
| 3-06 | [取單筆：First、Single、Find](course/03-linq/06-single-row.md) | 四種取單筆方法的差別、找不到時會怎樣、FindAsync 為什麼不用 SQL | 15 分 | ⏳ 尚未推出 |
| 3-07 | [延遲執行：IQueryable 與 IEnumerable](course/03-linq/07-deferred-execution.md) | 查詢什麼時候真的送出、ToList 放錯位置的代價、在記憶體裡做的事與在資料庫做的事 | 20 分 | ⏳ 尚未推出 |
| 3-08 | [新增、修改、刪除與 SaveChanges](course/03-linq/08-add-update-delete.md) | INSERT / UPDATE / DELETE → Add / 改屬性 / Remove；SaveChanges 一次送出 | 20 分 | ⏳ 尚未推出 |
| 3-09 | [Change Tracker 與 AsNoTracking](course/03-linq/09-change-tracker.md) | 五種 Entity 狀態、EF Core 怎麼知道你改了什麼、唯讀查詢為什麼要 AsNoTracking | 20 分 | ⏳ 尚未推出 |
| 3-10 | [GroupBy 與聚合](course/03-linq/10-group-by.md) | Count / Sum / Max / Average、GroupBy → GROUP BY、哪些寫法翻不成 SQL | 20 分 | ⏳ 尚未推出 |
| 3-11 | [關聯在 C# 裡：導覽屬性與外鍵](course/03-linq/11-relationships.md) | 一對一 / 一對多 / 多對多在 class 裡怎麼寫、Fluent API 怎麼設定、EF Core 自動建的中間表 | 25 分 | ⏳ 尚未推出 |
| 3-12 | [Include 與 ThenInclude](course/03-linq/12-include.md) | JOIN → Include：部落格連同文章一起取出、多層 Include、一對一的 Include | 20 分 | ⏳ 尚未推出 |
| 3-13 | [多對多的查詢](course/03-linq/13-many-to-many.md) | 依標籤找文章（Any）、文章的標籤（Include）、沒人用的標籤（!Any） | 20 分 | ⏳ 尚未推出 |
| 3-14 | [Select 跨關聯 vs Include、N+1 問題](course/03-linq/14-projection-vs-include.md) | 在 Select 裡讀導覽屬性只查需要的欄位；迴圈裡讀導覽屬性為什麼會多送 N 次 SQL | 25 分 | ⏳ 尚未推出 |
| 3-15 | [SelectMany：攤平集合](course/03-linq/15-select-many.md) | 把「每個部落格的文章清單」攤成一張文章表；Select 與 SelectMany 的差別 | 20 分 | ⏳ 尚未推出 |
| 3-16 | [Join 與 GroupJoin](course/03-linq/16-join.md) | 沒有導覽屬性時怎麼 JOIN；LEFT JOIN 的 LINQ 寫法 | 20 分 | ⏳ 尚未推出 |
| 3-17 | [寫入關聯資料與交易](course/03-linq/17-write-relationships.md) | 新增文章同時加標籤、改外鍵、串聯刪除；一次 SaveChanges 就是一個交易、何時要自己開交易 | 25 分 | ⏳ 尚未推出 |
| 3-18 | [進階專題](course/03-linq/18-advanced.md) | Split Query、Raw SQL、ExecuteUpdate / ExecuteDelete、全域查詢篩選（軟刪除）、並行衝突 | 30 分 | ⏳ 尚未推出（選讀） |

### Part 4　ASP.NET Core Web API

> HTTP Request / Response、路由、Model Binding、DI、設定、Logging。做一支 API 該知道的全部。

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 4-01 | [HTTP Request 與 Response](course/04-web-api/01-http.md) | 一次請求長什麼樣：方法、URL、Header、Body、JSON；回應的狀態碼怎麼讀 | 20 分 | ✅ 可以學 |
| 4-02 | [ASP.NET Core 怎麼啟動](course/04-web-api/02-startup.md) | Program.cs、builder 與 app、Middleware、環境、launchSettings 與 port、HTTPS 憑證、第一次打開 OpenAPI | 25 分 | ⏳ 尚未推出 |
| 4-03 | [從 ToList 到 ToListAsync](course/04-web-api/03-async.md) | 為什麼 Web API 要 async / await、Task 是什麼、哪些地方該 await | 20 分 | ⏳ 尚未推出 |
| 4-04 | [Minimal API 與路由](course/04-web-api/04-routing.md) | MapGet / MapPost…、路由參數、查詢字串、MapGroup、和 Controller 的對照 | 20 分 | ✅ 可以學 |
| 4-05 | [Model Binding、JSON 與驗證](course/04-web-api/05-binding-json-validation.md) | 參數從哪來、JSON ↔ 物件（camelCase、日期、JsonIgnore、循環參考）、輸入驗證回 400 | 25 分 | ⏳ 尚未推出 |
| 4-06 | [回應：Results 與狀態碼](course/04-web-api/06-responses.md) | Results / TypedResults、200 / 201 / 204 / 400 / 404 / 409 怎麼選、ProblemDetails 錯誤格式 | 20 分 | ⏳ 尚未推出 |
| 4-07 | [DI：依賴注入](course/04-web-api/07-di.md) | 是什麼、為什麼、AddXxx 註冊、Transient / Scoped / Singleton、DbContext 為什麼是 Scoped、captive dependency | 25 分 | ⏳ 尚未推出 |
| 4-08 | [設定與 Logging](course/04-web-api/08-config-logging.md) | appsettings、環境變數、User Secrets、Options pattern、ILogger 與記錄等級 | 20 分 | ⏳ 尚未推出 |
| 4-09 | [DTO 與分層](course/04-web-api/09-dto-layers.md) | 為什麼不回傳 Entity、Request / Response 模型、Service 層、把端點搬出 Program.cs | 25 分 | ⏳ 尚未推出 |
| 4-10 | [測試你的 API](course/04-web-api/10-testing.md) | .http 檔與 Rider HTTP client、OpenAPI UI、常見錯誤怎麼讀 | 15 分 | ⏳ 尚未推出 |
| 4-11 | [CORS 與認證授權](course/04-web-api/11-cors-auth.md) | 前端跨網域為什麼被擋、CORS 設定；認證與授權是什麼、JWT 入門 | 25 分 | ⏳ 尚未推出（選讀） |

### Part 5　Side project：部落格平台 API

> 把前面學的全部用上：需求 → 規劃 → 設計 → 實作 → 驗收，做出一個可以放上 GitHub 的 Web API。

| # | 單元 | 學什麼 | 時間 | 狀態 |
|---|---|---|---|---|
| 5-01 | [需求：我們要做什麼](course/05-project/01-requirements.md) | 使用者故事、功能清單 R1…、非功能需求、驗收條件；需求怎麼寫才能被實作 | 20 分 | ✅ 可以學 |
| 5-02 | [規劃：先做什麼、後做什麼](course/05-project/02-planning.md) | MVP 範圍、里程碑、每個里程碑用到哪些單元、怎麼估 | 15 分 | ⏳ 尚未推出 |
| 5-03 | [設計：資料模型與 API](course/05-project/03-design.md) | ER 圖、API 端點表（request / response / 狀態碼）、專案結構、錯誤處理策略 | 30 分 | ⏳ 尚未推出 |
| 5-04 | [實作 1：建專案、DbContext、Migration、Seed](course/05-project/04-scaffold.md) | dotnet new、套件、DbContext、第一個 Migration、範例資料 | 30 分 | ⏳ 尚未推出 |
| 5-05 | [實作 2：Blogs CRUD](course/05-project/05-blogs.md) | 五支端點、DTO、驗證、網址重複回 409 | 30 分 | ⏳ 尚未推出 |
| 5-06 | [實作 3：Posts](course/05-project/06-posts.md) | 一對多、分頁與排序、投影、發布時間預設值 | 30 分 | ⏳ 尚未推出 |
| 5-07 | [實作 4：Tags](course/05-project/07-tags.md) | 多對多、新增文章時同時給標籤、依標籤查文章 | 30 分 | ⏳ 尚未推出 |
| 5-08 | [實作 5：Authors 與統計](course/05-project/08-authors-stats.md) | 可為空的作者、沒寫過文章的作者、每個部落格的文章數與瀏覽數 | 25 分 | ⏳ 尚未推出 |
| 5-09 | [實作 6：套用到專案](course/05-project/09-hardening.md) | 錯誤處理、Logging、設定與 User Secrets、OpenAPI 整理 | 25 分 | ⏳ 尚未推出 |
| 5-10 | [測試與驗收](course/05-project/10-acceptance.md) | .http 測試檔、逐條對照需求、找出沒做到的 | 25 分 | ⏳ 尚未推出 |
| 5-11 | [回顧：套用到自己的專案](course/05-project/11-retrospective.md) | 整理學到的流程，套到 MyBoards；延伸：整合測試、Docker | 20 分 | ⏳ 尚未推出（選讀） |
<!-- toc:end -->

## 練習專案

`lab/` 是一個 .NET 10 主控台程式，用 EF Core 10 + SQL Server LocalDB，範例資料涵蓋一對一、一對多、多對多：

```bash
cd lab/EfCoreLab
dotnet run -- reset          # 建立資料庫 EfCoreLab 並放入範例資料（玩壞了就重來）
dotnet run -- linq-select    # 執行某一課：印出 手寫 SQL → LINQ → EF Core 產生的 SQL → 結果
dotnet run -- linq-select --ex    # 該課的練習解答
dotnet run -- linq-select --log   # 同時印出 EF Core 實際執行的 SQL 紀錄
```

SQL 單元的 `.sql` 檔在 `lab/EfCoreLab/Lessons/`，可在 Rider 的 Database 視窗直接執行。詳見 [lab/README.md](lab/README.md)。

## Side project

Part 5 會在 `project/` 建立部落格平台 API，走完整的 **需求 → 規劃 → 設計 → 實作 → 驗收**。需求書在 [5-01](course/05-project/01-requirements.md)。

## 零散筆記

不成系列的知識點放在 [notes/](notes/README.md)。

## 本機閱讀 HTML 版

```bash
npm install        # 第一次
npm run build      # 產生 site/（不進 git）
```

打開 `site/index.html`。HTML 由 `build/build.mjs` 從 Markdown 產生，**Markdown 是唯一來源**；寫作慣例見 [course/STYLE.md](course/STYLE.md)。

## 環境需求

| 需要 | 用途 |
|---|---|
| .NET 10 SDK | 練習專案與 side project（`global.json` 鎖定 10.x） |
| SQL Server LocalDB | 練習用資料庫（`sqllocaldb info` 要看到 `MSSQLLocalDB`） |
| JetBrains Rider（或 VS / VS Code） | 執行程式、Database 視窗執行 SQL |
| Node.js 22（選用） | 只有要產生 HTML 版才需要 |

## 結構

```text
DotNetLearning/
├── README.md             這一頁：學習路線由 course/toc.json 自動產生
├── course/               教學內容（Markdown，唯一來源）
│   ├── toc.json          課程清單：編號、標題、目標、狀態
│   ├── STYLE.md          寫作慣例
│   ├── images/           SVG 圖（全景圖、分層圖、資料庫圖；由 build/diagrams 產生或手繪）
│   ├── 00-overview/ 01-sql/ 02-dotnet-and-db/ 03-linq/ 04-web-api/ 05-project/
├── lab/                  練習專案 EfCoreLab
├── project/              side project（Part 5 建立）
├── notes/                零散筆記
├── build/                Markdown → HTML 的建置腳本與版型
└── site/                 產生的 HTML（不進 git）
```

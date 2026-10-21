# 寫作慣例

這份 repo 的教學都用 Markdown 寫，`npm run build` 會產生本機閱讀用的 HTML。
**md 是唯一來源**：GitHub 上看到的和 HTML 裡看到的內容一模一樣，所以只能用 GitHub 看得懂的語法。

## 檔案與編號

- 單元放在 `course/<Part 資料夾>/<兩位數編號>-<slug>.md`，例如 `course/01-sql/03-where.md`。
- 單元的 id 是 `toc.json` 裡的 slug（例如 `sql-where`），進度、練習專案指令、連結都用 slug；檔名的編號只是方便在 GitHub 依序瀏覽。
- 標題、Part、預估時間、上一課 / 下一課由 `course/toc.json` 決定，`npm run build` 會把它們寫進 md 的 `<!-- meta -->` 與 `<!-- nav -->` 標記之間，不要手改那兩段。
- 不用 YAML front matter（GitHub 會把它畫成表格）、不用 `[[toc]]`、註腳、emoji 代碼。

## 單元的固定結構

```markdown
# 單元標題

<!-- meta:start -->（build 自動產生）<!-- meta:end -->

## 學完你會
- …（3–4 條，可勾選的具體能力）

## 情境
為什麼需要這個東西：從一個具體問題出發。

## （知識章節，標題自訂，可多節）
知識先講知識；能用圖就用圖，否則文字為主、圖為輔。

## 動手
在練習專案或 Rider 裡實際做一次。

## 常見的坑
## 小練習
## 延伸閱讀

> **下一個問題**：這一課留下的問題，引出下一課。

<!-- nav:start -->（build 自動產生）<!-- nav:end -->
```

## 語法對照

| 要表達的 | 寫法 |
|---|---|
| 補充說明 | `> [!NOTE]` 開頭的引用區塊 |
| 原則、技巧 | `> [!TIP]` |
| 坑、注意 | `> [!WARNING]` |
| 一定要記住 | `> [!IMPORTANT]` |
| 下一課的引子 | `> **下一個問題**：…` |
| 流程、時序、關聯圖 | ```` ```mermaid ```` 程式碼區塊（前後各留一個空行） |
| 手繪圖 | `![一句話說明](../images/xxx.svg)`，SVG 要自帶樣式與背景，不能靠外部 CSS |
| 圖說 | 圖的下一行，斜體：`*圖 1　說明文字*` |
| 收合的解答 | `<details><summary>看答案</summary>` ＋ **空一行** ＋ 內容 ＋ **空一行** ＋ `</details>` |
| 並排比較 | 改成表格，或前後兩個程式碼區塊各加粗體小標 |
| 步驟 | `### 步驟 1：…` |
| 需求條目 | 表格，第一欄是編號 `R1` |
| 檔案位置 | 程式碼區塊前一行：``檔案：`Models/Blog.cs` `` |
| 連結到別的單元 | 相對路徑 `.md`（build 會改成 `.html`），可帶 `#標題` 錨點 |

提示框的限制來自 GitHub：`[!NOTE]` 必須是引用區塊的第一行，提示框不能巢狀。

## SQL ↔ LINQ 對照的固定格式

```markdown
#### ① 取出整張表

**SQL**

```sql
SELECT * FROM Blogs;
```

**LINQ**

```csharp
db.Blogs.ToList();
```

**EF Core 產生的 SQL**

```sql
SELECT [b].[BlogId], [b].[Rating], [b].[Url]
FROM [Blogs] AS [b]
```

| BlogId | Url | Rating |
|---|---|---|
| 1 | https://devblog.example.com | 5 |

說明：…
```

「EF Core 產生的 SQL」和結果表格一律貼練習專案 `dotnet run -- <slug>` 的實際輸出，不要用猜的。

## 內容原則

- 通用範例：Blog / Post / Tag / Author，不綁特定專案。
- 問題驅動：每一節解決上一節留下的問題，再引出下一個；不要一開頭就丟名詞解釋。
- 一個單元只教一件事，15–25 分鐘讀完加動手。
- 數字、SQL、程式輸出都要實際跑過。

# EfCoreLab

EF Core 由淺入深學習系列的練習專案。每一課都可以執行，並印出「手寫 SQL ↔ LINQ ↔ EF Core 實際產生的 SQL ↔ 結果」對照。

教學文件在上一層：`ef-core/index.html`（學習路線圖），學習首頁是 repo 根目錄的 `index.html`。

## 環境

- .NET 6 SDK（`global.json` 鎖定 6.0.x）
- SQL Server LocalDB（`sqllocaldb info` 應看到 `MSSQLLocalDB`）
- 資料庫名稱：`EfCoreLab`，第一次執行時自動建立並放入範例資料

## 使用方式

在 `EfCoreLab/`（`.csproj` 所在資料夾）執行：

```bash
dotnet run                  # 顯示用法與課程清單
dotnet run -- reset         # 重建資料庫並放入範例資料（玩壞了就重來）
dotnet run -- L01           # 執行第 1 課的範例
dotnet run -- L01 --ex      # 執行第 1 課的練習解答
dotnet run -- L01 --log     # 同時印出 EF 送到資料庫的 SQL 紀錄
```

在 Rider 裡：Run Configuration 的 Program arguments 填 `L01`。

## 直接執行 SQL

每課都有 `Lessons/Lxx.sql`。在 Rider 的 Database 視窗新增 Data Source → Microsoft SQL Server LocalDB → 資料庫選 `EfCoreLab`，開啟 `.sql` 檔，選取一段後按 `Ctrl+Enter` 執行。

## 範例資料（`Data/Seed.cs`）

| 資料表 | 筆數 | 特別安排 |
|-------|-----|---------|
| Blogs | 3 | 第 3 個沒有評分（Rating 為 NULL） |
| BlogHeaders | 2 | 與 Blog 一對一；第 3 個部落格沒有頁首 |
| Authors | 3 | 小華沒有 Email；阿傑沒寫過文章 |
| Posts | 10 | 一篇草稿沒有內容；三篇沒有作者 |
| Tags | 6 | docker 沒有文章使用 |
| PostTag | — | 文章與標籤的多對多中間表 |

## 結構

```
EfCoreLab/
├── Program.cs          課程選單
├── Lab.cs              主控台輸出工具（SQL / LINQ / 結果表格）
├── Models/             Blog、BlogHeader、Author、Post、Tag
├── Data/LabContext.cs  DbContext 與關聯設定
├── Data/Seed.cs        範例資料
└── Lessons/            每課一個 .cs（範例 + 練習解答）與一個 .sql
```

> 為了讓「重來」最簡單，這個專案用 `EnsureCreated` 建立資料庫，而不是 Migration。Migration 的用法見教學系列。

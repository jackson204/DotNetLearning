# EfCoreLab：練習專案

學習路線的練習專案。每一課都可以執行，並印出「手寫 SQL ↔ LINQ ↔ EF Core 實際產生的 SQL ↔ 結果」對照。

教學文件在 `course/`，學習路線在 repo 根目錄的 [README.md](../README.md)。怎麼架設見 [0-02 練習環境](../course/00-overview/02-lab-setup.md)。

## 環境

- .NET 10 SDK（根目錄 `global.json` 鎖定 10.x）
- SQL Server LocalDB（`sqllocaldb info` 應看到 `MSSQLLocalDB`）
- 資料庫名稱 `EfCoreLab`，第一次執行時自動建立並放入範例資料

## 使用方式

在 `lab/EfCoreLab/`（`.csproj` 所在資料夾）執行：

```bash
dotnet run                        # 顯示用法與課程清單
dotnet run -- reset               # 重建資料庫並放入範例資料（玩壞了就重來）
dotnet run -- linq-select         # 執行某一課的範例
dotnet run -- linq-select --ex    # 執行該課的練習解答
dotnet run -- linq-select --log   # 同時印出 EF Core 送到資料庫的 SQL 紀錄
```

在 Rider 裡：Run Configuration 的 Program arguments 填課程名稱（例如 `linq-select`）。

## 目前的課程

| 課程名稱 | 內容 | 對應單元 |
|---|---|---|
| `ado` | ADO.NET：不用 EF Core，直接送 SQL、讀結果表 | [2-02](../course/02-dotnet-and-db/02-ado-net.md) |
| `linq-select` | Select 投影：SELECT ↔ ToList / Select | [3-02](../course/03-linq/02-select.md) |

SQL 單元的 `.sql` 檔：

| 檔案 | 對應單元 |
|---|---|
| `Lessons/sql-select.sql` | [1-02](../course/01-sql/02-select.md) |

## 直接執行 SQL

在 Rider 的 Database 視窗新增 Data Source → Microsoft SQL Server LocalDB → 資料庫選 `EfCoreLab`，開啟 `.sql` 檔，游標放在某一段上按 `Ctrl+Enter` 執行。

## 範例資料（`Data/Seed.cs`）

| 資料表 | 筆數 | 特別安排 |
|---|---|---|
| Blogs | 3 | 第 3 個沒有評分（Rating 為 NULL） |
| BlogHeaders | 2 | 與 Blog 一對一；第 3 個部落格沒有頁首 |
| Authors | 3 | 小華沒有 Email；阿傑沒寫過文章 |
| Posts | 10 | 一篇草稿沒有內容；三篇沒有作者 |
| Tags | 6 | docker 沒有文章使用 |
| PostTag | — | 文章與標籤的多對多中間表（EF Core 自動建立） |

## 結構

```text
lab/
├── EfCoreLab.sln
└── EfCoreLab/
    ├── Program.cs          課程選單（slug → 範例 / 練習解答）
    ├── Lab.cs              主控台輸出工具（SQL / LINQ / 結果表格）
    ├── Models/             Blog、BlogHeader、Author、Post、Tag
    ├── Data/LabContext.cs  DbContext 與對映設定
    ├── Data/Seed.cs        範例資料
    └── Lessons/            每課一個 .cs（Run + Exercises），SQL 單元另有 .sql
```

> 為了讓「重來」最簡單，這個專案用 `EnsureCreated` 建立資料庫，而不是 Migration。Migration 在 side project（Part 5）才會用。

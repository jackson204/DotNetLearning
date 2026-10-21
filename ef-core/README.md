# EF Core 學習路線

- 標籤：#ef-core #linq #sql #學習路線
- 最後更新：2026-10-21
- 圖解版：[index.html](index.html)（可勾選進度）
- 先修：[EF Core 入門：從一個需求推到資料庫](00-basics.md)
- 練習專案：[`lab/`](lab/README.md)（`C:\Users\s9740\RiderProjects\DotNetLearning\ef-core\lab`，`dotnet run -- L01`）

一次一個小單元（約 10–20 分鐘），由淺入深。每個單元都照這個順序：

**情境問題 → 先寫 SQL → 翻成 LINQ → 對照 EF 產生的 SQL → 常見的坑 → 小練習 → 延伸閱讀**

## 先修

- [x] [EF Core 入門：從一個需求推到資料庫](00-basics.md)

## 階段 0　準備

- [x] [L00 練習環境：EfCoreLab](L00-lab-setup.md)：跑起練習專案、範例資料、兩種看 SQL 的方法

## 階段 1　單表：SQL ↔ LINQ 基本功

- [x] [L01 SELECT 取資料 ↔ ToList / Select](L01-select.md)：整張表、指定欄位、改名、計算、DTO
- [ ] L02 WHERE 篩選 ↔ Where：AND / OR、LIKE → Contains、IN → list.Contains、NULL
- [ ] L03 排序與分頁 ↔ OrderBy / Skip / Take
- [ ] L04 取單筆 ↔ First / Single / Find
- [ ] L05 彙總與分組 ↔ Count / Sum / GroupBy
- [ ] L06 延遲執行：IQueryable vs IEnumerable

## 階段 2　關聯：一對一、一對多、多對多

- [ ] L07 關聯基礎：外鍵與導覽屬性
- [ ] L08 一對多：JOIN ↔ Include / ThenInclude
- [ ] L09 一對一：設定與查詢
- [ ] L10 多對多：中間表與 Any
- [ ] L11 Select 投影 vs Include、N+1 問題
- [ ] L12 SelectMany：攤平集合
- [ ] L13 沒有導覽屬性時：Join 與 Left Join

## 階段 3　寫入與追蹤

- [ ] L14 新增 / 修改 / 刪除與 Change Tracker
- [ ] L15 AsNoTracking：何時用、差在哪
- [ ] L16 寫入關聯資料
- [ ] L17 交易 Transaction

## 階段 4　進階與效能

- [ ] L18 Split Query vs Single Query
- [ ] L19 Raw SQL（EF Core 6 沒有 ExecuteUpdate，7 起才有）
- [ ] L20 索引與執行計畫入門
- [ ] L21 全域查詢篩選：軟刪除
- [ ] L22 並行衝突：Concurrency Token

> `[x]` 表示已推出。要學下一課時，說「下一課」。

## 整套延伸閱讀

- SQL 互動練習：[SQLBolt](https://sqlbolt.com/lesson/select_queries_introduction)
- T-SQL 系統學習：[Microsoft Learn：使用 Transact-SQL 查詢與修改資料](https://learn.microsoft.com/training/paths/get-started-querying-with-transact-sql/)
- EF Core 查詢：[官方文件：查詢資料](https://learn.microsoft.com/ef/core/querying/)
- LINQ：[官方文件：投影運算](https://learn.microsoft.com/dotnet/csharp/linq/standard-query-operators/projection-operations)
- 書籍：[Jon P Smith《Entity Framework Core in Action》第二版](https://www.manning.com/books/entity-framework-core-in-action-second-edition)

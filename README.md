# DotNetLearning

個人 .NET 學習 repo：教學文件、練習專案、零散的知識筆記都放這裡。
side project（例如 `RiderProjects\MyBoards`）只記錄專案本身遇到的問題與決策。

**從這裡開始：用瀏覽器打開 [`index.html`](index.html)（學習首頁）。**

## 結構

```
DotNetLearning/
├── index.html          學習首頁：所有主題與進度
├── assets/             共用樣式 learn.css、腳本 learn.js（程式碼上色、Mermaid 圖表）
├── ef-core/            主題：EF Core
│   ├── index.html      學習路線圖（README.md 為純文字版）
│   ├── 00-basics.*     入門：從一個需求推到資料庫
│   ├── Lxx-*.html/.md  小單元（圖解版 + 純文字版）
│   └── lab/            練習專案 EfCoreLab（.NET 6 + LocalDB）
├── notes/              零散筆記（README.md 為索引）
└── global.json         鎖定 .NET 6 SDK（給練習專案使用）
```

## 主題

| 主題 | 入口 | 進度 |
|------|------|------|
| EF Core | [ef-core/index.html](ef-core/index.html)（[純文字](ef-core/README.md)） | 入門、L00、L01 已推出 |

## 慣例

- 每個單元都有 `.html`（圖解、給人讀）與 `.md`（純文字、方便搜尋）兩個版本，HTML 是另外設計的，不是從 md 轉出來。
- 教學使用通用範例（例如官方的 Blog / Post / Tag），不綁定特定專案。
- 敘事方式：從情境出發，每一節解決上一節留下的問題。
- 新增主題：建立 `<主題>/`，放 `index.html`（路線圖）、單元頁、`lab/`（練習專案），並在首頁加一張主題卡片。
- 頁面引用 `../assets/learn.css` 與 `learn.js`；圖表與程式碼上色需要網路（CDN）。

## 練習專案

```bash
cd ef-core/lab/EfCoreLab
dotnet run -- reset     # 建立資料庫 EfCoreLab 並放入範例資料
dotnet run -- L01       # 執行第 1 課
```

詳見 [ef-core/lab/README.md](ef-core/lab/README.md)。

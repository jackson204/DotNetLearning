# 零散筆記

不成系列、但以後可能用得到的知識點。一篇一個主題，依分類放在子資料夾。

## 怎麼寫

- 位置：`notes/<分類>/<主題>.md`，例如 `notes/dotnet-cli/dotnet-new-gitignore.md`
- 格式：標題 → 標籤 / 最後更新 → 重點摘要（3–5 行）→ 詳細說明 → 範例 → 參考資料
- 新增後在下方索引加一行：`- [標題](路徑) — #tag 一句話摘要`
- 查找：用標籤或錯誤訊息原文，在 Rider「Find in Files」或 `git grep "<關鍵字>" -- notes/`

## 索引

### dotnet-cli

- [用 `dotnet new gitignore` 產生 .gitignore](dotnet-cli/dotnet-new-gitignore.md) — #dotnet-cli #git 指令用法、`--force`、已追蹤檔案用 `git rm --cached`

using System.Text;
using EfCoreLab;
using EfCoreLab.Data;
using EfCoreLab.Lessons;

Console.OutputEncoding = Encoding.UTF8;

// 課程 slug（與 course/toc.json 的 lab 欄位一致）→ (標題, 範例, 練習解答)
var lessons = new Dictionary<string, (string Title, Action<LabContext> Examples, Action<LabContext> Exercises)>(
    StringComparer.OrdinalIgnoreCase)
{
    ["ado"] = ("ADO.NET：最原始的寫法（不用 EF Core）", AdoNet.Run, AdoNet.Exercises),
    ["linq-select"] = ("Select 投影：SELECT ↔ ToList / Select", LinqSelect.Run, LinqSelect.Exercises),
};

var command = args.FirstOrDefault(a => !a.StartsWith("--"));

if (command is null)
{
    Console.WriteLine(@"用法：
  dotnet run -- reset                 重建資料庫並放入範例資料
  dotnet run -- linq-select           執行該課的範例
  dotnet run -- linq-select --ex      執行該課的練習解答
  dotnet run -- linq-select --log     同時印出 EF 送到資料庫的 SQL 紀錄

目前的課程：");
    foreach (var (code, lesson) in lessons) Console.WriteLine($"  {code,-14} {lesson.Title}");
    return;
}

if (command.Equals("reset", StringComparison.OrdinalIgnoreCase))
{
    using var db = new LabContext();
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    Seed.Run(db);
    Console.WriteLine("資料庫 EfCoreLab 已重建，範例資料已放入。");
    return;
}

if (!lessons.TryGetValue(command, out var selected))
{
    Console.WriteLine($"找不到課程 {command}。不帶參數執行可以看到課程清單。");
    return;
}

using (var db = new LabContext())
{
    // 第一次執行時自動建立資料庫並放入範例資料
    if (db.Database.EnsureCreated()) Seed.Run(db);
}

var showExercises = args.Contains("--ex");
LabContext.LogSql = args.Contains("--log");   // 只記錄課程本身的查詢，不含上面的建庫檢查
using (var db = new LabContext())
{
    Lab.Lesson(command.ToLower(), selected.Title + (showExercises ? "（練習解答）" : ""));
    if (showExercises) selected.Exercises(db);
    else selected.Examples(db);
}

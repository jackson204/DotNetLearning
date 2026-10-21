using EfCoreLab.Models;

namespace EfCoreLab.Data;

// 固定的範例資料。資料庫重建後逐筆新增（每筆各自 SaveChanges），確保每次的 Id 都一樣（Blog 1–3、Post 1–10…）
public static class Seed
{
    public static void Run(LabContext db)
    {
        var devBlog = new Blog
        {
            Url = "https://devblog.example.com", Rating = 5,
            Header = new BlogHeader { Title = "Dev 日誌", Subtitle = "寫程式的日常" }
        };
        var dotnetBlog = new Blog
        {
            Url = "https://dotnet.example.com", Rating = 4,
            Header = new BlogHeader { Title = ".NET 筆記" }               // Subtitle 為 NULL
        };
        var cookingBlog = new Blog { Url = "https://cooking.example.com" }; // 沒有評分、沒有頁首
        AddOneByOne(db, devBlog, dotnetBlog, cookingBlog);

        var ming = new Author { Name = "小明", Email = "ming@example.com" };
        var hua = new Author { Name = "小華" };                             // Email 為 NULL
        var jie = new Author { Name = "阿傑", Email = "jie@example.com" };   // 還沒寫過文章
        AddOneByOne(db, ming, hua, jie);

        var efcore = new Tag { Name = "efcore" };
        var csharp = new Tag { Name = "csharp" };
        var sql = new Tag { Name = "sql" };
        var linq = new Tag { Name = "linq" };
        var cooking = new Tag { Name = "cooking" };
        var docker = new Tag { Name = "docker" };                           // 沒有文章使用
        AddOneByOne(db, efcore, csharp, sql, linq, cooking, docker);

        AddOneByOne(db,
            Post(devBlog, ming, "EF Core 入門", "從 DbContext 開始認識 EF Core", "2026-01-05", 120, efcore, csharp),
            Post(devBlog, ming, "LINQ 基礎", "Where、Select、OrderBy", "2026-01-12", 80, linq, csharp),
            Post(devBlog, hua, "SQL JOIN 圖解", "INNER JOIN 與 LEFT JOIN", "2026-02-01", 200, sql),
            Post(devBlog, ming, "草稿：Include 心得", null, "2026-02-10", 0),
            Post(dotnetBlog, hua, "C# 10 新功能", "record struct、global using", "2026-01-20", 150, csharp),
            Post(dotnetBlog, ming, "EF Core 效能調校", "AsNoTracking 與投影", "2026-02-15", 300, efcore, sql),
            Post(dotnetBlog, null, "AsNoTracking 何時用", "唯讀查詢的最佳化", "2026-03-01", 90, efcore),
            Post(dotnetBlog, hua, "SelectMany 範例", "把巢狀集合攤平", "2026-03-05", 60, linq),
            Post(cookingBlog, null, "番茄炒蛋", "先炒蛋再炒番茄", "2026-01-08", 500, cooking),
            Post(cookingBlog, null, "三杯雞", "麻油、醬油、米酒各一杯", "2026-02-20", 420, cooking));
    }

    // 一次存一筆：批次新增時 SQL Server 不保證 IDENTITY 的順序
    private static void AddOneByOne<T>(LabContext db, params T[] entities) where T : class
    {
        foreach (var entity in entities)
        {
            db.Add(entity);
            db.SaveChanges();
        }
    }

    private static Post Post(Blog blog, Author? author, string title, string? content,
        string publishedOn, int views, params Tag[] tags) => new()
    {
        Blog = blog,
        Author = author,
        Title = title,
        Content = content,
        PublishedOn = DateTime.Parse(publishedOn),
        Views = views,
        Tags = tags.ToList()
    };
}

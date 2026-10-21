using EfCoreLab.Data;
using Microsoft.EntityFrameworkCore;

namespace EfCoreLab.Lessons;

// 第 1 課：SELECT 取資料 ↔ ToList / Select 投影
// 對應文件：MyBoards/docs/notes/ef-core/lessons/L01-select.html
// 對應 SQL：Lessons/L01.sql（可在 Rider Database 視窗直接執行）
public static class L01_Select
{
    public static void Run(LabContext db)
    {
        // ① 取出整張表
        Lab.Step("① 取出所有部落格（整張表、全部欄位）");
        Lab.Sql("SELECT * FROM Blogs;");
        Lab.Linq("db.Blogs.ToList()");
        var allBlogs = db.Blogs;
        Lab.Generated(allBlogs);
        Lab.Table(allBlogs.ToList());
        Lab.Note("EF 不會送出 SELECT *，而是把 Blog 的每個欄位都列出來。");

        // ② 只取需要的欄位
        Lab.Step("② 只取需要的欄位：編號和網址");
        Lab.Sql("SELECT BlogId, Url FROM Blogs;");
        Lab.Linq("db.Blogs.Select(b => new { b.BlogId, b.Url }).ToList()");
        var idAndUrl = db.Blogs.Select(b => new { b.BlogId, b.Url });
        Lab.Generated(idAndUrl);
        Lab.Table(idAndUrl.ToList());
        Lab.Note("Select 裡寫幾個屬性，SQL 就只查幾個欄位。");
        Lab.Note("順序跟 ① 不一樣了！沒寫 ORDER BY 時，資料庫不保證回傳順序（第 3 課會講）。");

        // ③ 欄位改名
        Lab.Step("③ 欄位改名：把 Url 叫做 Address");
        Lab.Sql("SELECT Url AS Address, Rating FROM Blogs;");
        Lab.Linq("db.Blogs.Select(b => new { Address = b.Url, b.Rating }).ToList()");
        var renamed = db.Blogs.Select(b => new { Address = b.Url, b.Rating });
        Lab.Generated(renamed);
        Lab.Table(renamed.ToList());

        // ④ 計算出來的欄位
        Lab.Step("④ 計算出來的欄位：標題長度、瀏覽數加倍");
        Lab.Sql("SELECT Title, LEN(Title) AS TitleLength, Views * 2 AS DoubleViews FROM Posts;");
        Lab.Linq("db.Posts.Select(p => new { p.Title, TitleLength = p.Title.Length, DoubleViews = p.Views * 2 }).ToList()");
        var computed = db.Posts.Select(p => new { p.Title, TitleLength = p.Title.Length, DoubleViews = p.Views * 2 });
        Lab.Generated(computed);
        Lab.Table(computed.ToList());
        Lab.Note("C# 的 .Length 被翻成 SQL Server 的 LEN()，在資料庫端計算。");

        // ⑤ 只要一個欄位 → 得到簡單型別的清單
        Lab.Step("⑤ 只要一個欄位：所有作者的名字");
        Lab.Sql("SELECT Name FROM Authors;");
        Lab.Linq("db.Authors.Select(a => a.Name).ToList()   // 型別是 List<string>");
        var names = db.Authors.Select(a => a.Name);
        Lab.Generated(names);
        Lab.Table(names.ToList());

        // ⑥ 投影成自己定義的類別（DTO）
        Lab.Step("⑥ 投影成自己定義的類別（DTO）");
        Lab.Sql("SELECT BlogId, Url FROM Blogs;");
        Lab.Linq("db.Blogs.Select(b => new BlogSummary(b.BlogId, b.Url)).ToList()");
        var dtos = db.Blogs.Select(b => new BlogSummary(b.BlogId, b.Url));
        Lab.Generated(dtos);
        Lab.Table(dtos.ToList());
        Lab.Note("API 回傳給前端時，通常回傳 DTO 而不是 Entity。");
    }

    public static void Exercises(LabContext db)
    {
        Lab.Step("練習 1：列出所有文章的標題和瀏覽數");
        Lab.Sql("SELECT Title, Views FROM Posts;");
        var q1 = db.Posts.Select(p => new { p.Title, p.Views });
        Lab.Linq("db.Posts.Select(p => new { p.Title, p.Views }).ToList()");
        Lab.Generated(q1);
        Lab.Table(q1.ToList());

        Lab.Step("練習 2：列出所有標籤名稱（只要名稱的清單）");
        Lab.Sql("SELECT Name FROM Tags;");
        var q2 = db.Tags.Select(t => t.Name);
        Lab.Linq("db.Tags.Select(t => t.Name).ToList()");
        Lab.Generated(q2);
        Lab.Table(q2.ToList());

        Lab.Step("練習 3：列出文章標題，以及「有沒有內容」");
        Lab.Sql("SELECT Title, CASE WHEN Content IS NULL THEN 0 ELSE 1 END AS HasContent FROM Posts;");
        var q3 = db.Posts.Select(p => new { p.Title, HasContent = p.Content != null });
        Lab.Linq("db.Posts.Select(p => new { p.Title, HasContent = p.Content != null }).ToList()");
        Lab.Generated(q3);
        Lab.Table(q3.ToList());
    }

    public record BlogSummary(int Id, string Url);
}

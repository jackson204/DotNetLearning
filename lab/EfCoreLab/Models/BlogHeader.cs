namespace EfCoreLab.Models;

// 部落格的頁首設定。與 Blog 一對一，外鍵放在這一側
public class BlogHeader
{
    public int BlogHeaderId { get; set; }
    public string Title { get; set; } = null!;
    public string? Subtitle { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; } = null!;
}

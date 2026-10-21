namespace EfCoreLab.Models;

// 部落格。關聯：一對一 BlogHeader、一對多 Post
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; } = null!;
    public int? Rating { get; set; }                       // 可為 NULL：還沒有人評分

    public BlogHeader? Header { get; set; }                 // 一對一
    public List<Post> Posts { get; set; } = new();          // 一對多
}

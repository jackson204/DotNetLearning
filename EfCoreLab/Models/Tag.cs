namespace EfCoreLab.Models;

// 標籤。與 Post 多對多，EF Core 自動建立中間表 PostTag
public class Tag
{
    public int TagId { get; set; }
    public string Name { get; set; } = null!;

    public List<Post> Posts { get; set; } = new();
}

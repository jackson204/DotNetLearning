namespace EfCoreLab.Models;

// 作者。一位作者寫多篇文章（一對多）
public class Author
{
    public int AuthorId { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }

    public List<Post> Posts { get; set; } = new();
}

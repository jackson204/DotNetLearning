namespace EfCoreLab.Models;

// 文章。屬於一個 Blog（多對一）、可有一位 Author（多對一，可為 NULL）、多個 Tag（多對多）
public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; } = null!;
    public string? Content { get; set; }
    public DateTime PublishedOn { get; set; }
    public int Views { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; } = null!;

    public int? AuthorId { get; set; }
    public Author? Author { get; set; }

    public List<Tag> Tags { get; set; } = new();
}

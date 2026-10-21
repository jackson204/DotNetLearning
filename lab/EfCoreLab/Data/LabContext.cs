using EfCoreLab.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace EfCoreLab.Data;

public class LabContext : DbContext
{
    public const string ConnectionString =
        "Server=(localdb)\\mssqllocaldb;Database=EfCoreLab;Trusted_Connection=True;TrustServerCertificate=True;";

    // dotnet run -- <課程> --log 時開啟：印出 EF 實際送到資料庫的每一段 SQL
    public static bool LogSql { get; set; }

    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<BlogHeader> BlogHeaders => Set<BlogHeader>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlServer(ConnectionString);

        if (LogSql)
        {
            options.LogTo(
                message => Lab.Log(message),
                new[] { RelationalEventId.CommandExecuted },
                Microsoft.Extensions.Logging.LogLevel.Information,
                DbContextLoggerOptions.None);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>(eb =>
        {
            eb.Property(b => b.Url).IsRequired().HasMaxLength(200);
            eb.HasIndex(b => b.Url).IsUnique();

            eb.HasOne(b => b.Header)                       // 一對一
              .WithOne(h => h.Blog)
              .HasForeignKey<BlogHeader>(h => h.BlogId);

            eb.HasMany(b => b.Posts)                       // 一對多
              .WithOne(p => p.Blog)
              .HasForeignKey(p => p.BlogId);
        });

        modelBuilder.Entity<BlogHeader>()
            .Property(h => h.Title).IsRequired().HasMaxLength(100);

        modelBuilder.Entity<Author>(eb =>
        {
            eb.Property(a => a.Name).IsRequired().HasMaxLength(50);
            eb.HasMany(a => a.Posts)                       // 一對多（文章的作者可為 NULL）
              .WithOne(p => p.Author)
              .HasForeignKey(p => p.AuthorId)
              .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Post>(eb =>
        {
            eb.Property(p => p.Title).IsRequired().HasMaxLength(200);
            eb.Property(p => p.PublishedOn).HasColumnType("date");
            eb.HasMany(p => p.Tags).WithMany(t => t.Posts);  // 多對多
        });

        modelBuilder.Entity<Tag>(eb =>
        {
            eb.Property(t => t.Name).IsRequired().HasMaxLength(50);
            eb.HasIndex(t => t.Name).IsUnique();
        });
    }
}

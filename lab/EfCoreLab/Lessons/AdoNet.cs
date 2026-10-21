using EfCoreLab.Data;
using Microsoft.Data.SqlClient;

namespace EfCoreLab.Lessons;

// Part 2 · ADO.NET：最原始的寫法（不用 EF Core，直接送 SQL、收結果表）
// 對應文件：course/02-dotnet-and-db/02-ado-net.md
public static class AdoNet
{
    public static void Run(LabContext db)
    {
        // ① 連線：連線字串告訴驅動程式資料庫在哪裡
        using var conn = new SqlConnection(LabContext.ConnectionString);
        conn.Open();

        Lab.Step("① 送 SQL、收結果表，一列一列、一格一格讀");
        Lab.Sql("SELECT PostId, Title, Views FROM Posts WHERE BlogId = @blogId;");
        Lab.Linq("""
            var cmd = new SqlCommand("SELECT PostId, Title, Views FROM Posts WHERE BlogId = @blogId", conn);
            cmd.Parameters.AddWithValue("@blogId", 1);          // 參數化：值不會拼進 SQL 字串
            using var reader = cmd.ExecuteReader();              // 送出 SQL，拿回結果表
            while (reader.Read())                                // 游標往下移一列
            {
                var id    = (int)reader["PostId"];               // 用欄位名稱取值，自己轉型
                var title = (string)reader["Title"];
                var views = (int)reader["Views"];
            }
            """);
        using (var cmd = new SqlCommand("SELECT PostId, Title, Views FROM Posts WHERE BlogId = @blogId", conn))
        {
            cmd.Parameters.AddWithValue("@blogId", 1);
            using var reader = cmd.ExecuteReader();
            var rows = new List<(int Id, string Title, int Views)>();
            while (reader.Read())
                rows.Add(((int)reader["PostId"], (string)reader["Title"], (int)reader["Views"]));
            Lab.Table(rows.Select(r => new { r.Id, r.Title, r.Views }));
        }
        Lab.Note("結果表裡的每一格都是 object，要自己轉成 C# 型別；資料庫不知道你有沒有 Post class。");

        Lab.Step("② 欄位名稱打錯字：編譯會過，執行才爆炸");
        Lab.Linq("""var title = (string)reader["Tilte"];   // Title 拼錯了""");
        using (var cmd = new SqlCommand("SELECT TOP(1) Title FROM Posts", conn))
        using (var reader = cmd.ExecuteReader())
        {
            reader.Read();
            try
            {
                _ = (string)reader["Tilte"];
            }
            catch (IndexOutOfRangeException ex)
            {
                Lab.Note($"執行時才丟出 IndexOutOfRangeException：{ex.Message}");
            }
        }

        Lab.Step("③ NULL 讀出來不是 C# 的 null");
        Lab.Sql("SELECT Name, Email FROM Authors;");
        Lab.Linq("""
            var email = reader["Email"];                // NULL 時拿到的是 DBNull.Value
            var text  = reader.IsDBNull(1) ? "(沒有 Email)" : reader.GetString(1);
            """);
        using (var cmd = new SqlCommand("SELECT Name, Email FROM Authors", conn))
        using (var reader = cmd.ExecuteReader())
        {
            var rows = new List<(string Name, string RawType, string Email)>();
            while (reader.Read())
                rows.Add(((string)reader["Name"], reader["Email"].GetType().Name,
                    reader.IsDBNull(1) ? "(沒有 Email)" : reader.GetString(1)));
            Lab.Table(rows.Select(r => new { r.Name, 讀出來的型別 = r.RawType, r.Email }));
        }
        Lab.Note("直接 (string)reader[\"Email\"] 會在 DBNull 那一列丟 InvalidCastException。");

        Lab.Step("④ 不回傳表格的 SQL：只回「影響幾列」");
        Lab.Sql("UPDATE Posts SET Views = Views + 1 WHERE PostId = @id;");
        Lab.Linq("""
            var update = new SqlCommand("UPDATE Posts SET Views = Views + 1 WHERE PostId = @id", conn);
            update.Parameters.AddWithValue("@id", 1);
            int affected = update.ExecuteNonQuery();   // 回傳影響的列數，不是結果表
            """);
        using (var tx = conn.BeginTransaction())
        {
            using var update = new SqlCommand("UPDATE Posts SET Views = Views + 1 WHERE PostId = @id", conn, tx);
            update.Parameters.AddWithValue("@id", 1);
            var affected = update.ExecuteNonQuery();
            Lab.Note($"ExecuteNonQuery 回傳 {affected}（影響 {affected} 列）。這裡用交易 Rollback 還原，範例資料不會被改到。");
            tx.Rollback();
        }

        Lab.Step("⑤ 只要一個值：ExecuteScalar");
        Lab.Sql("SELECT COUNT(*) FROM Posts;");
        using (var cmd = new SqlCommand("SELECT COUNT(*) FROM Posts", conn))
        {
            var count = (int)cmd.ExecuteScalar()!;
            Lab.Note($"COUNT(*) = {count}。這個數字不存在任何一格裡，是資料庫當場算出來的。");
        }
    }

    public static void Exercises(LabContext db)
    {
        using var conn = new SqlConnection(LabContext.ConnectionString);
        conn.Open();

        Lab.Step("練習 1：用 ADO.NET 列出所有標籤的 TagId 與 Name");
        Lab.Sql("SELECT TagId, Name FROM Tags;");
        using (var cmd = new SqlCommand("SELECT TagId, Name FROM Tags", conn))
        using (var reader = cmd.ExecuteReader())
        {
            var rows = new List<(int TagId, string Name)>();
            while (reader.Read()) rows.Add((reader.GetInt32(0), reader.GetString(1)));
            Lab.Table(rows.Select(r => new { r.TagId, r.Name }));
        }

        Lab.Step("練習 2：找出沒有作者的文章（AuthorId 是 NULL），用 IsDBNull 判斷");
        Lab.Sql("SELECT PostId, Title, AuthorId FROM Posts;");
        using (var cmd = new SqlCommand("SELECT PostId, Title, AuthorId FROM Posts", conn))
        using (var reader = cmd.ExecuteReader())
        {
            var rows = new List<(int PostId, string Title)>();
            while (reader.Read())
                if (reader.IsDBNull(2)) rows.Add((reader.GetInt32(0), reader.GetString(1)));
            Lab.Table(rows.Select(r => new { r.PostId, r.Title }));
        }
        Lab.Note("SQL 其實可以直接寫 WHERE AuthorId IS NULL，下一個 Part 會學；這裡故意在 C# 端判斷，體會一下差別。");
    }
}

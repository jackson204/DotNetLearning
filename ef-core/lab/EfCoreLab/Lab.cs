using System.Collections;
using System.Reflection;
using Microsoft.EntityFrameworkCore;

namespace EfCoreLab;

// 主控台輸出工具：讓每課的範例都用同樣的格式呈現「說明 → SQL → LINQ → 結果」
public static class Lab
{
    public static void Lesson(string code, string title)
    {
        Console.WriteLine();
        Write(ConsoleColor.Magenta, $"══ {code}　{title} ══");
    }

    public static void Step(string title)
    {
        Console.WriteLine();
        Write(ConsoleColor.Yellow, $"▶ {title}");
    }

    // 手寫的 SQL（教學用，可貼到 Rider Database 視窗執行）
    public static void Sql(string sql) => Block("你會寫的 SQL", sql, ConsoleColor.Cyan);

    // LINQ 原始碼（用字串顯示，方便對照）
    public static void Linq(string code) => Block("LINQ", code, ConsoleColor.Green);

    // EF Core 實際會送出的 SQL
    public static void Generated<T>(IQueryable<T> query) =>
        Block("EF Core 產生的 SQL（ToQueryString）", query.ToQueryString(), ConsoleColor.DarkCyan);

    public static void Note(string text) => Write(ConsoleColor.DarkGray, "  ※ " + text);

    public static void Log(string message) => Write(ConsoleColor.DarkYellow, "  [EF log] " + message.Trim());

    // 把結果印成表格；支援匿名型別、Entity（只印基本型別的屬性）、字串或數字清單
    public static void Table<T>(IEnumerable<T> rows)
    {
        var list = rows.ToList();
        Console.WriteLine($"  結果：{list.Count} 筆");
        if (list.Count == 0) return;

        var type = typeof(T);
        if (IsSimple(type))
        {
            foreach (var item in list) Console.WriteLine("    " + Format(item));
            return;
        }

        var props = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => IsSimple(p.PropertyType))
            .ToArray();
        var cells = list.Select(row => props.Select(p => Format(p.GetValue(row))).ToArray()).ToList();
        var widths = props.Select((p, i) =>
            Math.Max(Width(p.Name), cells.Max(c => Width(c[i])))).ToArray();

        Console.WriteLine("    " + string.Join(" | ", props.Select((p, i) => Pad(p.Name, widths[i]))));
        Console.WriteLine("    " + string.Join("-+-", widths.Select(w => new string('-', w))));
        foreach (var c in cells)
            Console.WriteLine("    " + string.Join(" | ", c.Select((v, i) => Pad(v, widths[i]))));
    }

    private static void Block(string label, string body, ConsoleColor color)
    {
        Write(ConsoleColor.DarkGray, $"  ┌ {label}");
        foreach (var line in body.Trim().Split('\n'))
            Write(color, "  │ " + line.TrimEnd('\r'));
    }

    private static void Write(ConsoleColor color, string text)
    {
        var old = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.WriteLine(text);
        Console.ForegroundColor = old;
    }

    private static bool IsSimple(Type t)
    {
        t = Nullable.GetUnderlyingType(t) ?? t;
        return t.IsPrimitive || t.IsEnum || t == typeof(string) || t == typeof(decimal)
               || t == typeof(DateTime) || t == typeof(Guid);
    }

    private static string Format(object? value) => value switch
    {
        null => "NULL",
        DateTime d => d.ToString("yyyy-MM-dd"),
        bool b => b ? "true" : "false",
        IEnumerable e and not string => string.Join(", ", e.Cast<object>()),
        _ => value.ToString() ?? ""
    };

    // 中文字在主控台佔兩格寬
    private static int Width(string s) => s.Sum(ch => ch > 0x2E80 ? 2 : 1);
    private static string Pad(string s, int width) => s + new string(' ', Math.Max(0, width - Width(s)));
}

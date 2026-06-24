using System;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Project.DatabaseUtilities;
using Project.LoggingUtilities;
using Project.ServerUtilities;

class Program
{
    static void Main()
    {
        int port = 5000;

        var server = new Server(port);
        var database = new Database();

        Console.WriteLine("The server is running");
        Console.WriteLine($"Local:   http://localhost:{port}/website/pages/index.html");
        Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/index.html");

      while (true) // לולאה אינסופית כדי שהשרת ימשיך להאזין לבקשות כל הזמן
        {
            var request = server.WaitForRequest(); // מחכה עד שתגיע בקשה מהאתר

            Console.WriteLine($"Recieved a request: {request.Name}"); // מדפיס את שם הבקשה שהגיעה מה-TS

            try
            {
                if (request.Name == "getProducts") // בקשה לקבל את כל המוצרים של המשתמש המחובר
                {
                    string token = request.GetParams<string>(); // מקבל מה-TS את ה-token של המשתמש

                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    // מחפש במסד הנתונים משתמש שה-token שלו שווה ל-token שהגיע מהאתר

                    if (user == null) // אם לא נמצא משתמש עם ה-token הזה
                    {
                        request.SetStatusCode(401); // 401 אומר שהמשתמש לא מורשה
                        request.Respond(new System.Collections.Generic.List<Product>()); // מחזיר רשימה ריקה
                    }
                    else
                    {
                        var userProducts = database.Products
                            .Where(p => p.UserId == user.Id.ToString())
                            .ToList();
                        // מחפש את כל המוצרים ששייכים למשתמש המחובר לפי ה-Id שלו

                        request.Respond(userProducts); // מחזיר ל-TS את רשימת המוצרים
                    }
                }

                else if (request.Name == "getProductById") // בקשה לקבל מוצר אחד לפי ה-Id שלו
                {
                    int id = request.GetParams<int>(); // מקבל מה-TS את ה-Id של המוצר

                    var product = database.Products.Find(id);
                    // מחפש במסד הנתונים מוצר עם ה-Id הזה

                    if (product == null) // אם לא נמצא מוצר
                    {
                        request.SetStatusCode(404); // 404 אומר שהמוצר לא נמצא
                        request.Respond(""); // מחזיר תשובה ריקה
                    }
                    else
                    {
                        request.Respond(product); // מחזיר את המוצר שנמצא
                    }
                }

                else if (request.Name == "addProduct") // בקשה להוסיף מוצר חדש ל-wishlist
                {
                    var (name, price, imageUrl, pageUrl, description, userToken) =
                        request.GetParams<(string, double, string, string, string, string)>();
                    // מקבל מה-TS את כל פרטי המוצר ואת ה-token של המשתמש

                    var user = database.Users.FirstOrDefault(u => u.Token == userToken);
                    // מחפש איזה משתמש מחובר לפי ה-token שנשלח

                    if (user == null) // אם לא נמצא משתמש
                    {
                        request.SetStatusCode(401); // המשתמש לא מורשה
                        request.Respond("User unauthorized"); // מחזיר הודעת שגיאה ל-TS
                    }
                    else
                    {
                        var product = new Product(
                            name,
                            price,
                            imageUrl,
                            pageUrl,
                            description,
                            user.Id.ToString()
                        );
                        // יוצר מוצר חדש ושומר בו את ה-Id של המשתמש שאליו הוא שייך

                        database.Products.Add(product); // מוסיף את המוצר למסד הנתונים
                        database.SaveChanges(); // שומר את השינוי בפועל ב-database

                        request.Respond("Product added"); // מחזיר ל-TS שהמוצר נוסף בהצלחה
                    }
                }

                else if (request.Name == "deleteProduct") // בקשה למחוק מוצר
                {
                    int id = request.GetParams<int>(); // מקבל מה-TS את ה-Id של המוצר למחיקה

                    var product = database.Products.Find(id);
                    // מחפש את המוצר לפי ה-Id שלו

                    if (product != null) // אם המוצר נמצא
                    {
                        database.Products.Remove(product); // מוחק את המוצר מהמסד
                        database.SaveChanges(); // שומר את המחיקה במסד הנתונים

                        request.Respond("Product deleted"); // מחזיר הודעה שהמוצר נמחק
                    }
                    else
                    {
                        request.SetStatusCode(404); // אם המוצר לא נמצא
                        request.Respond(""); // מחזיר תשובה ריקה
                    }
                }

                else if (request.Name == "signUp") // בקשה להרשמה של משתמש חדש
                {
                    var (username, password) = request.GetParams<(string, string)>();
                    // מקבל מה-TS שם משתמש וסיסמה

                    var existingUser = database.Users.FirstOrDefault(u => u.Username == username);
                    // בודק אם כבר קיים משתמש עם אותו username

                    if (existingUser != null) // אם המשתמש כבר קיים
                    {
                        request.Respond<string?>(null); // מחזיר null כדי להגיד ל-TS שההרשמה נכשלה
                        continue; // עובר לבקשה הבאה ולא ממשיך את שאר הקוד
                    }

                    string token = Guid.NewGuid().ToString();
                    // יוצר token חדש וייחודי למשתמש

                    var newUser = new User(username, password, token);
                    // יוצר אובייקט חדש של משתמש עם שם, סיסמה ו-token

                    database.Users.Add(newUser); // מוסיף את המשתמש למסד הנתונים
                    database.SaveChanges(); // שומר את המשתמש בפועל ב-database

                    Console.WriteLine("New user saved: " + username);
                    Console.WriteLine("Token saved: " + token);

                    request.Respond(token); // מחזיר ל-TS את ה-token כדי לשמור אותו ב-localStorage
                }

                else if (request.Name == "logIn") // בקשה להתחברות
                {
                    var (username, password) = request.GetParams<(string, string)>();
                    // מקבל מה-TS שם משתמש וסיסמה

                    var user = database.Users.FirstOrDefault(
                        u => u.Username == username && u.Password == password
                    );
                    // מחפש משתמש שהשם והסיסמה שלו מתאימים למה שהוזן באתר

                    if (user == null) // אם לא נמצא משתמש מתאים
                    {
                        request.Respond<string?>(null); // מחזיר null כדי להגיד שההתחברות נכשלה
                        continue; // עובר לבקשה הבאה
                    }

                    request.Respond(user.Token); // אם ההתחברות הצליחה, מחזיר ל-TS את ה-token של המשתמש
                }

                else if (request.Name == "getUser") // בקשה לקבל את פרטי המשתמש המחובר
                {
                    string token = request.GetParams<string>(); // מקבל מה-TS את ה-token

                    var user = database.Users.FirstOrDefault(u => u.Token == token);
                    // מחפש משתמש לפי ה-token

                    if (user == null) // אם לא נמצא משתמש
                    {
                        request.Respond<User?>(null); // מחזיר null
                        continue; // עובר לבקשה הבאה
                    }

                    request.Respond(user); // מחזיר ל-TS את פרטי המשתמש
                }
            }
            catch (Exception exception) // אם קרתה שגיאה כלשהי בזמן טיפול בבקשה
            {
                request.SetStatusCode(500); // 500 אומר שגיאה פנימית בשרת
                request.Respond("Internal Server Error"); // מחזיר הודעת שגיאה כללית לאתר
                Log.WriteException(exception); // שומר את פרטי השגיאה בלוג
            }
        }
    }
}

class Database : DatabaseCore // מחלקה שמייצגת את מסד הנתונים של האתר
{
    public Database() : base("database") { }
    // שולח למחלקת האב את שם מסד הנתונים

    public DbSet<Product> Products { get; set; } = default!;
    // טבלה של מוצרים במסד הנתונים

    public DbSet<User> Users { get; set; } = default!;
    // טבלה של משתמשים במסד הנתונים
}

class Product(string name, double price, string imageUrl, string pageUrl, string description, string userId)
{
    public int Id { get; set; } = default!;
    // מזהה ייחודי של המוצר במסד הנתונים

    public string Name { get; set; } = name;
    // שם המוצר

    public double Price { get; set; } = price;
    // מחיר המוצר

    public string ImageUrl { get; set; } = imageUrl;
    // קישור לתמונה של המוצר

    public string PageUrl { get; set; } = pageUrl;
    // קישור לעמוד של המוצר באתר חיצוני

    public string Description { get; set; } = description;
    // תיאור המוצר

    public string UserId { get; set; } = userId;
    // ה-Id של המשתמש שהמוצר שייך אליו

    public User? User { get; set; } = default!;
    // קישור אפשרי לאובייקט המשתמש עצמו דרך Entity Framework
}

class User(string username, string password, string token)
{
    public int Id { get; set; } = default!;
    // מזהה ייחודי של המשתמש במסד הנתונים

    public string Username { get; set; } = username;
    // שם המשתמש

    public string Password { get; set; } = password;
    // סיסמת המשתמש

    public string Token { get; set; } = token;
}
    // token שמזהה את המשתמש אחרי התחברות
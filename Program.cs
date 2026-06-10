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

    while (true)
    {
      var request = server.WaitForRequest();

      Console.WriteLine($"Recieved a request: {request.Name}");

      try
      {
        // --- קבלת מוצרים: מסונן לפי ה-Id המספרי של המשתמש ---
        if (request.Name == "getProducts")
        {
          string token = request.GetParams<string>();
          var user = database.Users.FirstOrDefault(u => u.Token == token);

          if (user == null)
          {
            request.SetStatusCode(401); 
            request.Respond(new System.Collections.Generic.List<Product>()); 
          }
          else
          {
            // 🔥 שינוי: מסננים לפי ה-Id של המשתמש (הופכים אותו לטקסט שיתאים לשדה UserId)
            var userProducts = database.Products.Where(p => p.UserId == user.Id.ToString()).ToList();
            request.Respond(userProducts);
          }
        }

        else if (request.Name == "getProductById")
        {
          int id = request.GetParams<int>();
          var product = database.Products.Find(id);

          if (product == null)
          {
            request.SetStatusCode(404);
            request.Respond("");
          }
          else
          {
            request.Respond(product);
          }
        }

        // --- הוספת מוצר: מקושר ל-Id המספרי של המשתמש ---
        else if (request.Name == "addProduct")
        {
          var (name, price, imageUrl, pageUrl, description, userToken) = request.GetParams<(string, double, string, string, string, string)>();
          
          var user = database.Users.FirstOrDefault(u => u.Token == userToken);

          if (user == null)
          {
            request.SetStatusCode(401);
            request.Respond("User unauthorized");
          }
          else
          {
            // 🔥 שינוי: שומרים במוצר את ה-Id המספרי של המשתמש (user.Id.ToString()) במקום את ה-Username!
            var product = new Product(name, price, imageUrl, pageUrl, description, user.Id.ToString());
            database.Products.Add(product);
            database.SaveChanges();
            request.Respond("Product added");
          }
        }

        else if (request.Name == "deleteProduct")
        {
          int id = request.GetParams<int>();
          var product = database.Products.Find(id);

          if (product != null)
          {
            database.Products.Remove(product);
            database.SaveChanges();
            request.Respond("Product deleted");
          }
          else
          {
            request.SetStatusCode(404);
            request.Respond("");
          }
        }

        // --- הרשמה ---
        else if (request.Name == "signUp")
        {
          var (username, password) = request.GetParams<(string, string)>();
          var existingUser = database.Users.FirstOrDefault(u => u.Username == username);

          if (existingUser != null)
          {
            request.Respond(""); 
          }
          else
          {
            string actualToken = Guid.NewGuid().ToString();
            var newUser = new User(username, password, actualToken);
            
            database.Users.Add(newUser);
            database.SaveChanges();

            request.Respond(actualToken);
          }
        }

        // --- התחברות ---
        else if (request.Name == "logIn")
        {
          var (username, password) = request.GetParams<(string, string)>();
          var user = database.Users.FirstOrDefault(u => u.Username == username && u.Password == password);

          if (user == null)
          {
            request.Respond(""); 
          }
          else
          {
            request.Respond(user.Token);
          }
        }

        else if (request.Name == "getUser")
        {
          string token = request.GetParams<string>();
          var user = database.Users.FirstOrDefault(u => u.Token == token);
          
          if (user == null) 
          {
            request.Respond("");
          }
          else 
          {
            request.Respond(user);
          }
        }

      }
      catch (Exception exception)
      {
        request.SetStatusCode(500);
        request.Respond("Internal Server Error");
        Log.WriteException(exception);
      }
    }
  }
}

class Database : DatabaseCore
{
  public Database() : base("database") { }
  public DbSet<Product> Products { get; set; } = default!;
  public DbSet<User> Users { get; set; } = default!; 
}

class Product(string name, double price, string imageUrl, string pageUrl, string description, string userId)
{
  public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public double Price { get; set; } = price;
  public string ImageUrl { get; set; } = imageUrl;
  public string PageUrl { get; set; } = pageUrl;
  public string Description { get; set; } = description;
  public string UserId { get; set; } = userId; 

  public User? User { get; set; } = default!;
}

class User(string username, string password, string token)
{
  public int Id { get; set; } = default!;
  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
  public string Token { get; set; } = token;
}
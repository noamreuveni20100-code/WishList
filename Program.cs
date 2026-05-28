using System;
using System.Linq; // חשוב מאוד בשביל ה-Where וה-FirstOrDefault
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
        // --- קבלת מוצרים: מסונן לפי המשתמש המחובר ---
        if (request.Name == "getProducts")
        {
          string token = request.GetParams<string>();
          
          // מחזיר רק את המוצרים ששייכים לטוקן של המשתמש הזה
          var userProducts = database.Products.Where(p => p.UserToken == token).ToList();
          request.Respond(userProducts);
        }

        else if (request.Name == "getProductById")
        {
          int id = request.GetParams<int>();
          var product = database.Products.Find(id);

          if (product == null)
          {
            request.SetStatusCode(404);
          }
          else
          {
            request.Respond(product);
          }
        }

        // --- הוספת מוצר: מקבל גם את הטוקן של המשתמש ---
        else if (request.Name == "addProduct")
        {
          var (name, price, imageUrl, pageUrl, description, userToken) = request.GetParams<(string, double, string, string, string, string)>();
          var product = new Product(name, price, imageUrl, pageUrl, description, userToken);
          database.Products.Add(product);
          database.SaveChanges();
        }

        else if (request.Name == "deleteProduct")
        {
          int id = request.GetParams<int>();
          var product = database.Products.Find(id);

          if (product != null)
          {
            database.Products.Remove(product);
            database.SaveChanges();
          }
        }

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
            var newUser = new User(username, password);
            database.Users.Add(newUser);
            database.SaveChanges();

            string token = newUser.Username; 
            request.Respond(token);
          }
        }

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
            string token = user.Username;
            request.Respond(token);
          }
        }

        else if (request.Name == "getUser")
        {
          string token = request.GetParams<string>();
          var user = database.Users.FirstOrDefault(u => u.Username == token);
          
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
        Log.WriteException(exception);
      }
    }
  }
}

class Database() : DatabaseCore("database")
{
  public DbSet<Product> Products { get; set; } = default!;
  public DbSet<User> Users { get; set; } = default!; 
}

class Product(string name, double price, string imageUrl, string pageUrl, string description, string userToken)
{
  public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public double Price { get; set; } = price;
  public string ImageUrl { get; set; } = imageUrl;
  public string PageUrl { get; set; } = pageUrl;
  public string Description { get; set; } = description;
  public string UserToken { get; set; } = userToken; // השדה החדש שמחבר את המוצר למשתמש
}

class User(string username, string password)
{
  public int Id { get; set; } = default!;
  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
}
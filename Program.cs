using System;
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
        if (request.Name == "getProducts")
        {
          request.Respond(database.Products);
        }
        else if (request.Name == "addProduct")
        {
          var (name, price, imageUrl, description) = request.GetParams<(string, double, string, string)>();
          var product = new Product(name, price, imageUrl, description);
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
}


class Product(string name, double price, string imageUrl, string description)
{
  public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public double Price { get; set; } = price;
  public string ImageUrl { get; set; } = imageUrl;
  public string Description { get; set; } = description;
}


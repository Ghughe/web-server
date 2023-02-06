const logEvents = require("./logEvents");
const path = require("path");
const http = require("http");
const fs = require("fs");
const fsPromises = require("fs").promises;
const EventEmitter = require("events");

class Emitter extends EventEmitter {}
const myEmitter = new Emitter();
myEmitter.on("log", (msg) => logEvents(msg));
const PORT = process.env.PORT || 5000;
const serveFile = async (filePath, contentType, response) => {
  try {
    const data = await fsPromises.readFile(filePath, "utf8");
    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.end();
  }
};
const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  const extension = path.extname(req.url);
  let contentType;
  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;
    case ".js":
      contentType = "text/javascript";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".jpg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    default:
      contentType = "text/html";
  }
  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "views", "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, "views", req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "views", req.url)
      : path.join(__dirname, req.url);
  if (!extension && req.url.slice(-1) !== "/") filePath += ".html";
  const fileExit = fs.existsSync(filePath);
  if (fileExit) {
    serveFile(filePath, contentType, res);
  } else {
    switch (path.parse(filePath).base) {
      case "old-page.html":
        res.writeHead(300, { Location: "/ new-page.html" });
        res.end();
        break;
      case "www-page.html":
        res.writeHead(300, { Location: "/" });
        res.end();
        break;
      default:
        serveFile(
          path.join(__dirname, "views", "404.html"),
          "text/html",
          contentType,
          res
        );
    }
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

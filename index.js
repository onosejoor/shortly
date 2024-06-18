import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import {dirname} from "path";
import {fileURLToPath} from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
// For short URL //
let basrUrl = "https://cleanuri.com/api/v1/shorten";


app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// to render home page
app.get("/", (req, res) => {
  res.render("index.ejs", {
    url: url
  });
});

// to create short url
app.post("/short", async (req, res) => {

  try {

  let userUrl = req.body.longUrl;

  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    }
    return str;
}

let cater = truncateString(userUrl, 30);
  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const response = await axios.post(basrUrl, `url=${userUrl
  }`, headersList);

  let result = response.data;

  let url = [];
  url.push({id: url.length+1, long: cater, short: result.result_url});
  res.redirect("/");    

  } catch (error) {
    res.render("index.ejs", {
      url: url,
      error: error.message
    });
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port} ✌`);
});

export default app;
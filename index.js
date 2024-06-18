import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


const app = express();
const port = 3000;
// For short URL //
let basrUrl = "https://cleanuri.com/api/v1/shorten";

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


let url = []
// to render home page
app.get("/", (req, res) => {
  res.render("index", {
    url: url
  });
  console.log(url);
});

// to create short url
app.post("/short", async (req, res) => {

  try {

  let userUrl = req.body.longUrl;
console.log(userUrl);

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
  console.log(response, response.data);

  let result = response.data;

  url.push({id: url.length+1, long: cater, short: result.result_url});
  res.redirect("/");    

  } catch (error) {
    res.render("index.ejs", {
      url: url,
    });
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port} ✌`);
});

export default app;
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import session from "express-session";
import ejs from "ejs";
import { login } from "../auth/login.js";
import passport, { query } from "../auth/passport.js";
import registerUser from "../auth/register.js";
import { google } from "../auth/google.js";
import { isValidURL } from "../auth/passport.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { supabase } from "../auth/supabase.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// For short URL //
let basrUrl = "https://cleanuri.com/api/v1/shorten";

// express and body parser middle ware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// session middle ware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.engine("ejs", ejs.__express); // Add this line to set the templating engine
app.set("views", __dirname + "/views");

let pass;
let url = [];
// to render home page

app.get("/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      pass = req.user;
      // selects users links based on their email
      const query2 = await query(pass);
      url = query2;

      // render home page
      res.render("index.ejs", {
        url: url,
      });
    } else {
      res.render("index.ejs");
    }
  } catch (error) {
    res.render("index.ejs", { error: error });
  }
});

// get register page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// get login page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/short", (req, res) => {
  res.redirect("/");
});

app.get(
  "/oauth/google/shortly",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.post("/register", async (req, res) => {
  try {
    //   get user email and password
    const username = req.body.email;
    const password = req.body.password;

    // use imported logic to register user
    await registerUser(username, password, (error, user) => {
      if (error) {
        res.render("register.ejs", {
          error: error,
        });
      } else {
        req.login(user.email, (error) => {
          // log's in user
          if (error) {
            console.log(error);
          } else {
            pass = user.email;
            res.redirect("/");
          }
        });
      }
    });
  } catch (error) {
    res.render("register.ejs", {
      error: error.message,
    });
    console.log(error);
  }
});

// to handle login route
app.post("/login", login);

app.post("/delete", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      // to get user id to delete
      let deleteValue = req.body.deletedId;

      //  query to delete
      supabase.from("links").delete().eq("1d, $1", [deleteValue]);

      res.redirect("/");

      // error handler
    } catch (error) {
      console.log(error);
      res.render("index.ejs", {
        url: url,
        error: error.message,
      });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/delete", (req, res) => {
  res.redirect("/");
});

app.get("/oauth/google", google);

// to create short url
app.post("/short", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      try {
        // to get current user email
        let user = req.user;
        pass = user;

        // user longUrl
        let userUrl = req.body.longUrl;

        // header for post requests
        let headersList = {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
        };
        isValidURL(userUrl);

        try {
          // API
          const response = await axios.post(
            basrUrl,
            `url=${userUrl}`,
            headersList
          );

          // API result
          let result = response.data;

          // insert into database
          await supabase.from("links").insert({
            long_link: userUrl,
            short_link: result.result_url,
            email: user,
          });

          // redirect to home page
          res.redirect("/");
        } catch (error) {
          res.render("index.ejs", {
            error: "This link can't be shortened",
            url: url,
          });
        }

        // to catch possible error
      } catch (error) {
        res.render("index.ejs", {
          error: error.message || "This link can't be shortened",
          url: url,
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render("index.ejs", { error: error });
  }
});

// serializes user session into local storage
passport.serializeUser((user, cb) => {
  cb(null, user);
});

// deSerializes user session into local storage
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port} ✌`);
});

export default app;

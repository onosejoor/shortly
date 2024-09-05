import passport from "./passport.js";
import express from "express";
import ejs from "ejs"
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("view engine", "ejs");
app.engine("ejs", ejs.__express); // Add this line to set the templating engine
app.set("views", __dirname + "/views");

export const google = app.get("/oauth/google", (req, res, next) => {
  passport.authenticate("google", (user, info, err) => {
    if (err) {
      res.render("index.ejs", {
        error: err.message,
      });
    }
    if (!user) {
      res.render("index.ejs", {
        err: info.message,
      });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err, false);
      } else {
        next(null, user);
        res.redirect("/");
      }
    });
  })(req, res, next);
});

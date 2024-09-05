import passport from "./passport.js";
import express from "express";
const app = express();

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

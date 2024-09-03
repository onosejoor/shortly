import passport from "./passport.js";
import express from "express";
const app = express();

export const login =  app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      // Handle server error 
      return next(err);
    }
    if (!user) {
      // Authentication failed; render the login form with an error message
      return res.render("login.ejs", { error: info.message });
    }
    req.login(user, (error) => {
      // log's in user
      if (error) {
      } else {
        next(null, user);
        res.redirect("/");
      }
    });
  })(req, res, next);
});
import passport from "./passport.js";
import express from "express";
const app = express();

export const google = app.get("/oauth/google", passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login"
}));
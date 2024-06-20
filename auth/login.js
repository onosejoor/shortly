import passport from "./passport.js";
import express from "express";
const app = express();

export const login = app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}));
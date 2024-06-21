import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import GoogleStrategy from "passport-google-oauth20";
import env from "dotenv";
import pg from "pg";
env.config();

const db = new pg.Client({
  user: process.env.USER_NAME,
  host: process.env.HOST,
  password: process.env.PASSWORD,
  database: process.env.DATA_BASE,
  port: process.env.PORT,
});

db.connect();

export function isValidURL(str) {
  if(/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(str)) {
console.log('YES');
   } else {
    throw new Error ("invalid Email!");
   }
}

export function truncateString(str, maxLength) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  }
  return str;
}

export async function query(currUserEmail) {
  let result = await db.query(
    "select links.id, longLink, shortLink from links join users on links.user_email = users.email where users.email = $1",
    [currUserEmail]
  );
  let response = result.rows;
  return response;
}

// google autheticator
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/oauth/google",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log(profile.emails[0]);
      try {
        let userEmail = profile.emails[0];
        let result = await db.query("select *  from users where email = $1", [
          userEmail.value,
        ]);
        if (result.rows.length === 0) {
          let insert = await db.query(
            "insert into users (email, password) values($1, $2) returning *",
            [userEmail.value, "google"]
          );
          let secIn = insert.rows[0]
          return cb(null, secIn.email);

        } else {
          return cb(null, userEmail.value);
        }
      } catch (error) {
        return cb(error);
      }
    }
  )
);

// passport authenticator

passport.use(
  "local",
  // new strategy (local)
  new Strategy(async function verify(username, password, cb) {
    try {
      // select data from table

      let user = await db.query("select *  from users where email = $1", [
        username,
      ]);
      // database result
      let response = user.rows;

      // to check is database result is not null
      if (response.length === 0) {
        // throw new Error(`${username} is not registered on Shortly!`);
        return cb(null, false);
      }

      try {
        //  to validate email
        bcrypt.compare(password, response[0].password, (err, result) => {
          // logics
          if (err) {
            // return cb(call back error)
            return err;
          } else {
            if (result) {
              return cb(null, response[0].email);
            } else {
              return cb(null, false);
            }
          }
        });

        // first error handler
      } catch (error) {
        console.log(error);
        return error;
      }

      // second handler
    } catch (error) {
      console.log(error);
      return error;
    }
  })
);

export default passport;
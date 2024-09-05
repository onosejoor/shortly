import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import GoogleStrategy from "passport-google-oauth20";
import env from "dotenv";
import pg from "pg";
env.config();

const db = new pg.Client({
  connectionString: process.env.CONNECTION_STRING,
});

db.connect();

export function isValidURL(str) {
  if (
    /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
      str
    )
  ) {
    console.log("YES");
  } else {
    throw new Error("invalid URL!");
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
    "select links.id, long_link, short_link from links join users on links.email = users.email where users.email = $1",
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
      callbackURL: "https://shortly-g16.vercel.app/oauth/google",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
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
          let secIn = insert.rows[0];
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
       return cb(null, false, {message: `${username} is not registered on Shortly!`});
      }

      try {
        //  to validate password
        bcrypt.compare(password, response[0].password, (err, result) => {
          // logics
          if (err) {
            // return cb(call back error)
            return cb(err );
          } else {
            if (result) {
              return cb(null, response[0].email);
            } else {
              return cb(null, false, {message: "Incorrect Password"});
            }
          }
        });

        // first error handler
      } catch (error) {

        return cb(error);
      }

      // second handler
    } catch (error) {
      console.log(error);
      cb( error);
    }
  })
);

export default passport;

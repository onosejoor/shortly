import pg from "pg";
import env from "dotenv";
import bcrypt from "bcrypt";
env.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DATA_BASE,
  port: process.env.DB_PORT,
});

db.connect();

const saltRounds = 10;
async function registerUser(username, password, cb) {
  try {

    let user = await db.query("select *  from users where email = $1", [
      username,
    ]);

    if (user.rows.length > 0) {
        cb(`Email ${username} is already registered`);
    } else {
      // to insert into data
      try {
        // password hashing
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          // if error
          if (err) {
            return err;
          } else {
            // insert hashed password into database
            const result = await db.query(
              "insert into users (email, password) values($1, $2) returning *",
              [username, hash]
            );
            let user = result.rows[0];
            // redirect to secrets page after login
            console.log(user);
            return cb(null, user);
          }
        });

        // second error handler
      } catch (error) {
        console.log(error);
        return error;
      }
    }

    //  to catch error
  } catch (error) {
    cb(error);
    console.log(error);
  }
}

export default registerUser;

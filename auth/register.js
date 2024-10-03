import bcrypt from "bcrypt";
import { supabase } from "./supabase.js";

const saltRounds = 10;
async function registerUser(username, password, cb) {
  try {

    let {data, error} = await supabase.from("users").select("*").eq("email, $1", [username])

    if (error) {
      cb("Error validating user, check network connectivity");
    }

    if (data.length > 0) {
        cb(`Email ${username} is already registered`);
    } else {
      // to insert into database
      try {
        // password hashing
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          // if error
          if (err) {
            return err;
          } else {
            // insert hashed password into database
            const {data, error} = await supabase.from("users").insert({
              email: username, password: hash
            }).select("*")

            let user = data[0];
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

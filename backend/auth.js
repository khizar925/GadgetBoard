// auth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const created_at = new Date();
        const role = "user";

        const existingUser = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        let user;

        if (existingUser.rowCount > 0) {
          user = existingUser.rows[0];
        } else {
          const insert = await pool.query(
            "INSERT INTO users (name, email, password_hash, created_at, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [name, email, null, created_at, role]
          );
          user = {
            id: insert.rows[0].id,
            name,
            email,
            role
          };
        }

        // If user already existed, make sure name and email are included for JWT
        if (!user.name) user.name = name;
        if (!user.email) user.email = email;
        if (!user.role) user.role = role;

        return done(null, user);
      } catch (err) {
        console.error("Google Strategy Error:", err.message);
        return done(err, null);
      }
    }
  )
);

// These are required by passport (even if sessions are not used)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

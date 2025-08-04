// index.js
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pkg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import passport from "passport";
import { GoogleGenAI } from "@google/genai";
import "./auth.js";
dotenv.config();

const saltRounds = 10;
const app = express();
const port = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(passport.initialize());

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// The client gets the API key from the environment variable GEMINI_API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Start Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "2d" }
    );

    const redirectUrl = `http://localhost:5173/oauth-success?id=${encodeURIComponent(
      user.id
    )}&token=${token}&name=${encodeURIComponent(
      user.name
    )}&email=${encodeURIComponent(user.email)}&role=${encodeURIComponent(
      user.role
    )}`;
    res.redirect(redirectUrl);
  }
);

// Middleware to check JWT
const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Access denied. No token." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Verify token is valid or active (not expired)
app.post("/verify-token", auth, (req, res) => {
  if (req.user) {
    res.status(200).json({
      status: true,
    });
  } else {
    res.status(401).json({
      status: false,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Todo List Backend");
});

// Signup
app.post("/signup", async (req, res) => {
  const { email, name, password, role } = req.body;
  const created_at = new Date();
  const password_hash = await bcrypt.hash(password, saltRounds);

  try {
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      const existingUser = emailCheck.rows[0];
      if (!existingUser.password_hash) {
        return res.status(400).json({
          error: "Email is registered via Google. Please sign in using Google.",
        });
      } else {
        return res.status(400).json({ error: "User already exists." });
      }
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, created_at, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, password_hash, created_at, role]
    );

    const user = result.rows[0];
    await pool.query("INSERT INTO todos (user_id, todos) VALUES ($1, $2)", [
      user.id,
      JSON.stringify([]),
    ]);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rowCount > 0) {
      const user = result.rows[0];

      if (!user.password_hash) {
        return res.status(400).json({
          message:
            "This account is registered with Google. Please use Google Sign-In.",
        });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid)
        return res.status(401).json({ message: "Incorrect password" });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Successful login",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/dashboard/:id", auth, async (req, res) => {
  const dashboardID = req.params.id;
  const userID = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM dashboard WHERE id = $1",
      [dashboardID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    const dashboard = result.rows[0];

    // Optional: Allow only owner or if public
    if (dashboard.user_id !== userID && dashboard.editor !== "public") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ dashboard });
  } catch (error) {
    console.error("Error fetching dashboard by ID:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// app.get("/todos/:dashboardId", auth, async (req, res) => {
//   const { dashboardId } = req.params;
//   const userId = req.user.id;

//   try {
//     const response = await pool.query(
//       "SELECT todos FROM todos WHERE dashboard_id = $1",
//       [dashboardId]
//     );

//     const dbOwnerData = await pool.query("SELECT user_id FROM todos WHERE dashboard_id = $1", [dashboardId]);
    

//     if (response.rows.length === 0) {
//       return res.status(404).json({ error: "No todos found" });
//     }
//     const todosArray = response.rows[0].todos;
//     // console.log("dbOwner : " , response.rows)
//     res.status(200).json({ data: todosArray, dbOwner : dbOwnerData.rows[0].user_id });
//   } catch (err) {
//     console.error("Error fetching todos:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.get("/todos/:dashboardId", auth, async (req, res) => {
  const { dashboardId } = req.params;
  const userId = req.user.id;

  try {
    // First get the dashboard to check ownership
    const dashboardResult = await pool.query(
      "SELECT user_id FROM dashboard WHERE id = $1",
      [dashboardId]
    );

    if (dashboardResult.rows.length === 0) {
      return res.status(404).json({ error: "Dashboard not found" });
    }

    const dashboardOwner = dashboardResult.rows[0].user_id;

    // Try to get existing todos for this dashboard
    let response = await pool.query(
      "SELECT todos FROM todos WHERE dashboard_id = $1",
      [dashboardId]
    );

    let todosArray = [];
    
    // If no todos entry exists, create one
    if (response.rows.length === 0) {
      await pool.query(
        "INSERT INTO todos (user_id, dashboard_id, todos) VALUES ($1, $2, $3)",
        [dashboardOwner, dashboardId, JSON.stringify([])]
      );
      todosArray = [];
    } else {
      todosArray = response.rows[0].todos;
    }

    res.status(200).json({ 
      data: todosArray, 
      dbOwner: dashboardOwner 
    });
  } catch (err) {
    console.error("Error fetching todos:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/add/component", auth, async (req, res) => {
  const user_id = req.user.id;
  const { dashboard_id, componentId, componentTitle, componentType } = req.body;

  let newComponent;
  if (componentType === "todo") {
    newComponent = {
      dashboard_id,
      componentId,
      componentTitle,
      componentType,
      todos: [],
    };
  } else if (componentType === "Gemini") {
    newComponent = {
      dashboard_id,
      componentId,
      componentTitle,
      componentType,
      recentResponse: "",
    };
  } else if (componentType === "Media") {
    newComponent = {
      dashboard_id,
      componentId,
      componentTitle,
      componentType,
      mediaURL: "",
    };
  }

  try {
    const result = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1 AND dashboard_id = $2",
      [user_id, dashboard_id]
    );

    let existingTodos = result.rows[0]?.todos || [];

    existingTodos.push(newComponent);

    if (result.rows.length > 0) {
      await pool.query(
        "UPDATE todos SET todos = $1 WHERE user_id = $2 AND dashboard_id = $3",
        [JSON.stringify(existingTodos), user_id, dashboard_id]
      );
    } else {
      await pool.query(
        "INSERT INTO todos (user_id, dashboard_id, todos) VALUES ($1, $2, $3)",
        [user_id, dashboard_id, JSON.stringify([newComponent])]
      );
    }

    res.status(200).json({
      message: "New component added.",
      newComponent,
    });
  } catch (err) {
    console.error("Error adding component:", err.message);
    res.status(500).json({ message: "Failed to add new component." });
  }
});

app.post("/todos/update-component", auth, async (req, res) => {
  const user_id = req.user.id;
  const { componentId, newTodo, editMode, dashboardId } = req.body;

  try {
    const result = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1 AND dashboard_id = $2",
      [user_id, dashboardId]
    );

    let todosArray = result.rows[0]?.todos || [];
    const index = todosArray.findIndex((c) => c.componentId === componentId);
    if (index === -1) {
      return res.status(404).json({ message: "Component not found" });
    }

    if (editMode) {
      todosArray[index].todos = todosArray[index].todos.map((t) =>
        t.id === newTodo.id ? { ...t, ...newTodo } : t
      );
    } else {
      todosArray[index].todos.push(newTodo);
    }

    await pool.query("UPDATE todos SET todos = $1 WHERE user_id = $2", [
      JSON.stringify(todosArray),
      user_id,
    ]);

    res.status(200).json({ message: "Todo updated", updatedTodos: todosArray });
  } catch (err) {
    console.error("Update component todos error:", err.message);
    res.status(500).json({ message: "Failed to update component todos." });
  }
});

app.post("/todos/delete-component", auth, async (req, res) => {
  const user_id = req.user.id;
  const { componentId } = req.body;

  try {
    const result = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1",
      [user_id]
    );

    let todosArray = result.rows[0]?.todos || [];

    const updatedTodos = todosArray.filter(
      (c) => c && c.componentId !== componentId
    );

    if (todosArray.length === updatedTodos.length) {
      return res.status(404).json({ message: "Component not found" });
    }

    await pool.query("UPDATE todos SET todos = $1 WHERE user_id = $2", [
      JSON.stringify(updatedTodos),
      user_id,
    ]);
    res.status(200).json({
      message: "Component deleted successfully",
      updatedTodos,
    });
  } catch (err) {
    console.error("Error deleting component:", err.message);
    res.status(500).json({ message: "Failed to delete component" });
  }
});

app.post("/todos/update-title", auth, async (req, res) => {
  const user_id = req.user.id;
  const { componentId, newTitle } = req.body;

  try {
    const result = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1",
      [user_id]
    );
    let existingTodos = result.rows[0]?.todos || [];

    // Update the title of the matching component
    const updatedTodos = existingTodos.map((component) => {
      if (component.componentId === componentId) {
        return { ...component, componentTitle: newTitle };
      }
      return component;
    });

    await pool.query("UPDATE todos SET todos = $1 WHERE user_id = $2", [
      JSON.stringify(updatedTodos),
      user_id,
    ]);

    res.status(200).json({
      message: "Component title updated.",
      updatedTodos,
    });
  } catch (err) {
    console.error("Error updating component title:", err.message);
    res.status(500).json({ message: "Failed to update title." });
  }
});

app.post("/todos/delete", auth, async (req, res) => {
  const user_id = req.user.id;
  const { componentId, todoId } = req.body;

  try {
    const result = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1",
      [user_id]
    );

    let todosArray = result.rows[0]?.todos || [];
    const componentIndex = todosArray.findIndex(
      (c) => c.componentId === componentId
    );
    if (componentIndex === -1) {
      return res.status(404).json({ message: "Component not found" });
    }
    todosArray[componentIndex].todos = todosArray[componentIndex].todos.filter(
      (todo) => todo.id !== todoId
    );
    await pool.query("UPDATE todos SET todos = $1 WHERE user_id = $2", [
      JSON.stringify(todosArray),
      user_id,
    ]);

    res.status(200).json({
      message: "Todo deleted successfully",
      updatedTodos: todosArray,
    });
  } catch (err) {
    console.error("Error deleting todo:", err.message);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

app.post("/generate-response", auth, async (req, res) => {
  const { prompt } = req.body;
  const updatedPrompt = prompt + " . Give plain formatted text.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: updatedPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 1, // Disables thinking -> 0
        },
      },
    });
    res.status(201).json({
      data: response.text,
    });
  } catch (error) {
    console.log("Error while getting response from gemini api ", error.message);
  }
});

app.post("/updateRecentResponse", auth, async (req, res) => {
  // logic
  const user_id = req.user.id;
  const { componentId, componentType, newResponse, url, dashboardId } = req.body;

  try {
    // get todos column from db
    const response = await pool.query(
      "SELECT todos FROM todos WHERE user_id = $1 AND dashboard_id = $2",
      [user_id, dashboardId]
    );
    const todos = response.rows[0].todos;
    let newTodos;
    if (componentType === "Gemini") {
      newTodos = todos.map((item) =>
        item.componentId === componentId
          ? { ...item, recentResponse: newResponse }
          : item
      );
    } else if (componentType === "Media") {
      newTodos = todos.map((item) =>
        item.componentId === componentId ? { ...item, mediaURL: url } : item
      );
    }

    await pool.query("UPDATE todos SET todos = $1 WHERE user_id = $2 AND dashboard_id = $3", [
      JSON.stringify(newTodos),
      user_id,
      dashboardId
    ]);
    res.status(201).json({ message: "Success", updatedTodos: newTodos });
  } catch (error) {
    console.log("Error updating recent response : ", error.message);
  }
});

app.post("/dashboard", auth, async (req, res) => {
  const { title, editor } = req.body;
  const user_id = req.user.id;
  const ownerEmail = req.user.email;

  try {
    const response = await pool.query(
      "INSERT INTO dashboard (user_id, title, editor, ownerEmail) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, editor, ownerEmail]
    );
    res.status(201).json(response.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/dashboard", auth, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      "SELECT * FROM dashboard WHERE editor = 'public' OR user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dashboard not found or access denied" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching dashboard:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.delete("/dashboard/:id", auth, async (req, res) => {
  const dashboardID = req.params.id;
  const userID = req.user.id;

  try {
    const dashboard = await pool.query(
      "SELECT * FROM dashboard WHERE id = $1 AND user_id = $2",
      [dashboardID, userID]
    );

    if (dashboard.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized or dashboard not found" });
    }

    await pool.query("DELETE FROM todos WHERE dashboard_id = $1", [
      dashboardID,
    ]);

    await pool.query("DELETE FROM dashboard WHERE id = $1", [dashboardID]);

    res.status(200).json({ message: "Dashboard and related todos deleted" });
  } catch (err) {
    console.error("DELETE error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB Connection error:", err));

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
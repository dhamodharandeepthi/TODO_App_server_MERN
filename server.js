const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
//Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(`Error in Database connection : ${err.message}`);
  });

//create an instance of express
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//define a route
app.get("/", (req, res) => {
  res.send("hello world");
});
//sample in-memory storage for todo items
// const todos = [];
//creating schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
//creating model
const todoModel = mongoose.model("Todo", todoSchema, "todos");

//create a new todo item
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;
  //   const newTodo = {
  //     id: todos.length + 1,
  //     title: title,
  //     description: description,
  //   };
  //   todos.push(newTodo);
  //   console.log(todos);
  try {
    const newTodo = new todoModel({ title, description });
    await newTodo.save();
    res.status(201).json({ message: "Todo created sucessfully", newTodo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

//get all items
app.get("/todos", async (req, res) => {
  try {
    let todos = await todoModel.find();
    res.status(202).json({ message: "Got all todos from database", todos });
  } catch (error) {
    console.log(error);
    res.status(501).json({ message: error.message });
  }
});

//update a todo item
app.patch("/todos/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    let updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedTodo) {
      res.status(404).json({ message: "Todo not found for update" });
    }
    return res
      .status(203)
      .json({ message: "Todo updated sucessfully", updatedTodo });
  } catch (error) {
    console.log(error);
    res.status(502).json({ message: error.message });
  }
});

//delete a todo item
app.delete("/todos/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let deletedTodo = await todoModel.findByIdAndDelete(id);
    if (!deletedTodo) {
      res.status(405).json({ message: "Todo not found for delete" });
    }
    return res
      .status(204)
      .json({ message: "Todo deleted sucessfully", deletedTodo });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: error.message });
  }
});

//start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});

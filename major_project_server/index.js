// src/index.ts
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");
const connectToMongoose = require('./connectDB');
const User = require('./Models/User');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEM_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const OPENAI_API_KEY = process.env.OPENAI_KEY;

connectToMongoose();

const app = express();
app.use(express.json());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: ["https://taskmaze-frontend.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use('/api/auth', require('./auth'));

const users = {
  user1: {
    id: "user1",
    name: "rahul",
    password: "rahul",
  },
  user2: {
    id: "user2",
    name: "saksham",
    password: "saksham",
  },
};

const findUser = async (usernames) => {
  return new Promise((resolve, reject) => {
    let usersfound = true;
    usernames.forEach((user) => {
      let userfound = false;
      Object.values(users).forEach((x) => {
        if (user === x.name) userfound = true;
      });

      if (!userfound) usersfound = false;
    });

    if (!usersfound) reject(false);
    resolve(true);
  });
};

const checkUserExistence = async (usernames) => {
  try {
    const users = await User.find({ username: { $in: usernames } });
    if (users.length !== usernames.length) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error("Error checking user existence");
  }
};

const documents = {};

app.post("/createDoc", async (req, res, next) => {
  try {
    const docId = uuid();
    const username = req.body.user.username;
    if (!username) {
      throw new Error("User id is not found!!!");
    }
    const docInfo = {
      docId,
      canvas: "",
      creater: username,
      editor: username,
      collaborators: [username],
    };
    //push docId to specific user in mongodb
    await User.findOneAndUpdate({ username: username }, { $push: { docIds: docId } });

    documents[docId] = docInfo;
    return res.status(200).json(docInfo);
  } catch (err) {
    next(err);
  }
});

app.post("/deleteDoc", async (req, res, next) => {
  try {
    const docId = uuid();
    const userId = req.body.user.docId;
    if (!userId) {
      throw new Error("User id is not found!!!");
    }

    console.log(docId);
    delete documents[docId];

    return res.status(200).json({
      message: "Exited from doc",
    });
  } catch (err) {
    next(err);
  }
});

app.post("/joinDoc/:id", (req, res, next) => {
  try {
    const docId = req.params.id.trim();
    const username = req.body.user.username;
    console.log("Joining id", docId);
    if (!Object.keys(documents).includes(docId)) {
      throw new Error("Given doc is not found");
    }

    if (!username) {
      throw new Error("Username is not provided");
    }

    console.log(username, documents[docId]);
    documents[docId].collaborators.forEach((user) => {
      if (user === username) {
        res.status(200).json(documents[docId]);
      }
    });

    throw new Error("Your are not collaborator");
  } catch (err) {
    next(err);
  }
});

app.post("/getCanvasState/:id", (req, res, next) => {
  try {
    const docId = req.params.id;
    res.status(200).json(documents[docId]);
  } catch (e) {
    next(e);
  }
});

app.post("/addCollaborator/:docId", async (req, res, next) => {
  try {
    const docId = req.params.docId;
    const usernames = req.body.user.usernames;
    console.log(usernames);
    let usersExist = await checkUserExistence(usernames);

    if (!usersExist) {
      throw new Error("Some users do not exist");
    }

    console.log("here");

    documents[docId].collaborators = usernames;
    if (documents[docId].collaborators.length === 0)
      documents[docId].collaborators = [documents[docId].creater];

    found = false;
    documents[docId].collaborators.forEach((user) => {
      if (documents[docId].editor === user) found = true;
    });

    if (!found) {
      documents[docId].editor = documents[docId].creater;
    }

    res.status(200).json({
      message: "Success",
    });
  } catch (err) {
    next(err);
  }
});

app.post("/giveAccess/:id", (req, res, next) => {
  try {
    const docId = req.params.id;
    const username = req.body.user.username;
    const canvasState = documents[docId];
    if (canvasState.editor === username) {
      throw new Error("You are already an editor");
    }

    canvasState.editor = username;
    res.status(200).json({
      message: "Success",
    });
  } catch (err) {
    next(err);
  }
});

app.get("/getDocIds", async (req, res, next) => {
  try {
    //retrieve docids from mongodb
    const userId = req.query.userId;
    //console.log(req);
    //console.log("userID",userId);
    const user = await User.findById(userId);
    //console.log(user.docIds);
    res.status(200).json(user.docIds);
  } catch (err) {
    console.log(err);
  }
});

app.post('/getChatMessages', async (req, res) => {
  const { prompt } = req.body;
  try {
    // Send user message to OpenAI API
    if (prompt) {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const answer = response.text();
      console.log(answer);

      res.json({ userMessage: prompt, aiResponse: answer });
    }
    else {
      res.status(400).json({ message: "Please provide prompt" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(400).json(err.message);
});

io.on("connection", (socket) => {
  console.log("user is connected", socket.id);
  socket.on("join_custom_room", ({ userId, docId }) => {
    console.log("User joined room");
    socket.join(docId);
    const canvas = documents[docId]?.canvas;
    if (canvas) {
      socket.emit("init_canvas", canvas);
    }
  });

  socket.on("leave_custom_room", ({ userId, docId }) => {
    console.log("user left room");
    socket.leave(docId);
  });

  socket.on("update_canvas", ({ docId, canvas }) => {
    console.log("update canvas request", docId);
    const room = docId;
    if (socket.rooms.has(room)) {
      documents[docId].canvas = canvas;
      socket.to(room).emit("updated_canvas", canvas);
    } else console.log("Room not found");
  });

  socket.on("update_canvas_status", ({ docId }) => {
    socket.to(docId).emit("updated_canvas_status", documents[docId]);
  });

  socket.on("raise_hand", ({ docId, user }) => {
    socket.to(docId).emit("raised_hand", user);
  });

  //   socket.on("custom_event", (args) => {
  //     console.log(args);
  //     // socket.broadcast.to(room).emit(args);
  //     socket.to(room).emit("custom_event", args);
  //     // socket.emit("custom_event", args);
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("user disconnected");
  //   });

  //   socket.on("create_project", (args: any) => {
  //     socket.to(room).emit("create_project", args);
  //   });

  //   socket.on("update_project", (arg: any) => {
  //     socket.to(room).emit("update_project", arg);
  //   });

  //   socket.on("delete_project", (projectId: string) => {
  //     console.log(projectId);
  //     socket.to(room).emit("delete_project", projectId);
  //   });

  //   socket.on("update_kanban", (arg: any) => {
  //     socket.to(room).emit("update_kanban", arg);
  //   });
});

server.listen(process.env.PORT, () => {
  console.log("Listening on port", process.env.PORT);
});

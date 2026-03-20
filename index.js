const express = require("express");
const { authMiddleware } = require("./middleware");

let USERS_ID = 1;
let ORGANISATION_ID = 1;

const users = [
  {
    id: 1,
    username: "harkirat", // uniquenss constraint
    password: "123123",
  },
  {
    id: 2,
    username: "raman",
    password: "123123",
  },
];

const organizations = [
  {
    id: 1,
    title: "100xdevs",
    description: "Learning coding platform",
    admin: 1,
    members: [2],
  },
  {
    id: 2,
    title: "ramans org",
    description: "Experimenting",
    admin: 1,
    members: [],
  },
];

const boards = [
  {
    id: 1,
    title: "100xschool website (frontend",
    organizationId: 1,
  },
];

const issues = [
  {
    id: 1,
    title: "Add dark mode",
    boardId: 1,
    state: "IN_PROGRESS", //NEXT_UP | IN_PROGRESS | DONE | ARCHIVED
  },
  {
    id: 2,
    title: "Allow admins to create more courses",
    boardId: 1,
  },
];

const app = express();
app.use(express.json());
// Design your route
// Implement routes
// protect the right routes (middleware)

// CREATE
app.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    req.status(411).json({
      message: "User with this username already exists",
    });
    return;
  }

  users.push({
    username,
    password,
    id: USERS_ID++,
  });
});

app.post("/signin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const userExists = users.find((user) => user.username === username);

  if (userExists && user) {
  }
});

app.post("/organisation", authMiddleware, (req, res) => {
  const userId = req.userId;
  organizations.push({
    id: ORGANISATION_ID++,
    title: req.body.title,
    description: req.body.description,
    admin: userId,
    members: [],
  });
});

app.post("/add-member-to-organisation", authMiddleware, (req, res) => {});

app.post("/board", (req, res) => {});

app.post("/issue", (req, res) => {});

// WRITE
app.get("/boards", (req, res) => {});

// query params ?organisation
app.get("/boards/:organisation", (req, res) => {});

app.get("/issues", (req, res) => {});

app.get("/members", (req, res) => {});

// query params
app.get("/issues", (req, res) => {});

// DELETE
app.delete("/members", (req, res) => {});

app.listen(3000);

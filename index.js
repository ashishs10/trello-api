const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");

let USERS_ID = 1;
let ORGANISATION_ID = 1;
let BOARDS_ID = 1;
let ISSUE_ID = 1;

const USERS = [
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

const ORGANISATION = [
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

const BOARDS = [
  {
    id: 1,
    title: "100xschool website (frontend)",
    organizationId: 1,
  },
];

const ISSUES = [
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

  const userExists = USERS.find((user) => user.username === username);

  if (userExists) {
    res.status(411).json({
      message: "User with this username already exists",
    });
    return;
  }

  USERS.push({
    username,
    password,
    id: USERS_ID++,
  });

  res.status(200).json({
    mesasge: "User creatd",
    username,
  });
});

app.post("/signin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const userExists = USERS.find((user) => user.username === username);

  if (!userExists) {
    res.status(403).json({
      message: "incorrect credentials",
    });
  }

  // if user exists - sign jwt token
  const token = jwt.sign(
    {
      username: username,
    },
    "ashishiscool123",
  );
  // return token
  res.status(200).json({
    token: token,
  });
});

app.post("/organisation", authMiddleware, (req, res) => {
  const username = req.username;

  if (!username) {
    res.status(403).json({
      message: "Malformed token",
    });
  }

  ORGANISATION.push({
    id: ORGANISATION_ID++,
    title: req.body.title,
    description: req.body.description,
    admin: username,
    members: [],
  });

  res.status(200).json({
    ORGANISATION,
  });
});

// AUTHENTICATED ROUTE-
app.post("/add-member-to-organisation", authMiddleware, (req, res) => {
  const organizationId = Number(req.body.organizationId);
  const memberUsername = req.body.memberUsername;
  const username = req.username;

  // find if org exists
  const org = ORGANISATION.find((org) => org.id === organizationId);
  console.log(`Organisation exists ${org.id}`);

  if (!org) {
    res.status(403).json({
      message: "Organisation doesn't exist",
    });
    return;
  }

  // USER IS ADMIN
  const user = USERS.find((user) => user.username === username);

  if (!user.id === org.admin) {
    res.status(403).json({
      message: "Unauthorised access",
    });
    return;
  }
  // ADD MEMBER USER TO ORGANISATION
  const memberUser = USERS.find((user) => user.username === memberUsername);

  if (!memberUser) {
    res.status(404).json({
      message: "Member user doesn't exist",
    });
    return;
  }

  const memberUserId = memberUser.id;

  const memberInOrg = org.members.findIndex((id) => id === memberUserId);
  if (memberInOrg !== -1) {
    res.status(403).json({
      message: "member already in organisation",
    });
    return;
  }

  org.members.push(memberUserId);

  res.status(200).json({
    message: "Added member to organisation",
  });
});

app.post("/board", authMiddleware, (req, res) => {
  const title = req.body.title;
  const organizationId = Number(req.body.organizationId);
  const username = req.username;

  const org = ORGANISATION.find((org) => org.id === organizationId);

  if (!org) {
    res.status(404).json({
      message: "Organisation doesn't exist",
    });
    return;
  }

  // check if the user is admin
  const user = USERS.find((user) => user.username === username);
  const admin = user.id === org.admin;

  if (!admin) {
    res.status(403).json({
      message: "Anauthorised to create boards",
    });
    return;
  }

  const board = {
    id: BOARDS_ID++,
    title,
    organizationId,
  };

  BOARDS.push(board);

  res.status(200).json({
    message: "Board created",
    board,
  });
});

app.post("/issue", authMiddleware, (req, res) => {
  /* INPUT : req.body
    title: "Add dark mode",
    boardId: 1,
    state: "IN_PROGRESS",
    
    token: username (middleware)

    GUARD CLAUSES
      1. Does the board exists.
      2. is the user member or admin of the board
      3. 

    HAPPY PATH
     1. Issue object 
     {  title: "Add dark mode",
        boardId: 1,
        state: "IN_PROGRESS",
      }
    */
  const title = req.body.title;
  const boardId = Number(req.body.boardId);
  const state = req.body.state;
  const username = req.username; //from token

  const board = BOARDS.find((board) => boardId === board.id);

  if (!board) {
    res.status(404).json({
      message: "Board doens't exist",
    });
    return;
  }

  const user = USERS.find((user) => user.username === username);
  const userId = user.id;

  const organizationId = board.organizationId;

  const org = ORGANISATION.find((org) => org.id === organizationId);

  const isMemberOfOrg = org.members.includes(userId);
  const admin = org.admin === userId;

  if (!isMemberOfOrg && !admin) {
    res.status(403).json({
      message: "Anauthorised user",
    });
    return;
  }

  const issue = {
    id: ISSUE_ID,
    title,
    boardId,
    state,
  };
  ISSUES.push(issue);

  res.status(200).json({
    message: "Issue created succefully",
  });
  return;
});

// WRITE
app.get("/boards", authMiddleware, (req, res) => {
  const username = req.username;

  const user = USERS.find((user) => user.username === username);
  const userId = user.id;

  const userOrgs = ORGANISATION.filter(
    (org) => org.members.includes(userId) || org.admin === userId,
  );

  const userOrgsIds = userOrgs.map((org) => org.id);

  const boards = BOARDS.filter((board) =>
    userOrgsIds.includes(board.organizationId),
  );

  res.status(200).json({
    message: "boards fetched succesfully",
    boards,
  });
  return;
});

// TODO : TOMORROW
app.get("/issues", authMiddleware, (req, res) => {
  /* 
    Issues belong to particular organisation and board
    req body won't have anything as it is a GET request - is this correct conceptually?
    authmiddleware - username

    will have orgId in query params, 
    without guery params -> give all the issues of the boards that the user is in. 
    2nd one is more apt. 

    1. find org for user
    2. find board of the orgs
    3. find the issues related to the boards of the org

    GUARD CLAUSES
    1. 
  */

  const username = req.username;

  const user = USERS.find((user) => user.username === username);

  const userId = user.id;

  const org = ORGANISATION.find(
    (org) => org.members.includes(userId) || org.admin === userId,
  );

  if (!org) {
    res.status(404).json({
      message: "Member is not in any org",
    });
    return;
  }

  const boards = BOARDS.filter((board) => board.organizationId === org.id);

  const issues = boards.map((board) => ({
    boardId: board.id,
    boardTitle: board.title,

    issues: ISSUES.filter((issue) => issue.boardId === board.id),
  }));

  res.status(200).json({
    message: "success",
    issues,
  });
});

app.get("/members", authMiddleware, (req, res) => {
  /* 
    request body won't be there as this is a get request
    query params - ?organisationid=3

    token - username

    GUARD CLAUSES
     1. VALID QUERY PARAMS
     2. VALID ORG
     3. USER MEMBER OR ADMIN OF THE ORG

  */

  const username = req.username;

  const organisationId = Number(req.query.organisationId);

  if (!organisationId) {
    res.status(404).json({
      message: "Invalid query params",
    });
    return;
  }

  const org = ORGANISATION.find((org) => org.id === organisationId);

  if (!org) {
    res.status(404).json({
      message: "Organisation doens't exists",
    });
    return;
  }

  const user = USERS.find((user) => user.username === username);
  const isMember = org.members.includes(user.id);
  const isAdmin = org.admin === user.id;

  if (!isMember && !isAdmin) {
    res.status(403).json({
      message: "Unauthorised",
    });
    return;
  }

  const members = USERS.filter((user) => org.members.includes(user.id)).map(
    (user) => ({ id: user.id, username: user.username }),
  );

  res.status(200).json({
    message: "succes",
    members,
  });
  return;
});

// query params
app.get("/issues", authMiddleware, (req, res) => {});

// DELETE
app.delete("/members", authMiddleware, (req, res) => {});

app.listen(3000);

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(express.urlencoded({ extended: true }));

const users = [];
const allExercises = [];

const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomPart = [...Array(16)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  return timestamp + randomPart;
};

const findUser = (_id) => users.find((user) => user._id === _id);

app.post("/api/users", (req, res) => {
  console.log(req.body);
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  const newUser = {
    _id: generateObjectId(),
    username,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = findUser(_id);
  if (!user) return res.status(404).json({ error: "User was not found" });

  if (!description || !duration)
    return res
      .status(400)
      .json({ error: "Description and duration must have values" });

  if (isNaN(duration) || duration <= 0) {
    return res
      .status(400)
      .json({ error: "Duration must be a number and positive" });
  }

  const exerciseDate = isNaN(new Date(date))
    ? new Date().toDateString()
    : new Date(date).toDateString();

  const exercise = {
    _id: user.id,
    username: user.username,
    description,
    duration,
    date: exerciseDate,
  };

  allExercises.push(exercise);

  return res.status(201).json(exercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.body;
  const { from, to, limit } = req.query;

  const user = findUser(_id);
  if (!user) return res.status(404).json({ error: "User was not found" });

  let fromDate = from ? new Date(from) : null;
  let toDate = to ? new Date(to) : null;

  if ((from && isNaN(fromDate.getTime())) || (to && isNaN(toDate.getTime()))) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const userExercises = allExercises.filter((exercise) => (exercise._id = id));

  let filteredExercises = userExercises;

  if (fromDate) {
    filteredExercises = filteredExercises.filter(
      (exercise) => new Date(exercise.date) >= fromDate
    );
  }

  if (toDate) {
    filteredExercises = filteredExercises.filter(
      (exercise) => new Date(exercise.date) <= toDate
    );
  }

  if (limit) {
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: "Invalid limit" });
    }
    filteredExercises = filteredExercises.slice(0, parsedLimit);
  }

  return res.status(200).json({
    username: user.username,
    _id: user._id,
    count: filteredExercises.length,
    logs: filteredExercises,
  });
});

app.get("/api/users", (_, res) => {
  return res.status(200).json(users);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

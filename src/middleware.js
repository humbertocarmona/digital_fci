import { getUserProgress } from "./dbAddUsers.js";

export function checkAccess(req, res, next) {
  const username = req.session.username;
  const currentQuestion = parseInt(req.params.questionNumber, 10);

  if (!username) {
    return res.redirect("/login");
  }

  const userProgress = getUserProgress(username);

  if (userProgress < currentQuestion) {
    return res.status(403).send("Access Denied");
  }

  next();
}

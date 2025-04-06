// Import a helper function to get the user's current progress from the database
import { getUserProgress } from "./dbAddUsers.js";

/**
 * Middleware to control access to question pages based on user progress.
 * 
 * If the user is not logged in, redirect to the login page.
 * If the user has not yet reached the requested question, deny access.
 * Otherwise, allow the request to proceed.
 */
export function checkAccess(req, res, next) {
  // Retrieve the logged-in user's username from the session
  const username = req.session.username;

  // Parse the requested question number from the URL
  const currentQuestion = parseInt(req.params.questionNumber, 10);

  // If the user is not logged in, redirect to login page
  if (!username) {
    return res.redirect("/login");
  }

  // Get the user's current progress from the database
  const userProgress = getUserProgress(username);

  // If the user has not reached this question yet, deny access
  if (userProgress < currentQuestion) {
    return res.status(403).send("Access Denied");
  }

  // All checks passed — allow access to the next middleware or route
  next();
}


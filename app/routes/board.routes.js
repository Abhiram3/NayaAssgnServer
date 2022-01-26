const { authJwt } = require("../middlewares");

module.exports = app => {
  const Board = require("../controllers/board.controller.js");

  var router = require("express").Router();

  // Create a new Project
  router.post("/", Board.create);

  // Retrieve all Board
  router.get("/", Board.findAll);

  // Retrieve a single Project with id
  router.get("/:id", Board.findOne);

  // Update a Project with id
  router.put("/:id", Board.update);

  // Delete a Project with id
  router.delete("/:id", Board.delete);

  app.use("/boards", [authJwt.verifyToken], router);
};

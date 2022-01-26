const { authJwt } = require("../middlewares");

module.exports = app => {
  const Projects = require("../controllers/project.controller.js");

  var router = require("express").Router();

  // Create a new Project
  router.post("/", Projects.create);

  // Retrieve all Projects
  router.get("/", Projects.findAll);

  // Retrieve a single Project with id
  router.get("/:id", Projects.findOne);

  // Update a Project with id
  router.put("/:id", Projects.update);

  // Delete a Project with id
  router.delete("/:id", Projects.delete);

  app.use("/projects", [authJwt.verifyToken], router);
};

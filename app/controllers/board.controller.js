const db = require("../models");
const Project = db.project;
const Board = db.board;

// Create and Save a new Board
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({ message: "Title can not be empty!" });
    return;
  }

  console.log('creating board!!!', req.body);

  // Create a Board
  const newBoard = new Board({
    title: req.body.title,
    createdBy: req.userId,
    projectId: req.body.projectId
  });

  let newBoardData;

  // Save Board in the database
  newBoard
    .save(newBoard)
    .then(data => {
      newBoardData = data;
      return Project.findByIdAndUpdate(
        req.body.projectId,
        { $push: { boards: newBoardData._id } },
        { new: true }
      )
    })
    .then(data => {
      console.log('update data', data);
      res.status(200).send(newBoardData);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Board."
      });
    });
};

// Retrieve all Boards from the database.
exports.findAll = (req, res) => {

  Board.find({})
    .populate("createdBy", "name")
    .populate("projectId", "title")
    .exec((err, data) => {
      if (err) {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Boards."
        });
      }
      res.send(data);
    });
};

// Find a single Board with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Board.findById(id)
    .populate("collaborators", "name")
    .populate("createdBy", "name")
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Board with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Board with id=" + id });
    });
};

// Update a Board by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;
  let selectedBoard;

  Board.findById(id)
    .then(data => {
      selectedBoard = data;
      if (!selectedBoard.collaborators.includes(req.userId)) {
        selectedBoard.collaborators.push(req.userId);
      }
      const updateData = Object.assign({}, req.body, {
        collaborators: selectedBoard.collaborators
      })
      return Board.findByIdAndUpdate(id, updateData, { useFindAndModify: false })
    })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Board with id=${id}. Maybe Board was not found!`
        });
      } else res.send({ message: "Board was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Board with id=" + id
      });
    });
};

// Delete a Board with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Board.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Board with id=${id}. Maybe Board was not found!`
        });
      } else {
        res.send({
          message: "Board was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Board with id=" + id
      });
    });
};

// Delete all Boards from the database.
exports.deleteAll = (req, res) => {
  Board.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Boards were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Boards."
      });
    });
};

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      title: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      boards: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Board'
        }
      ]
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Project = mongoose.model("Project", schema);
  return Project;
};

const { model, Schema, ObjectId } = require("mongoose");
// ObjectId нужен для связи сущностей

const File = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  accessLink: { type: String },
  size: { type: Number, default: 0 },
  path: { type: String, default: "" },
  user: { type: ObjectId, ref: "User" },
  // user будет ссылаться на пользователя, который добавил файл
  parent: { type: ObjectId, ref: "File" },
  childs: [{ type: ObjectId, ref: "File" }],
});

module.exports = model("File", File);

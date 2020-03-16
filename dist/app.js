"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _index = _interopRequireDefault(require("./routes/index"));

var _scrape = _interopRequireDefault(require("./routes/scrape"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// app.js
const app = (0, _express.default)();
app.use((0, _morgan.default)("dev"));
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: false
}));
app.use((0, _cookieParser.default)());
app.use(_express.default.static(_path.default.join(__dirname, "../public")));
app.use("/home", _index.default);
app.use("/scrape", _scrape.default);
module.export = app;
app.listen(3000, () => {
  app.emit("listened", null);
  console.log("Server started at: http://localhost:3000");
});
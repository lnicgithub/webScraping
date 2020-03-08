"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router();
/* GET users listing. */


router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});
var _default = router;
exports.default = _default;
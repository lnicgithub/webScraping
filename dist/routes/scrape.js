"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireWildcard(require("express"));

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const router = _express.default.Router();

router.get("/", (req, res) => {
  const url = "https://www.topcashback.co.uk/ebookers/";

  _axios.default.get(url).then(response => {
    const data = [];

    const $ = _cheerio.default.load(response.data);

    $("#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_tdCol").each((i, elem) => {
      data.push({
        title: $(elem).text() //rate: $(elem).text()

      });
    }); //$(".cashback-desc");

    res.send(data);
  }).catch(error => {
    console.log(error);
    res.send("error retrieving cashback value");
  });
  /* GET users listing. */

});
var _default = router;
exports.default = _default;
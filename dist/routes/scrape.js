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
  const url = "https://www.topcashback.co.uk/ebookers/"; // const cssSelector =
  // "#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_lblTitle";

  const css = "td";

  _axios.default.get(url).then(response => {
    let data = [];

    const $ = _cheerio.default.load(response.data);

    $(css).each(function (index, element) {
      let cType = $(".gecko-small-text-wrap span").text;
      let cRate = $(".cashback-desc").text;
      data = +data[(cType, cRate)];
    });
    res.sendStatus(data);
  }).catch(error => {
    console.log(error);
    res.sendStatus("error retrieving cashback value");
  });
  /* GET users listing. */

});
var _default = router;
/*       $("#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl04_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl03_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl02_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl01_lblCashbackDesc").each((i, elem) => {
        cashbackRateData.push({
          cashback: $(elem).text()
          //rate: $(elem).text()
        });
      }); */
// const data = [...cashbackTypeData, ...cashbackRateData];

exports.default = _default;
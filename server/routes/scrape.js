import express, { response } from "express";
import axios from "axios";
import cheerio from "cheerio";

const router = express.Router();

router.get("/", (req, res) => {
  const url = "https://www.topcashback.co.uk/ebookers/";
  // const cssSelector =
  // "#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_lblTitle";

  const css = "td";
  axios
    .get(url)
    .then(response => {
      let data = [];
      const $ = cheerio.load(response.data);

      $(css).each(function(index, element) {
        let cType = $(".gecko-small-text-wrap span").text;
        let cRate = $(".cashback-desc").text;
        data = +data[(cType, cRate)];
      });

      res.sendStatus(data);
    })
    .catch(error => {
      console.log(error);
      res.sendStatus("error retrieving cashback value");
    });

  /* GET users listing. */
});

export default router;

/*       $("#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl04_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl03_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl02_lblCashbackDesc , #ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl01_lblCashbackDesc").each((i, elem) => {
        cashbackRateData.push({
          cashback: $(elem).text()
          //rate: $(elem).text()
        });
      }); */
// const data = [...cashbackTypeData, ...cashbackRateData];

import express, { response } from "express";
import axios from "axios";
import cheerio from "cheerio";

const router = express.Router();

router.get("/", (req, res) => {
  const url = "https://www.topcashback.co.uk/ebookers/";

  axios
    .get(url)
    .then(response => {
      const data = [];
      const $ = cheerio.load(response.data);
      $("#ctl00_GeckoTwoColPrimary_merchantPnl_rMerchantOffers_ctl00_tdCol").each((i, elem) => {
        data.push({
          title: $(elem).text()
          //rate: $(elem).text()
        });
      });

      //$(".cashback-desc");

      res.send(data);
    })
    .catch(error => {
      console.log(error);
      res.send("error retrieving cashback value");
    });

  /* GET users listing. */
});

export default router;

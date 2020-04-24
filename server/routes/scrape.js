import express from "express";
import moment from "moment";
import { getChromeInstance, getBookingRooms } from "../models/puppeteerModules";
import { dataStore, findRecs, insertRecs } from "../models/dbModules";
import queue from "../models/queueModules";
import nullCheck from "../models/dataModules";

const router = express.Router();

/* GET scrape values. */
router.get("/hotel", (req, res) => {
  // Grab query params set by user
  let { hotelname, country, from_date, to_date } = req.query;

  // check if any query param is null, if yes, give them a default value
  hotelname =
    nullCheck(hotelname) === ""
      ? "the roosvelt".replace(/\s+/g, "-")
      : hotelname.replace(/\s+/g, "-");
  country = nullCheck(country) === "" ? "us" : country;
  from_date =
    nullCheck(from_date) === ""
      ? moment()
          .add(1, "d")
          .format("DD-MM-YYYY")
      : from_date;
  to_date =
    nullCheck(to_date) === ""
      ? moment()
          .add(4, "d")
          .format("DD-MM-YYYY")
      : to_date;

  const fromDate = moment(from_date, "DD-MM-YYYY");
  const toDate = moment(to_date, "DD-MM-YYYY");

  (async function run() {
    if (hotelname) {
      // find recs if exist
      const dbResults = await findRecs({
        hotelName: `${hotelname}`,
        fromDate: `${fromDate.format("YYYY-MM-DD")}`,
        toDate: `${toDate.format("YYYY-MM-DD")}`,
        requestTimestamp: {
          $gte: moment()
            .subtract(1, "hours")
            .valueOf()
        }
      });
      // if results exist, return those to caller
      if (Array.isArray(dbResults) && dbResults.length >= 1) {
        return res.json(dbResults);
      }
      queue.add(async () =>
        getBookingRooms(
          hotelname,
          fromDate.format("YYYY-MM-DD"),
          toDate.format("YYYY-MM-DD"),
          country,
          moment().valueOf()
        )
      );
      return res.send(`results pending, queue size: ${queue.size}`);
    }
    // no query params set
    return res.send("no request made");
  })();
});

router.get("/queue", (req, res) => {
  res.send(`size: ${queue.size} , pending:${queue.pending}`);
});

export default router;

import express from "express";
import moment from "moment";
import {
  getChromeInstance,
  getBookingRooms
} from "../modules/puppeteerModules";
import {
  dataStore,
  findAllRecs,
  insertRecs,
  findLatestRequestTimestamp
} from "../modules/dbModules";
import { queue } from "../modules/queueModules";
import nullCheck from "../modules/dataModules";

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
  let toDate = moment(to_date, "DD-MM-YYYY");

  (async function run() {
    if (hotelname && country && fromDate && toDate) {
      // must identify if the stay duration is > 30 days. this is because you cant book more than 30 days with hotels.
      const stayDuration = moment.duration(toDate.diff(fromDate, "days"));
      console.log("%d days stay", stayDuration);
      if (stayDuration >= 30) {
        toDate = moment(fromDate).add(30, "days");
        console.log("to_date too far in the future, max of 30 days allowed");
        console.log("new to_date is %s", toDate.format("YYYY-MM-DD"));
      }

      const jsonString = {
        hotelName: `${hotelname}`,
        fromDate: `${fromDate.format("YYYY-MM-DD")}`,
        toDate: `${toDate.format("YYYY-MM-DD")}`,
        country: `${country}`
      };
      let dbResults = [];
      const nowUnix = moment(moment().valueOf());
      const timeOffsetUnix = moment()
        .subtract(1, "hours")
        .valueOf();
      // find if any data exists and if it does then return the la
      // latest requestTimestamp so we can filter on that and return
      // only the latest results from the history of results.
      const latestRequestTimestamp = await findLatestRequestTimestamp({
        hotelName: `${hotelname}`,
        fromDate: `${fromDate.format("YYYY-MM-DD")}`,
        toDate: `${toDate.format("YYYY-MM-DD")}`,
        country: `${country}`
      });

      if (latestRequestTimestamp > timeOffsetUnix) {
        // add latestRequestTimestamp to jsonString so we can search using it.
        jsonString.requestTimestamp = latestRequestTimestamp;
        dbResults = await findAllRecs({
          hotelName: `${hotelname}`,
          fromDate: `${fromDate.format("YYYY-MM-DD")}`,
          toDate: `${toDate.format("YYYY-MM-DD")}`,
          country: `${country}`,
          requestTimestamp: latestRequestTimestamp
        });
        if (Array.isArray(dbResults) && dbResults.length >= 1) {
          // we have results in the DB. We need to return those to the user but only once we have humanized the timestamp and added in the url.
          dbResults.forEach(item => {
            // change requestTimestamp to human time since string.
            item.requestTimestamp = `${moment
              .duration(nowUnix.diff(item.requestTimestamp))
              .humanize()} ago`;

            if (item.availability === "Y") {
              item.url = `https://booking.com/hotel/${country}/${hotelname}.en-gb.html?
                    checkin=${fromDate.format("YYYY-MM-DD")}
                    &checkout=${toDate.format("YYYY-MM-DD")}
                    &aid=99992321`
                .replace(/\s+/g, "")
                .toLowerCase();
            }
          });
          // return results from the DB, no scraping needed
          return res.json(dbResults);
        }
      } else {
        // data was found but its out of date or no data found, so we need to scrape
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
    }
    // no query params set
    return res.send("no request made");
  })();
});

router.get("/queue", (req, res) => {
  res.send("size: %d , pending: %d", queue.size, queue.pending);
});

export default router;

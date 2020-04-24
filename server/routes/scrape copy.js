import express from "express";
import puppeteer from "puppeteer";
import { getChromeInstance } from "../modules/puppeteerModules";
import { dataStore, findRecs, insertRecs } from "../modules/dbModel";

const router = express.Router();



/* GET scrape values. */
router.get("/", (req, res) => {
  const { hotelname } = req.query;
  const url =
    "https://m.booking.com/hotel/us/the-roosvelt.en-gb.html?checkin=2020-08-02&checkout=2020-08-06";
  (async function run() {
    if (hotelname) {
      // find recs if exist
      const dbResults = await findRecs({ hotelName: `${hotelname}` });
      // if results exist, return those to caller
      if (Array.isArray(dbResults) && dbResults.length >= 1) {
        return res.json(dbResults);
      }
      // no results returned, queue up api call
      const reqResults = await getBookingRooms(url);
      return res.json(reqResults);
    }
    // no query params set
    return res.send("no request made");
  })();
});

router.get("/request", (req, res) => {
  async function getBookingRooms(url) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: await getChromeInstance()
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, {
      waitUntil: "load"
    });

    async function getData() {
      const records = await page.evaluate(async () => {
        const hotelRooms = ["test"];
        const rooms = document.querySelectorAll(`[data-room-id][data-block-id]`);
        rooms.forEach(room => {
          hotelRooms.push({ name: "test", text: room.innerText });
        });

        return hotelRooms;
      });
      await page.close();
      return records;
    }
    return getData();
  }
  // execute the scrape request and then add to DB.
  (async function run() {
    const results = await getBookingRooms(url);
    if (Array.isArray(results) && results.length >= 1) {
      // insert into DB
      results.forEach(room => {
        insertRecs(room);
      });
    }
    return res.send("complete");
  })();
});

export default router;

/* const dbresults = async () =>
        dataStore.find(
          { hotelName: `${hotelname}` },
          async function findResults(err, docs) {
            return docs;
          }
        ); */

/* (async function run() {
    if (!findRecs(hotelname)) {
      const results = getBookingRooms(hotelname);
      const output = {};
      if (!results) {
        output.results = "0";
        output.message = "error";
      }
      output.results = results;
      output.message = "success";
      res.json(output);
    }
    res.json(findRecs(hotelname));
  })();

  (async function jsonOutput() {
    res.json({
      url: "test",
      results: await getBookingRooms(
        "https://m.booking.com/hotel/us/the-roosvelt.en-gb.html?checkin=2020-08-02&checkout=2020-08-06"
      )
    });
  })(); */

/* const hotelRooms = [];


async function jsonOutput() {
    res.json({
      url: "test",
      results: await getBookingRooms(
        "https://m.booking.com/hotel/us/the-roosvelt.en-gb.html?checkin=2020-08-02&checkout=2020-08-06"
      )
    });
  }


return new Promise(resolve => {
          const hotelRooms = ["test"];
          const rooms = document.querySelectorAll(
            `[data-room-id][data-block-id]`
          );
          rooms.forEach(room => {
            hotelRooms.push({ name: "test", text: room.innerText });
          });

          resolve(hotelRooms);
        });

const rooms = document.querySelectorAll(`[data-room-id][data-block-id]`);
rooms.forEach(room => {
  hotelRooms.push({
    hotelname: room.querySelector(`span.room__title-text`).innerText
  });
});
return hotelRooms; */

/* let data = [];
    const html = await page.evaluate(() => {
      return new Promise(resolve => {
        const rooms = document.querySelectorAll(
          `[data-room-id][data-block-id]`
        );
        console.log(rooms);
        const hotelRooms = [];
        rooms.forEach(room => {
          hotelRooms.push({
            roomName: room.querySelector(`span.room__title-text`).innerText
          });
        });
        console.log(hotelRooms.length);
        return resolve(hotelRooms);
      }).then(resolve => {
        return resolve;
      }).then
    }); */

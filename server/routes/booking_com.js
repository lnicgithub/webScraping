/* eslint-disable camelcase */
import express from "express";
import moment, { now } from "moment";
import puppeteer from "puppeteer";
import dataStore from "../models/dbModel";

const router = express.Router();

function nullCheck(value) {
  if (value == null) {
    return "";
  }
  return value;
}

router.get("/", (req, res) => {
  res.send("/search for calls to booking");
});

router.get("/search", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // capture query params
  let { location, country, from_date, to_date } = req.query;
  location = nullCheck(location) === "" ? "London" : location;
  country = nullCheck(country) === "" ? "gb" : country;
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

  // convert date strings to moment.js objects
  const from_date_obj = moment(from_date, "DD-MM-YYYY");
  const to_date_obj = moment(to_date, "DD-MM-YYYY");

  // build up string for using with puppeteer
  const searchUrl = `https://m.booking.com/searchresults.en-gb.html?
                    checkin_year=${from_date_obj.format("YYYY")}
                    &checkin_month=${from_date_obj.format("M")}
                    &checkin_monthday=${from_date_obj.format("D")}
                    &checkout_year=${to_date_obj.format("YYYY")}
                    &checkout_month=${to_date_obj.format("M")}
                    &checkout_monthday=${to_date_obj.format("D")}
                    &ss=${location.replace(/\s+/g, "+")}+${country}
  `
    .replace(/\s+/g, "")
    .toLowerCase();
  // use puppeteer to pull html back
  function run(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const urls = await page.evaluate(() => {
          const hotelResults = [];
          const hotels = document.querySelectorAll("div.sr-card__details");

          // once we have the hotel div cards, we can now iterate through them
          if (hotels !== null) {
            hotels.forEach(hotel => {
              hotelResults.push({
                hotelName: hotel.querySelector("h2").innerText,
                hotelRoom: hotel.querySelector(
                  "div.m_sr_card__price_unit_name.m_sr_card__price_small"
                ).innerText,
                Price: hotel.querySelector(
                  "div.mpc-ltr-right-align-helper.sr_price_wrap"
                ).innerText
              });
            });
          }
          // return the array if it has results or not.
          return hotelResults;
        });

        browser.close();
        return resolve(urls);
      } catch (e) {
        return reject(e);
      }
    });
  }

  run(searchUrl)
    .then(results => {
      if (JSON.stringify(results) !== "[]") {
        res.json({ url: `${searchUrl}`, results });
      } else {
        res.json({ message: "No Results" });
      }
    })
    .catch(reject => {
      res.json({ message: "Error", error: `${reject}` });
    });
});

router.get("/hotel", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // capture query params
  let { hotelname, country, from_date, to_date } = req.query;
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

  // convert date strings to moment.js objects

  const from_date_obj = moment(from_date, "DD-MM-YYYY");
  const to_date_obj = moment(to_date, "DD-MM-YYYY");

  // build up string for using with puppeteer
  const searchUrl = `https://m.booking.com/hotel/${country}/${hotelname}.en-gb.html?
                    checkin=${from_date_obj.format("YYYY-MM-DD")}
                    &checkout=${to_date_obj.format("YYYY-MM-DD")}
                    `
    .replace(/\s+/g, "")
    .toLowerCase();

  // query the database for entries beforce attempting to scrape
  dataStore.find(
    {
      hotelName: `${hotelname}`,
      toDate: `${to_date_obj.format("YYYY-MM-DD")}`,
      fromDate: `${from_date_obj.format("YYYY-MM-DD")}`
    },
    { hotelId: 1, hotelName: 1, roomId: 1, roomName: 1, currency: 1, price: 1 },
    async function(err, results) {
      if (err) {
        return res.json({ message: "Error", error: `${err}` });
      }

      if (Array.isArray(results) && results.length) {
        return res.json({ url: searchUrl, results });
      }

      const roomResults = await new Promise(async (resolve, reject) => {
        try {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          const requestTimestamp = moment().valueOf();
          await page.goto(searchUrl);

          const urls = await page.evaluate(
            (fromDate, toDate, hotelName, timeStamp) => {
              const hotelRooms = [];
              const rooms = document.querySelectorAll(
                `[data-room-id][data-block-id]`
              );
              // once we have the room div cards, we can now iterate through them
              if (rooms !== null) {
                rooms.forEach(room => {
                  hotelRooms.push({
                    hotelId: `${hotelName}`,
                    hotelName: `${hotelName}`,
                    roomId: `${room.getAttribute("data-block-id")}`,
                    roomName: room.querySelector(`span.room__title-text`)
                      .innerText,
                    fromDate: `${fromDate}`,
                    toDate: `${toDate}`,
                    currency: room
                      .querySelector(`div.mpc-inline-block-maker-helper > div`)
                      .innerText.replace(/[a-z0-9]/g, ""),
                    price: room
                      .querySelector(`div.mpc-inline-block-maker-helper > div`)
                      .innerText.replace(/[^0-9]/g, ""),
                    requestTimestamp: `${timeStamp}`
                  });
                });
              }
              return hotelRooms;
            },
            from_date_obj.format("YYYY-MM-DD"),
            to_date_obj.format("YYYY-MM-DD"),
            hotelname,
            requestTimestamp
          );

          browser.close();
          // insert newly scraped rows into database
          urls.forEach(res => {
            dataStore.insert(res);
          });
          // return results to calling function
          return resolve(urls);
        } catch (e) {
          return reject(e);
        }
      });
      // output results from the scraping.
      return res.json({ url: searchUrl, roomResults });
    }
  );
});

export default router;

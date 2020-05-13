import puppeteer from "puppeteer";
import moment from "moment";
import { insertRecs, findLatestRequestTimestamp } from "./dbModules";

let browserWSEndpoint = null;

async function getChromeInstance() {
  if (!browserWSEndpoint) {
    let chromeArgs = [];
    if (process.platform === "linux") {
      chromeArgs = ["--no-sandbox", "--disable-dev-shm-usage"];
    }
    const launchArgs = {
      args: [...(chromeArgs || [])],
      executablePath: `${global.chromePath}`,
      headless: true
    };

    await puppeteer.launch(launchArgs).then(resolve => {
      browserWSEndpoint = resolve.wsEndpoint();
    });
  }
  return browserWSEndpoint;
}

async function getBookingRooms(
  hotelName,
  fromDate,
  toDate,
  country,
  requestTimestamp
) {
  // need to make sure it hasnt been scraped already in the last time period
  // this ensures that when we added it to the queue, that it wasnt already
  // on the queue in the last hour
  const timeOffsetUnix = moment()
    .subtract(1, "hours")
    .valueOf();
  const latestRequestTimestamp = await findLatestRequestTimestamp({
    hotelName: `${hotelName}`,
    fromDate: `${fromDate}`,
    toDate: `${toDate}`,
    country: `${country}`
  });

  // if its not higher than the offset, that means it hasnt been
  // scrapped in the last time period
  if (!(latestRequestTimestamp > timeOffsetUnix)) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: await getChromeInstance()
    });
    try {
      const searchUrl = `https://m.booking.com/hotel/${country}/${hotelName}.en-gb.html?
                    checkin=${fromDate}
                    &checkout=${toDate}`
        .replace(/\s+/g, "")
        .toLowerCase();
      console.log(searchUrl);
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);
      await page.goto(searchUrl, {
        waitUntil: "load"
      });
      const records = await page.evaluate(
        async (hotelName, fromDate, toDate, country, timestamp) => {
          /* 3 scenarios need to be accounted for when scraping booking.
           1. page has rooms with prices
           2. page has rooms but is sold out/ unavailable / or dates not correct, i.e to_date before from_date.
           3. page has no rooms
          */
          // No matter what page scenario returns from booking, it will have the [data-block-id] tag
          const rooms = document.querySelectorAll(
            `[data-room-id][data-block-id]`
          );
          // need an empty array for adding rooms to
          const roomsArr = [];

          // lets make sure the has scenario 1. (rooms have prices etc..)
          if (
            !(
              document.querySelectorAll("[class*=no_availability]").length >
                0 ||
              document.querySelectorAll(
                "[class*=m_hp_no_dates_room_card__content]"
              ).length > 0
            )
          ) {
            // Scenario 1 has occured. we can see results, rooms and prices.
            // we can now query specific selectors that only occur for scenario 1.
            rooms.forEach(room => {
              roomsArr.push({
                hotelId: `${hotelName}`,
                hotelName: `${hotelName}`,
                roomId: `${room.getAttribute("data-block-id")}`,
                roomName: `${
                  room.querySelector("span.bui-title__text").innerText
                }`,
                currency: `${room
                  .querySelector(`div.mpc-inline-block-maker-helper > div`)
                  .innerText.replace(/[a-z0-9]/g, "")
                  .substring(0, 1)}`,
                price: `${room
                  .querySelector("div.mpc-inline-block-maker-helper > div")
                  .innerText.replace(/[^0-9]/g, "")}`,
                availability: "Y",
                fromDate: `${fromDate}`,
                toDate: `${toDate}`,
                country: `${country}`,
                requestTimestamp: timestamp
              });
            });
          }
          // Scenario 2 has occured. non availability wrapper exists or rooms exist but not linked to any dates
          // We need to check if any room names exist
          else if (
            document.getElementsByClassName("room__title-text").length > 0
          ) {
            // Scenario 2 - no availability but we have room names
            // we can now query specific selectors that only occur for scenario 2 inc room names.
            rooms.forEach(room => {
              roomsArr.push({
                hotelId: `${hotelName}`,
                hotelName: `${hotelName}`,
                roomId: `${room.getAttribute("data-block-id")}`,
                roomName: `${
                  room.querySelector("[class*=room__title-text]").innerText
                }`,
                currency: "£",
                price: 0,
                availability: "N",
                fromDate: `${fromDate}`,
                toDate: `${toDate}`,
                country: `${country}`,
                requestTimestamp: timestamp
              });
            });
          }
          // if all scenarios fail then an roomsArr will return empty.
          return roomsArr;
        },
        hotelName,
        fromDate,
        toDate,
        country,
        requestTimestamp
      );
      await page.close();
      if (Array.isArray(records) && records.length >= 1) {
        console.log("%d records retrieved", records.length);
        // insert into DB
        records.forEach(room => {
          insertRecs(room);
        });
      } else {
        console.log("%d records retrieved", records.length);
      }
    } catch (e) {
      console.log(`error in scraping - ${e}`);
    }
  }
  // its already been scraped in the last hour, so doing nothing.
  return true;
}

module.exports = { getChromeInstance, getBookingRooms };

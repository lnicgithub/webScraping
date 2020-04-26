import puppeteer from "puppeteer";
import { insertRecs } from "./dbModules";

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

    console.log(chromeArgs.toString());
    await puppeteer.launch(launchArgs).then(resolve => {
      browserWSEndpoint = resolve.wsEndpoint();
    });
  }
  console.log(puppeteer);
  return browserWSEndpoint;
}

async function getBookingRooms(
  hotelName,
  fromDate,
  toDate,
  country,
  requestTimestamp
) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: await getChromeInstance()
  });
  try {
    const searchUrl = `https://m.booking.com/hotel/${country}/${hotelName}.en-gb.html?
                    checkin=${fromDate}
                    &checkout=${toDate}`
      .replace(/\s+/g, "")
      .toLowerCase();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(searchUrl, {
      waitUntil: "load"
    });
    const records = await page.evaluate(
      async (hotelName, fromDate, toDate, country, timestamp) => {
        const hotelRooms = [];
        const rooms = document.querySelectorAll(
          `[data-room-id][data-block-id]`
        );
        rooms.forEach(room => {
          hotelRooms.push({
            hotelId: `${hotelName}`,
            hotelName: `${hotelName}`,
            roomId: `${room.getAttribute("data-block-id")}`,
            roomName: room.querySelector(`span.bui-title__text`).innerText,
            fromDate: `${fromDate}`,
            toDate: `${toDate}`,
            currency: room
              .querySelector(`div.mpc-inline-block-maker-helper > div`)
              .innerText.replace(/[a-z0-9]/g, "")
              .substring(0, 1),
            price: room
              .querySelector(`div.mpc-inline-block-maker-helper > div`)
              .innerText.replace(/[^0-9]/g, ""),
            country: `${country}`,
            requestTimestamp: timestamp
          });
        });
        return hotelRooms;
      },
      hotelName,
      fromDate,
      toDate,
      country,
      requestTimestamp
    );
    await page.close();
    if (Array.isArray(records) && records.length >= 1) {
      // insert into DB
      records.forEach(room => {
        insertRecs(room);
      });
    }
  } catch (e) {
    console.log(`error in scraping - ${e}`);
  }
}

module.exports = { getChromeInstance, getBookingRooms };

import puppeteer from "puppeteer";
import { insertRecs } from "./dbModules";

let browserWSEndpoint = null;

async function getChromeInstance() {
  if (!browserWSEndpoint) {
    const chromeArgs = [];
    if (process.platform === "linux") {
      chromeArgs.push("--no-sandbox");
      chromeArgs.push("--disable-dev-shm-usage");
    }
    await puppeteer
      .launch({
        headless: true,
        executablePath: process.env.CHROME_BIN,
        args: [`${chromeArgs}`]
      })
      .then(resolve => {
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
              .innerText.replace(/[a-z0-9]/g, ""),
            price: room
              .querySelector(`div.mpc-inline-block-maker-helper > div`)
              .innerText.replace(/[^0-9]/g, ""),
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
        console.log(room);
        insertRecs(room);
      });
    }
  } catch (e) {
    console.log(`error in scraping - ${e}`);
  }
}

module.exports = { getChromeInstance, getBookingRooms };

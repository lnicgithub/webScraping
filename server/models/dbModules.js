// import Datastore from "nedb";
import Datastore from "nedb-async";

const dataStore = new Datastore({
  filename: "datafile.db",
  autoload: true,
  timestampData: true
});

async function findRecs(json) {
  const results = await dataStore.asyncFind(json, {
    hotelName: 1,
    roomId: 1,
    roomName: 1,
    currency: 1,
    price: 1,
    _id: 0
  });
  return results;
}

async function insertRecs(json) {
  const results = await dataStore.asyncInsert(json);
  return results;
}

module.exports = { dataStore, findRecs, insertRecs };

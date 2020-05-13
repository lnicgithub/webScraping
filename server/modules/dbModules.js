// import Datastore from "nedb";
import Datastore from "nedb-async";

const dataStore = new Datastore({
  filename: "datafile.db",
  autoload: true,
  timestampData: true
});

async function findAllRecs(json) {
  const results = await dataStore.asyncFind(json, {
    hotelName: 1,
    roomName: 1,
    availability: 1,
    currency: 1,
    price: 1,
    country: 1,
    requestTimestamp: 1,
    _id: 0
  });
  return results;
}

async function findLatestRequestTimestamp(json) {
  // sorting by max requestTimestamp, must use -1 to sort highest first.
  try {
    const results = await dataStore.asyncFindOne(json, [
      ["sort", { requestTimestamp: -1 }]
    ]);
    if (results) {
      return results.requestTimestamp;
    }
    return 0;
  } catch (e) {
    console.log(e);
  }
  return 0;
}

async function insertRecs(json) {
  const results = await dataStore.asyncInsert(json);
  return results;
}

module.exports = {
  dataStore,
  findAllRecs,
  insertRecs,
  findLatestRequestTimestamp
};

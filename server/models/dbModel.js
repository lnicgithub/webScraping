import Datastore from "nedb";

const dataStore = new Datastore({
  filename: "datafile.db",
  autoload: true,
  timestampData: true
});

module.exports = dataStore;

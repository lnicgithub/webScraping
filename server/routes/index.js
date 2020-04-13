import express from "express";
import dataStore from "../models/dbModel";

const router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  dataStore.insert({ testfdf: "testEttntry" }, function(err, newRec) {
    if (err) {
      return console.log(err);
    }
    return newRec;
  });

  res.send("index site");
});

export default router;

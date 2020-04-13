// app.js
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index";
import booking_comRouter from "./routes/booking_com";

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/index", indexRouter);
app.use("/booking_com", booking_comRouter);
app.set("port", process.env.PORT || 3000);
module.export = app;
app.listen(app.get("port"), () => {
  app.emit("listened", null);
  console.log(`Server started at: http://localhost:${app.get("port")}`);
});

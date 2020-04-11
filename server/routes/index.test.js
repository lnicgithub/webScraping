const supertest = require("supertest");
const server = require("../app.js");

before(done => {
  server.on("listened", done());
  console.log("in the before");
});

describe("GET root dir", function() {
  it("it should has status code 200", function(done) {
    supertest("http://localhost:3000")
      .get("/")
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        done();
      });
  });
});

describe("GET scrape dir", function() {
  it("it should has status code 200", function(done) {
    supertest("http://localhost:3000")
      .get("/scrape")
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        done();
      });
  });
});

describe("GET bookingcom dir", function() {
  it("it should has status code 200", function(done) {
    supertest("http://localhost:3000")
      .get("/bookingcom")
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        done();
      });
  });
});

after(done => {
  done();
});

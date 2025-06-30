const express = require("express");
const router = express.Router();
const axios = require("axios");
const moment = require("moment-timezone");

const API_URL = process.env.API_URL;
const BASE_URL = process.env.BASE_URL;

const CACHE_EXPIRATION_TIME = 2; // 2 minutes
let cachedData = null;
let lastFetchTime = null;

const APP_URL = process.env.APP_URL;

// Function to fetch data
async function makeRequests() {
  try {
    const [streams_DB, competition_DB] = await Promise.all([
      axios.get(API_URL + "/get-all-american-streams"),
      axios.get(API_URL + "/get-all-american-competition"),
    ]);

    cachedData = {
      streams: streams_DB.data || [],
      competition: competition_DB.data || [],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    // Optionally handle error by keeping old data or setting defaults
  }
}

function timeRemaining(targetDate) {
  // // Parse the ISO date
  // const targetTime = moment.tz(targetDate, "America/New_York");

  // // Get the current time
  // const now = moment.tz("America/New_York");

  // // Calculate the time difference
  // const timeDiff = targetTime.diff(now);

  // // Handle expired dates
  // if (timeDiff <= 0) {
  //   return "Match Started";
  // }

  // // Convert the difference to hours, minutes, and seconds
  // const duration = moment.duration(timeDiff);

  // const hours = duration.hours();
  // const minutes = duration.minutes();
  // const seconds = duration.seconds();

  // // Format the time left string
  // let timeLeft;
  // if (hours > 0) {
  //   timeLeft = `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${
  //     minutes > 1 ? "s" : ""
  //   }`;
  // } else if (minutes > 0) {
  //   timeLeft = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  // } else {
  //   timeLeft = `${seconds} second${seconds > 1 ? "s" : ""}`;
  // }

  const targetTime = moment
    .tz(targetDate, "America/New_York")
    .format("MMM DD, YYYY h:mm A");

  return targetTime + " ET";
}

router.get("/", async (req, res) => {
  const host = req.protocol + "://" + req.headers.host;

  const now = moment();

  if (
    !lastFetchTime ||
    now.diff(lastFetchTime, "minutes") >= CACHE_EXPIRATION_TIME
  ) {
    await makeRequests();
    lastFetchTime = now;
  }

  // Render the response with cached data
  res.render("home.ejs", {
    streams: cachedData.streams,
    competitions: cachedData.competition,
    timeRemaining,
    host,
    BASE_URL,
    APP_URL,
    moment,
  });
});

router.get("/category/:competition", async (req, res) => {
  const host = req.protocol + "://" + req.headers.host;

  const now = moment();

  if (
    !lastFetchTime ||
    now.diff(lastFetchTime, "minutes") >= CACHE_EXPIRATION_TIME
  ) {
    await makeRequests();
    lastFetchTime = now;
  }

  const filtered_streams = await cachedData.streams.filter(
    (stream) =>
      stream.competition.competition_url_string === req.params.competition
  );

  // Render the response with cached data
  res.render("home.ejs", {
    streams: filtered_streams,
    competitions: cachedData.competition,
    timeRemaining,
    host,
    BASE_URL,
    APP_URL,
    moment,
  });
});

router.get("/event/:url_string/:id", async (req, res) => {
  function timeRemaining(targetDate) {
    // Parse the ISO date
    const targetTime = moment.tz(targetDate, "America/New_York");

    // Get the current time
    const now = moment.tz("America/New_York");

    // Calculate the time difference
    const timeDiff = targetTime.diff(now);

    // Handle expired dates
    if (timeDiff <= 0) {
      return "Match Started";
    }

    // Convert the difference to hours, minutes, and seconds
    const duration = moment.duration(timeDiff);

    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    let timeLeft;

    timeLeft = `${hours < 10 ? "0" + hours : hours}:${minutes}:${seconds}`;

    return `${timeLeft}`;
  }

  function matchStartedCheck(targetDate) {
    // Parse the ISO date
    const targetTime = moment.tz(targetDate, "America/New_York");

    // Get the current time
    const now = moment.tz("America/New_York");

    // Calculate the time difference in milliseconds
    const timeDiff = targetTime.diff(now);

    // Convert milliseconds to hours
    const hoursLeft = moment.duration(timeDiff).hours();

    // Check if one hour or less is left
    if (hoursLeft <= 0) {
      return true;
    } else {
      return false;
    }
  }
  const now = moment();
  if (
    !lastFetchTime ||
    now.diff(lastFetchTime, "minutes") >= CACHE_EXPIRATION_TIME
  ) {
    await makeRequests();
    lastFetchTime = now;
  }

  const stream = cachedData.streams.find(
    (event) => event.id == req.params.id
  );

  if (!stream) {
    return res.redirect("/");
  }

  const host = req.protocol + "://" + req.headers.host;

  const domain = req.headers.host

  

  res.render("detail-page.ejs", {
    stream,
    moment,
    timeRemaining,
    matchStartedCheck,
    host,
    BASE_URL,
    APP_URL,
    domain
  });
});

module.exports = router;

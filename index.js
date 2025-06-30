const express = require("express");
require("dotenv").config();
const app = express();
const geoip = require('geoip-lite');

app.use(express.static(__dirname + "/public"));

const User_Routes = require("./routes/User/User_Routes");

// app.use((req, res, next) => {
    
//   const allowedCountries = ['DE', 'AU', 'US', 'CA', 'PK'];

//   const forwarded = req.headers['x-forwarded-for'];
//   const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;

//   const geo = geoip.lookup(ip);

//   if (geo && allowedCountries.includes(geo.country)) {
//     next(); 
//   } else {
//     res.redirect("https://energystreams.site/")
//   }
// });

app.use("/", User_Routes);

app.use((req, res, next) => {
  res.redirect("/");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

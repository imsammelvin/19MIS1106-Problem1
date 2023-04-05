const express = require("express");
const axios = require("axios");

const app = express();

// Middleware to validate URLs
const validateUrls = (req, res, next) => {
  const incomingUrls = req.query.url;
  //console.log(incomingUrls);

  if (!incomingUrls || !Array.isArray(incomingUrls)) {
    return res.status(400).json({
      message: "The URL parameter is missing or invalid",
    });
  }

  const validUrls = incomingUrls.filter((url) =>
    /^https?:\/\/[^\s]+$/.test(url)
  );

  if (validUrls.length === 0) {
    return res.status(400).json({
      message: "The URL parameter does not contain any valid URLs",
    });
  }

  req.urls = validUrls;
  next();
};

app.get("/numbers", validateUrls, (req, res) => {
  const urls = req.urls;

  Promise.all(urls.map((url) => axios.get(url)))
    .then((responses) =>
      Promise.all(responses.map((response) => response.data))
    )
    .then((data) => {
      // console.log(data);

      const result = [];

      data.forEach((obj) => {
        obj.numbers.forEach((num) => {
          if (!result.includes(num)) {
            result.push(num);
          }
        });
      });
      result.sort((a, b) => a - b);

      res.status(200).json({
        message:
          "Data fetched successfully and the resultant array is Calculated",
        result: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error fetching data" });
    });
});

app.listen(3001, () => console.log("Server started on port 3001"));

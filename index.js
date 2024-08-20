const http = require("http");
const https = require("https");

const server = http.createServer((req, res) => {
  const bodyPromise = new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", (err) => {
      reject(err);
    });
  })
    .then((body) => {
      // Process the complete body here
      console.log(body);

      const externalRequestPromise = new Promise((resolve, reject) => {
        const options = {
          hostname: "vhcalnplci.dummy.nodomain",
          port: 8000, 
          path: "/sap/bw/xml/soap/xmla2",
          method: "POST",
        };

        const externalReq = http.request(options, (externalRes) => {
          let data = "";
          externalRes.on("data", (chunk) => {
            data += chunk;
          });
          externalRes.on("end", () => {
            resolve(data);
          });
        });
        externalReq.write(body);
        externalReq.on("error", (error) => {
          console.error("Error calling external service:", error);
          reject(error);
        });

        externalReq.end();
      });

      externalRequestPromise
        .then((externalResponseData) => {
          console.log("Response from external service:", externalResponseData);
          res.end("Data from external service: " + externalResponseData);
        })
        .catch((error) => {
          console.error("Error handling external service response:", error);
          res.statusCode = 500;
          res.end("Error calling external service");
        });
    })
    .catch((err) => {
      console.error("Error:", err);
    });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

var admin = require("firebase-admin");


const serviceAccount = require("../serviceAccountKey.json")
// console.log("process env", process.env);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://helloworld-4784e.firebaseio.com"
});

console.log("initialised firebase app");

const checkAuth = (req, res, next) => {
  if (req.headers.authtoken) {
    // console.log("<" + req.headers.authtoken + ">");
    admin
      .auth()
      .verifyIdToken(req.headers.authtoken)
      .then((decodedToken) => {
        console.log("decoded token", decodedToken);
        req.user = decodedToken;
        next();
      })
      .catch(() => {
        console.log("some problem with token. Unable to decode");
        return res.status(403).send({
          message: "Unauthorized",
        });
      });
  } else {
    return res.status(403).send({
      message: "no authtoken provided in header",
    });
  }
};

module.exports = checkAuth;

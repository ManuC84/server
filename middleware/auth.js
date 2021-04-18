const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// async function verify() {
//   const ticket = await client.verifyIdToken({
//     idToken: token,
//   });
//   const payload = ticket.getPayload();
//   const userid = payload["sub"];
// }

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(403)
        .json({ error: "You need to be logged in to proceed" });
    }
    const isCustomAuth = token.length < 500;

    let decodedData;
    const client = new OAuth2Client();

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.TOKEN_SECRET);

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
      // verify.catch(console.error);
    }

    next();
  } catch (error) {
    res.status(401).json({
      authError:
        "There's an issue with your authentication, please log in and try again",
    });
  }
};

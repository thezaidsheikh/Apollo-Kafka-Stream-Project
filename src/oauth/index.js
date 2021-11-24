let db = require("../models");
let model = module.exports;
let bcrypt = require("bcrypt");
let constant = require("../constant");

// Used to authenticate the client
model.getClient = function (clientId, clientSecret, callback) {
  console.log(
    "in getClient (clientId: " +
      clientId +
      ", clientSecret: " +
      clientSecret +
      ")"
  );
  let where = {
    clientId: clientId,
    clientSecret: clientSecret,
  };
  if (clientSecret === null) {
    return db.OAuthClients.findOne({ where: { clientId: clientId } }).then(
      callback
    );
  }
  db["client"]
    .findOne({where})
    .then((client) => {
      console.log("client found in get client ==>", client);
      if (!client) {
        callback("unauthorized client found");
      }
      client.grants = [
        "authorization_code",
        "password",
        "refresh_token",
        "client_credentials",
      ];
      callback(null, client);
    })
    .catch((error) => {
      console.log("error in getting");
      callback(error);
    });
};

// Used to authenticate the user. Supports password grant type
model.getUser = function (username, password, callback) {
  console.log(
    "in getUser (username: " +
      username.toLowerCase() +
      ", password: " +
      password +
      ")"
  );
  db["user"]
    .findOne({
      email: username,
    })
    .then((userFound) => {
      console.log("user found in get user ==>", userFound);
      if (!userFound) callback("please check your email");
      bcrypt.compare(password, userFound.password, (err, same) => {
        if (same) callback(null, userFound.dataValues);
        else callback("please check your password");
      });
    })
    .catch((error) => {
      console.log("error in get user ===>", error);
      callback(error);
    });
  };

// Used to save the generated token in db.
model.saveToken = async function (token, clientId, user, callback) {
  console.log(
    "in saveAccessToken (token: " +
      token +
      ", clientId: " +
      clientId +
      ", userId: " +
      user +
      ", expires: "
  );
  let userId = user.id;
  let accessToken = await db["access_token"].findOne({
user_id: user.id
  });
  let refreshToken = await db["refresh_token"].findOne({
    user_id: user.id
  });
  if (accessToken) {
    await db["access_token"].deleteOne({
      id: accessToken.id
    });
  }
  if (refreshToken) {
    await db["refresh_token"].deleteOne({
      id: refreshToken.id
    });
  }
  Promise.all([
    db["access_token"].create({
      token: token.accessToken,
      expire_time: token.accessTokenExpiresAt,
      client_id: clientId.id,
      user_id: userId,
    }),
    db["refresh_token"].create({
      token: token.refreshToken,
      expire_time: token.refreshTokenExpiresAt,
      client_id: clientId.id,
      user_id: userId,
    }),
  ])
    .then(async (accessToken) => {
      db["user"]
        .updateOne(
          { id: userId },
          {
            current_login: Date.now(),
            previous_login: Date.now(),
            isLogin: true,
            token: token.accessToken,
            token_expiry: token.accessTokenExpiresAt,
          },
        )
        .then((userLoginUpdate) => {
          console.log("User updated........", userLoginUpdate);
        })
        .catch((err) => {
          console.log("Error..in save access token user update..", err);
        });

      callback(null, {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: clientId,
        user: {
          id: user.id,
          scope: user.scope,
          role: user.role,
          isLogin: user.isLogin,
          name: user.name,
          email: user.email,
        },
      });
    })
    .catch((error) => {
      console.log("error in save token ===>", error);
      callback(error);
    });
};

// Used to check if the user scope is valid or not.
model.validateScope = async function (user, client, scope) {
  if (user.scope != scope) {
    return false;
  }
  return scope;
};

// Used to verify the scope.
model.verifyScope = async function (token, scope) {
  if (!token.scope) {
    return false;
  }
  return true;
};

// Used to check access token is valid or not.
model.getAccessToken = async function (accessToken, callback) {
  try {
    console.log("in getAccessToken (bearerToken: " + accessToken + ")");
    let checkToken = await db["access_token"].findOne({
      token: accessToken
    });
    if (checkToken) {
      callback(null, {
        accessToken: checkToken.token,
        accessTokenExpiresAt: checkToken.expire_time,
        scope: checkToken.user.scope,
        client: checkToken.client.id, // with 'id' property
        user: checkToken.user,
      });
    }
  } catch (error) {
    console.log("error in get token ===>", error);
    callback(400, error);
  }
};

// This will have to be updated as per our need.

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to restrict certain grant types
// var authorizedClientIds = [constant.oauth.CLIENT_ID];

model.grantTypeAllowed = function (clientId, grantType, callback) {
  console.log(
    "in grantTypeAllowed (clientId: " +
      clientId +
      ", grantType: " +
      grantType +
      ")"
  );
};

/* * Required to support refreshToken grant type  */
model.saveRefreshToken = function (token, clientId, expires, user, callback) {
  console.log(
    "in saveRefreshToken (token: " +
      token +
      ", clientId: " +
      clientId +
      ", userId: " +
      user +
      ", expires: " +
      expires +
      ")"
  );
};

model.getRefreshToken = function (refreshToken, callback) {
  console.log("in getRefreshToken (refreshToken: " + refreshToken + ")");
  
};

model.revokeRefreshToken = function (refreshToken, callback) {
  console.log("in revoke token" + refreshToken);
  
};

comparePassword = function (candidatePassword, password, cb) {
 
};

const checkLoggedIn = (req, res, next) => {
  if (!res.locals.user) {
    res.status(401).send();
    return;
  }
  return next();
};

export default checkLoggedIn;

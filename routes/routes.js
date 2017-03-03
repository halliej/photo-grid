
module.exports = (express, app) => {
  const router = express.Router();
  router.get('/', (req, res) => {
    res.render('index', {});
  });
  app.use('/', router);
};

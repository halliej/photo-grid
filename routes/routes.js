
module.exports = (express, app, formidable, fs, os, gm, knoxClient, mongoose, io) => {
  const router = express.Router();

  let Socket;
  io.on('connection', (socket) => {
    Socket = socket;
  });

  const singleImage = new mongoose.Schema({
    filename: String,
    votes: Number
  });

  const singleImageModel = mongoose.model('singleImage', singleImage);

  router.get('/', (req, res) => {
    res.render('index', { host: app.get('host') });
  });

  router.post('/upload', (req, res) => {
    console.log('in upload route');
    function generateFileName(filename) {
      const extRegex = /(?:\.([^.]+))?$/;
      const ext = extRegex.exec(filename)[1];
      const date = new Date().getTime();
      const charBank = 'abcdefghijklmnopqrstuvwxyz';
      let fstring = '';
      for (let i = 0; i < 15; i++) {
        fstring += charBank[parseInt(Math.random() * 26)];
      }
      return (`${fstring}${date}.${ext}`);
    }

    let tmpFile;
    let nfile;
    let fname;
    const newForm = new formidable.IncomingForm();
    newForm.keepExtensions = true;
    newForm.parse(req, (error, fields, files) => {
      tmpFile = files.upload.path;
      fname = generateFileName(files.upload.name);
      nfile = `${os.tmpDir()}/${fname}`;
      res.writeHead(200, { 'Content-type': 'text/plain' });
      res.end();
    });
    newForm.on('end', () => {
      fs.rename(tmpFile, nfile, () => {
        gm(nfile).resize(300).write(nfile, () => {
          fs.readFile(nfile, (err, buf) => {
            const saveFile = knoxClient.put(fname, {
              'Content-Length': buf.length,
              'Content-Type': 'imge/jpeg'
            });
            saveFile.on('response', (response) => {
              if (response.statusCode === 200) {
                new singleImageModel({
                  filename: fname,
                  votes: 0
                }).save();
                Socket.emit('status', { msg: 'Saved', delay: 3000 });
                Socket.emit('doUpdate', {});
                fs.unlink(nfile, () => {
                  console.log('Local file deleted');
                });
              }
            });

            saveFile.end(buf);
          });
        });
      });
    });
  });

  app.use('/', router);
};

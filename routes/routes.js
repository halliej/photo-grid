
module.exports = (express, app, formidable, fs, os, gm, knoxClient) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.render('index', { host: app.get('host') });
  });

  router.post('/upload', (res, req) => {
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

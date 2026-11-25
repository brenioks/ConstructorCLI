import express from 'express';
import path from 'node:path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const app = express();
const PORT = 3015;

const FILE_SYSTEM_PAGE = '/cdn';
const BUILD_DIR = 'test/build';
const ORIGIN_DIR = path.join(__dirname, BUILD_DIR);

var DomainUrl = '';

const isObjectEmpty = (objectName) => {
  return Object.keys(objectName).length === 0
}
function getJSONDirFiles(dirpath) {
    let physicalDirPath = path.join(ORIGIN_DIR, dirpath);
    let filenameUrlDict = {};
    let files = fs.readdirSync(physicalDirPath);
    files.forEach(filename => {
        let fileurl = `${dirpath}${(!dirpath.endsWith('/')? '/' : '')}${filename}`;
        let physicalPath = path.join(physicalDirPath, filename);
        if (!fs.existsSync(physicalPath))
            return;
        let isDirectory = fs.statSync(physicalPath).isDirectory();
        let dirSlash = isDirectory? '/' : '';
        let folderIcon = isDirectory? '📁 ' : '';
        filenameUrlDict[folderIcon + filename + dirSlash] = DomainUrl + FILE_SYSTEM_PAGE + fileurl.replaceAll(' ', '%20') + dirSlash;
    });
    return filenameUrlDict;
}

app.get(`${FILE_SYSTEM_PAGE}{*splat}`, (req, res, next) => {
    if (DomainUrl == '')
        DomainUrl = `${req.protocol}://${req.host}`;

    let fileurl = req.path.replace(FILE_SYSTEM_PAGE, '');
    let physicalPath = path.join(ORIGIN_DIR + fileurl);
    physicalPath = physicalPath.replaceAll('%20', ' ');
    if (!fs.existsSync(physicalPath))
        return res.status(404);
    
    if (fs.statSync(physicalPath).isDirectory()) {
        const JSONfiles = getJSONDirFiles(fileurl);
        let response = 'empty directory.';
        if (!isObjectEmpty(JSONfiles)) {
            response = JSONfiles;
        }
        return res.status(200).json(response);
    }
    res.download(physicalPath, err => {
        if (!err) return;
        if (err.status !== 404) return next(err);

        return res.status(404);
    });
});

app.get('/{*splat}', (req, res) => {
    res.send("no existance");
});

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}` + ` http://localhost:${PORT}`);
});

app.use(FILE_SYSTEM_PAGE, express.static(BUILD_DIR));
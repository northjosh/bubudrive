import multer from 'multer'

export const ROOT_DIR = process.env.ROOT_DIR || "../bubu/";

const storage = multer.diskStorage({
    destination: ROOT_DIR,
    filename: (_req, file, cb) =>{
        cb(null, file.originalname);

    }
})

export const upload = multer({ storage })




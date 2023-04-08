import { Router } from "express";

import { nanoid } from "nanoid";

import Formidable from "formidable";
import client from "../../lib/connection/db";
import fs from "node:fs";
import async, { AsyncMemoIterator } from "async";
import path from "node:path";
import { STATUS } from "../../lib/constants";
import multer from "multer";

const uploadRouter = Router();

const storage = multer.diskStorage({
  destination: "./public/images/products/",
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "." +
      file.mimetype.split("/")[1];
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
const type = upload.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "additionalImage", maxCount: 3 },
  { name: "backImage", maxCount: 1 },
]);

uploadRouter.post("/", type, async (req, res, next) => {
  let fields = req.body;
  let files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  let filesArray = Object.values(files) as [Express.Multer.File[]];
  let imageLinks = filesArray
    .reduce<Express.Multer.File[]>((files, file) => [...files, ...file], [])
    .map((file) => {
      return file.filename;
    });

  if (imageLinks?.length < 2) {
    imageLinks?.length && deleteFiles(imageLinks);
    return res.sendStatus(STATUS.BAD_REQUEST);
  }

  const product = {
    ...fields,
    id: nanoid(),
    discountPercentage: parseFloat(fields.discountPercentage ?? 0),
    images: JSON.stringify(imageLinks),
    colors: JSON.stringify(fields.colors?.split(",") || []),
    sizes: JSON.stringify(fields.sizes?.split(",") || []),
    stock: parseInt(fields.stock),
  };

  const query = `INSERT INTO Product SET ?`;
  await client.query(query, product);

  res.json({ success: true });

  // form.parse(req, async (errors, fields, files) => {
  //   console.log({ fields, files });
  //   try {
  //     if (errors) throw new Error(errors);

  //     const fileKeys = Object.keys(files);

  //     const uploadFile: AsyncMemoIterator<string, string[], Error> = function (
  //       memo,
  //       key: string,
  //       cb
  //     ) {
  //       const file = files[key];
  //       if (Array.isArray(file)) {
  //         const additionalFiles = file;
  //         async.times(
  //           additionalFiles.length,
  //           (n, next) => {
  //             saveFile(key, additionalFiles[n], (err, filename) => {
  //               next(err, filename);
  //             });
  //           },
  //           (err, images) => {
  //             const additionalImages = (memo as string[]).concat(
  //               images as string[]
  //             );
  //             cb(null, additionalImages);
  //           }
  //         );
  //       } else {
  //         saveFile(key, file, (err, filename) => {
  //           if (err) return cb(err.message);
  //           (memo as string[]).push(filename as string);
  //           cb(err, memo);
  //         });
  //       }
  //     };

  //     async.reduce(
  //       //@ts-ignore
  //       fileKeys,
  //       [],
  //       uploadFile,
  //       async (err, images) => {
  //         try {
  //           if (!images?.length) new Error("no-images");

  //           return res.json({ success: true });
  //         } catch (e: any) {
  //           images?.forEach((image) => {
  //             fs.unlinkSync(path.resolve("./public/images/products/", image));
  //           });
  //           return res.json({ success: false, message: e.message });
  //         }
  //       }
  //     );
  //   } catch (e: any) {
  //     return res.json({ error: e.message });
  //   }
  // });
});

function deleteFiles(filePaths: string[]) {
  filePaths.forEach((path) =>
    fs.unlinkSync("./public/images/products/" + path)
  );
}

// const saveFile = (
//   key: string,
//   file: Formidable.File,
//   callback: (err: any, filename?: string) => void
// ) => {
//   const uniqueSuffix = Date.now() + "-" + nanoid();
//   const filename =
//     key + "_" + uniqueSuffix + "." + file.mimetype!.split("/")[1];
//   fs.readFile(file.filepath, function (err, data) {
//     fs.writeFile("./public/images/products/" + filename, data, function (err) {
//       fs.unlink(file.filepath, function (err) {
//         if (err) {
//           callback(err);
//         } else {
//           callback(null, filename);
//         }
//       });
//     });
//   });
// };

export default uploadRouter;

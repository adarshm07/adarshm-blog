// import AWS from "aws-sdk";
// import fs from "fs";

// AWS.config.update({
//   accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY,
// });

// const S3_BUCKET = process.env.S3_BUCKET;
// const REGION = process.env.REGION;
// const URL_EXPIRATION_TIME = 60; // in seconds

// const myBucket = new AWS.S3({
//   params: { Bucket: S3_BUCKET },
//   region: REGION,
// });

// // export function generatePreSignedPutUrl(req, res) {
// //   const { fileName, fileType } = req.body;

// //   myBucket.getSignedUrl(
// //     "putObject",
// //     {
// //       Bucket: S3_BUCKET,
// //       Key: fileName,
// //       ContentType: fileType,
// //       Expires: URL_EXPIRATION_TIME,
// //     },
// //     function (err, url) {
// //       if (err) res.status(401).json(err);
// //       else return res.status(200).json({ signedUrl: url });
// //     }
// //   );
// // }

// // export function generatePreSignedGetUrl(req, res) {
// //   const { fileName } = req.body;
// //   myBucket.getSignedUrl(
// //     "getObject",
// //     {
// //       Key: fileName,
// //       Expires: URL_EXPIRATION_TIME,
// //     },
// //     function (err, url) {
// //       if (err) res.status(401).json(err);
// //       else return res.status(200).json({ previewUrl: url });
// //     }
// //   );
// // }

// // export function getImageUrl(req, res) {
// //   console.log("here");
// //   const { fileName, fileType } = req.body;
// //   // console.log(fileName, S3_BUCKET);
// //   myBucket.getObject(
// //     {
// //       Bucket: S3_BUCKET,
// //       Key: fileName,
// //     },
// //     function (err, data) {
// //       if (data) {
// //         let buf = Buffer.from(data.Body);
// //         let base64 = buf.toString("base64");
// //         console.log("here.", data);
// //         let image = `data:${fileType};base64,${base64}`;
// //         return res.status(200).json(image);
// //       } else {
// //         throw new Error(err);
// //       }
// //     }
// //   );
// // }
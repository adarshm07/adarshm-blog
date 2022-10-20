import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.S3_BUCKET;
const REGION = process.env.REGION;
const URL_EXPIRATION_TIME = 60; // in seconds

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

export function generatePreSignedPutUrl(req, res) {
  const { fileName, fileType } = req.body;

  myBucket.getSignedUrl(
    "putObject",
    {
      Bucket: S3_BUCKET,
      Key: fileName,
      ContentType: fileType,
      Expires: URL_EXPIRATION_TIME,
    },
    function (err, url) {
      if (err) res.status(401).json(err);
      else return res.status(200).json({ signedUrl: url });
    }
  );
}

export function generatePreSignedGetUrl(req, res) {
  const { fileName } = req.body;
  myBucket.getSignedUrl(
    "getObject",
    {
      Key: fileName,
      Expires: URL_EXPIRATION_TIME,
    },
    function (err, url) {
      if (err) res.status(401).json(err);
      else return res.status(200).json({ previewUrl: url });
    }
  );
}

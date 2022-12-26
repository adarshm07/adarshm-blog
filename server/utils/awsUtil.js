import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY,
});

const S3_BUCKET = process.env.S3_BUCKET;
const REGION = process.env.REGION;

const s3 = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

export async function upload(imageName, base64Image, type) {
  const date = new Date().getDate();
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const customDateString = `${date}-${month}-${year}`;

  const params = {
    Bucket: S3_BUCKET,
    Key: `assets/images/${customDateString}/${imageName}`,
    Body: new Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    ),
    ContentType: type,
  };

  let data;

  try {
    data = await promiseUpload(params);
  } catch (err) {
    console.error(err);
    return "";
  }

  return data.Location;
}

function promiseUpload(params) {
  return new Promise(function (resolve, reject) {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

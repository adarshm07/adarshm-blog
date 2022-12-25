import { useEffect, useState } from 'react';
import { Text, Image, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
// import S3 from "react-aws-s3";
const S3 = require('react-aws-s3')

export default function ImageUpload() {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [progress, setProgress] = useState<number>(0);

    // aws s3 image upload
    const config = {
        bucketName: process.env.NEXT_PUBLIC_S3_BUCKET,
        dirName: 'assets/images',
        region: process.env.NEXT_PUBLIC_REGION,
        accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_SECRET_ACCESS_KEY,
    }
    // react s3 bucket

    useEffect(() => {
        async function uploadImage(file: any) {
            console.log('image', config);

            const ReactS3Client = new S3(config);
            if (file) {
                await ReactS3Client
                    .uploadFile(file, 'file')
                    .then((data: any) => console.log(data))
                    .catch((err: any) => console.error(err.message))
            }
        }
        uploadImage(files[0])
    }, [files])

    // preview uploaded image
    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return (
            <Image
                key={index}
                src={imageUrl}
                imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
                alt="Image Upload"
            />
        );
    });

    return (
        <div>
            <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles} multiple={false} loading={false}>
                <Text align="center">Drop images here</Text>
            </Dropzone>

            <SimpleGrid
                // cols={4}
                // breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
                mt={previews.length > 0 ? 'xl' : 0}
            >
                {previews}
            </SimpleGrid>
        </div>
    );
}
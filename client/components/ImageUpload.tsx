import { useState } from 'react';
import { Text, Image, SimpleGrid } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import axios from 'axios';
import { apiDomain } from '../config/mediaUrls';

export default function ImageUpload() {
    const [files, setFiles] = useState<FileWithPath[]>([]);

    async function uploadImage(img: any) {
        const file = img[0];
        const convertedFile = await convertToBase64(file);

        await axios.post(
            `${apiDomain}/posts/upload`,
            {
                image: convertedFile,
                imageName: file.name,
                lastModified: file.lastModified
            }
        );
    }

    const convertToBase64 = (file: any) => {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            }
        })
    }

    // preview uploaded image
    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        uploadImage(files);
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
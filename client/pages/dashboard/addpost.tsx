import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import RichText from '../../components/RichText';
import { useSelector } from "react-redux"
import Layout from '../../components/Layout';
import { Checkbox, LoadingOverlay } from '@mantine/core';
import { apiDomain, domain } from '../../config/mediaUrls';

export default function AddPost() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("PUBLISH");
  const [author, setAuthor] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [authors, setAuthors] = useState<string[]>([""]);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const userData = useSelector((state: any) => state.user);

  useEffect(() => {
    const listOfAllAuthors = async () => {
      await axios.get(`${apiDomain}/posts/getAllAuthors`)
        .then((res: any) => {
          setAuthors(res.data)
          setAuthor(userData?.user._id)
        })
        .catch((err) => console.log(err));
    }

    listOfAllAuthors()
  }, [userData?.user._id])

  const handleImageUpload = useCallback(
    (file: File): Promise<string> =>
      new Promise(async (resolve, reject) => {
        setImageLoading(true);
        const convertedFile = await convertToBase64(file);

        await axios.post(
          `${apiDomain}/posts/upload`,
          {
            image: convertedFile,
            imageName: file.name,
            lastModified: file.lastModified
          }
        ).then((res: any) => {
          if (res.status === 200) setImageLoading(false)
          resolve(res.data.link)
        }).catch(() => reject(new Error('Upload failed')));
      }),
    []
  );

  const convertToBase64 = (file: any) => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      }
    })
  }

  const publish = async () => {
    let data = JSON.stringify({ title, description, slug, categories, status, author, metaTitle, metaDescription })

    console.log('data', title, description, slug, categories, status, author, metaTitle, metaDescription);

    var config = {
      method: 'post',
      url: `${apiDomain}/posts/publish`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.user.token}`
      },
      data: data
    };

    axios(config)
      .then(function (res) {
        return true;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <Layout>
      <div style={{ width: "100%", position: 'relative' }}>
        <LoadingOverlay visible={imageLoading} overlayBlur={2} />
        <div className="container mx-auto mt-20 flex justify-center gap-12">
          <div className="flex flex-col flex-1 w-4/6">
            <input type={"text"} value={title} onChange={(e) => {
              setTitle(e.target.value)
              setSlug(e.target.value.split(' ').join('-').replace(/['/`~!#*$@_%+=.,^&(){}[\]|;:"<>?\\]/g, ""))
            }} id="post_title" placeholder='Post Title' className='w-100 border border-1 rounded p-2' />
            <div className="d-flex align-items-center">
              <span>{domain + '/'}</span>
              <input type={"text"} value={slug} disabled={disabled} onChange={(e) => setSlug(e.target.value.split(' ').join('-'))} id="slug" className='my-4 w-100' style={{
                background: !disabled ? '' : 'transparent',
                border: !disabled ? '' : '0',
                color: !disabled ? '' : '#020202'
              }} />
              <button className='btn btn-link p-0' onClick={() => setDisabled(!disabled)} style={{ fontSize: "14px" }}>{disabled ? 'Edit' : 'Save'}</button>
            </div>
            <RichText value={description} onChange={setDescription} onImageUpload={handleImageUpload} id="rte" />
            <div className='my-4'></div>
            <input type={"text"} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} id="meta_title" placeholder='Meta Title' className='w-100 my-2 border border-1 rounded p-2' />
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} id="meta_description" placeholder='Meta Description' className='w-100 my-2 border border-1 rounded p-2' />
          </div>

          <div className="flex flex-col gap-4 w-1/6">
            <Checkbox.Group
              defaultValue={['react']}
              orientation="vertical"
              label="Category"
              spacing="xs"
              size="xs"
              onChange={setCategories}
            >
              <Checkbox value="react" label="React" />
              <Checkbox value="svelte" label="Svelte" />
              <Checkbox value="ng" label="Angular" />
              <Checkbox value="vue" label="Vue" />
            </Checkbox.Group>
            <select className='form-control' name="status" id="status" onChange={(e) => setStatus(e.target.value)}>
              <option value="PUBLISH">Publish</option>
              <option value="DRAFT">Draft</option>
              <option value="TRASH">Trash</option>
            </select>

            <select className='form-control' name="author" id="author" onChange={(e) => setAuthor(e.target.value)}>
              {authors?.map((item: any, index: any) => {
                return (
                  <option key={index} value={item._id}>{item.username}</option>
                )
              })}
            </select>
            <button className='btn btn-primary' onClick={publish}>Publish</button>
          </div>
        </div >
      </div>
    </Layout>
  )
}
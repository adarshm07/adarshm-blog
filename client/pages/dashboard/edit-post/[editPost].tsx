import axios from 'axios';
import { useState, useEffect } from 'react';
import RichText from '../../../components/RichText';
import { useSelector } from "react-redux"
import Layout from '../../../components/Layout';
import { Checkbox } from '@mantine/core';
import Router from 'next/router';
import { apiDomain } from '../../../config/mediaUrls';

function EditPost() {
  const [post, setPost] = useState<any>("")
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("PUBLISH");
  const [author, setAuthor] = useState<string[]>([""]);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [authors, setAuthors] = useState<string[]>([""]);

  const userData = useSelector((state: any) => state.user);

  const { query } = Router

  // get list of authors
  const listOfAllAuthors = async () => {
    await axios.get(`${apiDomain}/posts/getAllAuthors`)
      .then((res: any) => {
        setAuthors(res.data)
        // setAuthor([userData?.user._id])
      })
      .catch((err) => console.log(err));
  }


  useEffect(() => {
    async function getPost() {
      await axios.get(`${apiDomain}/posts/edit-post/${query.editPost}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.user.token}`
          }
        })
        .then((res) => {
          let data = res.data;
          setPost(data);
        })
    }

    getPost()


    setTitle(post.title)
    setDescription(post.description)
    setMetaTitle(post.metaTitle)
    setMetaDescription(post.metaDescription)
    setSlug(post.slug)
    setAuthor(post && post.author && post.author[0]?.username)
    setStatus(post.status)

    if (post === 'Not authenticated.') Router.push('/login')

    listOfAllAuthors();
  }, [userData?.user._id])

  const publish = async () => {
    let data = JSON.stringify({ title, description, slug, categories, status, author, metaTitle, metaDescription })

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
      <div className="container mt-5">
        <div className="row">
          <div className="col-9">
            <input type={"text"} value={title} onChange={(e) => setTitle(e.target.value)} id="post_title" placeholder='Post Title' className='w-100 border border-1 rounded p-2' />
            <div className="d-flex align-items-center">
              <span>{window.location.origin + '/'}</span>
              <input type={"text"} value={slug} onChange={(e) => setSlug(e.target.value.split(' ').join('-'))} id="slug" className='w-100 my-4 border-0' />
            </div>
            <RichText value={description} onChange={setDescription} id="rte" />
            <div className='my-4'></div>
            <input type={"text"} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} id="meta_title" placeholder='Meta Title' className='w-100 my-2 border border-1 rounded p-2' />
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} id="meta_description" placeholder='Meta Description' className='w-100 my-2 border border-1 rounded p-2' />
          </div>

          <div className="col-3 d-flex flex-column gap-4">
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
            <select className='form-control' name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PUBLISH">Publish</option>
              <option value="DRAFT">Draft</option>
              <option value="TRASH">Trash</option>
            </select>
            <div className='d-flex'>
              <label htmlFor="author">Author: </label>
              {/* <p >{post && post.author && post.author[0]?.username}</p> */}
            </div>
            <select className='form-control' name="author" id="author" onChange={(e) => setAuthor([e.target.value])}>
              {authors?.map((item: any, index: any) => {
                return (
                  <option key={index} value={item._id}>{item.username}</option>
                )
              })}
            </select>

            <button className='btn btn-primary' onClick={publish}>Publish</button>
          </div>
        </div>
      </div >
    </Layout >
  )
}

export default EditPost;
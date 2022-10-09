import axios from 'axios';
import { useState, useEffect } from 'react';
import RichText from '../../components/RichText';
import { useSelector } from "react-redux"

export default function AddPost() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [status, setStatus] = useState<string>("PUBLISHED");
  const [author, setAuthor] = useState<[string]>([]);
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [authors, setAuthors] = useState<[string]>([]);

  const userData = useSelector((state: any) => state.user);

  useEffect(() => {
    const listOfAllAuthors = async () => {
      await axios.get('http://localhost:4000/posts/getAllAuthors')
        .then((res: any) => {
          setAuthors(res.data)
          setAuthor([userData?.user._id])
        })
        .catch((err) => console.log(err));
    }

    listOfAllAuthors()
  }, [])

  const publish = async () => {
    let data = JSON.stringify({ title, description, slug, categories, status, author, metaTitle, metaDescription })

    var config = {
      method: 'post',
      url: 'http://localhost:4000/posts/publish',
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
    <div className="container">
      <input type={"text"} value={title} onChange={(e) => setTitle(e.target.value)} id="post_title" placeholder='Post Title' className='w-100 my-4 border border-1 rounded p-2' />
      <input type={"text"} value={slug} onChange={(e) => setSlug(e.target.value)} id="slug" className='w-100 my-4 border border-1 rounded p-2' />
      <RichText value={description} onChange={setDescription} id="rte" />
      <div className='my-4'></div>
      {/* SEO */}
      <input type={"text"} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} id="meta_title" placeholder='Meta Title' className='w-100 my-2 border border-1 rounded p-2' />
      <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} id="meta_description" placeholder='Meta Description' className='w-100 my-2 border border-1 rounded p-2' />

      <select name="status" id="status" onChange={(e) => setStatus(e.target.value)}>
        <option value="PUBLISH">Publish</option>
        <option value="DRAFT">Draft</option>
        <option value="TRASH">Trash</option>
      </select>

      <select name="author" id="author" onChange={(e) => setAuthor([e.target.value])}>
        {authors?.map((item) => {
          return (
            <option key={item._id} value={item._id}>{item.username}</option>
          )
        })}
      </select>

      <button className='btn btn-primary' onClick={publish}>Publish</button>
    </div >
  )
}
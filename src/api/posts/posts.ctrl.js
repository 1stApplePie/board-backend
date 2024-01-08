import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';
import sanitizeHtml from 'sanitize-html';
import { ObjectId } from 'mongodb';

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

export const getPostById = async (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    res.status(400).send();
    return;
  }
  try {
    const post = await Post.findById(id);
    if (!post) {
      console.log('getPostById, no posts');
      res.status(404).send();
      return;
    }
    res.locals.post = post;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
};

export const checkOwnPost = (req, res, next) => {
  const { user, post } = res.locals; // Destructure post from res.locals
  if (post.user._id.toString() !== user._id) {
    res.status(403).send();
    return;
  }
  return next();
};

/*
POST /api/posts
{
    title: 'title',
    body: 'body',
    tags: ['tag1', 'tag2']
}
*/
export const write = async (req, res) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  // validation
  const result = schema.validate(req.body);
  if (result.error) {
    res.status(400);
    res.send(result.error);
    return;
  }

  const { title, body, tags } = req.body;
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: res.locals.user,
  });
  try {
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* GET /api/posts */
/* GET /api/posts?username=&tag=&page= */
export const list = async (req, res) => {
  // 페이지 기능
  const page = parseInt(req.query.page || '1', 10);

  if (page < 1) {
    res.status(400);
    res.send({ Error: 'Invalid Access' });
    return;
  }

  const { tag, username } = req.query;
  const query = {
    ...(username ? { 'user.username': username } : {}),
    ...(tag ? { tags: tag } : {}),
  };
  try {
    const posts = await Post.find()
      .sort({ publishedDate: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments().exec();
    res.set('Last-Page', Math.ceil(postCount / 10));
    res.send(
      posts
        .map((post) => post.toJSON())
        .map((post) => ({
          ...post,
          body:
            post.body.length < 200
              ? post.body
              : `${post.body.slice(0, 200)}...`,
        })),
    );
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* GET /api/posts/:id */
export const read = async (req, res) => {
  res.json(res.locals.post);
};

/* DELETE /api/posts/:id */
export const remove = async (req, res) => {
  console.log(res.locals);
  const { post } = res.locals;
  try {
    const deletedPost = await Post.findOneAndDelete({ _id: post._id }).exec();
    if (!deletedPost) {
      // If the post was not found, send a 404 response
      res.status(404).send({ error: 'Post not found' });
      return;
    }

    // Send a 204 (No Content) response for a successful deletion
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/*
PATCH /api/posts/:id
{
    title: '수정',
    body: '수정 내용',
    tags: ['수정', '태크']
}
*/
export const update = async (req, res) => {
  const { post } = res.locals;
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // validation
  const result = schema.validate(req.body);
  if (result.error) {
    res.status(400);
    res.send(result.error);
    return;
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(post._id, req.body, {
      new: true,
    }).exec();

    if (!updatedPost) {
      res.status(404).send({ error: 'Invalid access' });
      return;
    }

    res.send(updatedPost);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const checkObejctId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    res.status(400).send({ error: 'Invalid ObjectId' });
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
    body,
    tags,
  });
  try {
    await post.save();
    res.send(post);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* GET /api/posts */
export const list = async (req, res) => {
  // 페이지 기능
  const page = parseInt(req.query.page || '1', 10);

  if (page < 1) {
    res.status(400);
    res.send({ Error: 'Invalid Access' });
    return;
  }
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
  const { id } = req.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      res.status(404).send({ error: 'Invalid post' });
      return;
    }
    res.send(post);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/* DELETE /api/posts/:id */
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    res.status(204).send({ error: 'Invalid access' });
  } catch (e) {
    console.log(e);
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
  const { id } = req.params;
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
    const post = await Post.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    if (!post) {
      res.status(404).send({ error: 'Invalid access' });
      return;
    }
    res.send(post);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

import Post from './models/post.js';
import mongoose from 'mongoose';

export default async function createFakeData() {
  // Clear existing data
  await mongoose.connection.collections['posts'].deleteMany({});

  const user = {
    _id: '6598e272a606882edabbb87d',
    username: 'root',
    publishedDate: new Date(),
    __v: 0,
  };

  const samplePost = {
    title: '123',
    body: '<p>123</p>',
    tags: ['123'],
    user,
  };

  const posts = [...Array(40).keys()].map((i) => ({
    title: `포스트 #${i}`,
    body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: ['가짜', '데이터'],
    user,
  }));

  // Insert sample post and additional posts
  await Post.insertMany([samplePost, ...posts]);
}

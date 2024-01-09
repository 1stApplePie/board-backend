import mongoose from 'mongoose';
import Comment from './comment.js';

const { Schema } = mongoose;

const CommentSchema = new Schema({
  body: String,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
  comments: [CommentSchema], // Add this line to include comments as an array
});

const Post = mongoose.model('Post', PostSchema);
export default Post;

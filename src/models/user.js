import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 화살표 함수가 아닌 function 키워드 사용 -> this를 사용하기 위함
// function에서의 this는 문서 인스턴스를 가리킴
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, saltRounds);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '3d',
    },
  );
  return token;
};

// static 함수에서의 this는 모델을 가리킴 -> User
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;

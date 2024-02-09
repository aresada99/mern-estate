import User from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken';


export const signup = async (request, response) => {
    const { username, email, password } = request.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword })
    try {
        await newUser.save();
        response.status(201).json("User created successfully");
    } catch (error) {
        response.status(500).send({success:false, message:error.message})
    }
}

export const signin = async (request, response) => {
    const { email, password } = request.body;
    try {
        const validUser = await User.findOne({ email });
        if (!validUser) return response.status(404).send({success:false, message:'User not found!'})
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return response.status(401).send({success:false, message:'Wrong credentials!'})
        const token = jwt.sign({id: validUser._id},process.env.JWT_SECRET)
        const {password: pass, ...rest} = validUser._doc;
        response.cookie('access_token', token,{httpOnly:true}).status(200).json(rest);
        
    } catch (error) {
        response.status(500).send({success:false, message:error.message})
    }
}

export const google = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = user._doc;
        res
          .cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json(rest);
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
        const newUser = new User({
          username:
            req.body.name.split(' ').join('').toLowerCase() +
            Math.random().toString(36).slice(-4),
          email: req.body.email,
          password: hashedPassword,
          avatar: req.body.photo,
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = newUser._doc;
        res
          .cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json(rest);
      }
    } catch (error) {
      response.status(500).send({success:false, message:error.message})
    }
  };
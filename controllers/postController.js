const {v4: uuid} = require('uuid')
const fs = require('fs')
const path = require('path')
const HttpError = require("../models/errorModel")
const Post = require('../models/postModel')
const User = require('../models/userModel')

//===========================CREATE A POST
// POST : api/post
// PROTECTED
module.exports.createPost = async (req, res, next)=>{
    try {
        let {title, category, content} = req.body
        if (!title || !category || content.length < 12 || !req.files){
            return next(new HttpError('Fill in all fields and choose thumbnail', 422))
        }
        
        const {thumbnail} = req.files;
        // check thumbnail size
        if (thumbnail.size > 2000000){
            return next(new HttpError('Thumbnail should be less than 2mb', 422))
        }
        let fileName = thumbnail.name
        splits = fileName.split('.')
        let newFileName = splits[0] + uuid() + '.' + splits[splits.length - 1]
        if (!fs.existsSync(path.join(__dirname, '..', 'uploads'))){
            fs.mkdirSync(path.join(__dirname, '..', 'uploads'))
        }
        thumbnail.mv(path.join(__dirname, '..', '/uploads', newFileName), async(err) => {
            if(err){
                return next(new HttpError(err))
            } else {
                const newPost = await Post.create({title, category, content, thumbnail: newFileName, creator: req.user.id})
                if (!newPost){
                    return next(HttpError('Post could not be created', 422))
                }
                // find user and increment post
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
                res.status(200).json(newPost)
            }
        })
    } catch (error) {
        return next(new HttpError(error))
    }
}



// ======================GET ALL POSTS
// GET: api/posts
// UNPROTECTED
module.exports.getAllPosts = async (req, res, next)=>{
      try {
        const posts = await Post.find().sort({updatedAt: -1})
        res.json(posts)
      } catch (error) {
        return next(new HttpError(error))
      }
}

// ======================GET POST BY ID
// GET: api/posts/:id
// UNPROTECTED
module.exports.getPostById = async(req, res, next)=>{
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post){
            return next(new HttpError('Post not found', 404))
        }
        res.status(200).json(post) 
    } catch (error) {
        return next(new HttpError(error))
    }
}

// ======================= GET POST BY CATEGORY
// GET: api/posts/categories/:category
// PROTECTED
module.exports.getPostsByCategory = async(req, res, next)=>{
    try {
        const { category } = req.params;
        const postsByCategory = await Post.find({category}).sort({updatedAt: -1});
        if (postsByCategory.length === 0){
            return next(new HttpError('No post found for category', 404))
        }
        res.status(200).json(postsByCategory)
    } catch (error) {
        return next(new HttpError(error))
    }  
}

// ======================= GET POST BY CATEGORY
// GET: api/posts/users/:id
// UNPROTECTED
module.exports.getPostsByUser = async(req, res, next)=>{
    try {
        const { id } = req.params;
        const posts = await Post.find({creator: id}).sort({updatedAt: -1});
        return res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error))
    }
}


// ======================= EDIT POST
// PATCH: api/posts/:id
// PROTECTED
module.exports.editPost = async(req, res, next)=>{
    try {
        let fileName, newFileName, updatedPost;
        const postId = req.params.id;
        // get the title category and content of the post
        let { title, category, content } = req.body;
        // ReactQuill has a paragraph opening and closing tag
        // with a break tag in between so there are 11
        // characters in there already
        if (!title || !category || content?.length < 12){
            return next(new HttpError('All fields required.', 422))
        }
        // gets the post object for the postId
        const oldPost = await Post.findById(postId);
        // checks if the post creator corresponds to the token owner
        if (oldPost.creator == req.user.id){
            if(!req.files){
                // update without thumbnail
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, content}, {new: true})
            } else {
                // updates user with new thumbnail
                // check if old thumbnail exists and delete it
                if(fs.existsSync(path.join(__dirname, '..', 'uploads', oldPost.thumbnail))){
                    fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async(err)=> {
                        if (err){
                            return next(new HttpError(err))
                        }
                    })
                }
                //upload new file
                const {thumbnail} = req.files;
                // check thumnail size
                if (thumbnail.size > 2000000){
                    return next(new HttpError('Thumbnail size must be less than 2mb'));
                }
                fileName = thumbnail.name;
                let splits = fileName.split('.')
                newFileName = splits[0] + uuid() + '.' + splits[splits.length - 1];

                // move thumnail to the uploads directory
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName), async(err)=> {
                    if (err){
                        return next(new HttpError(err))
                    }
                })
                updatedPost = await Post.findByIdAndUpdate(postId, {title, category, content, thumbnail: newFileName}, {new: true})
            }
        }
        if (!updatedPost){
            return next(new HttpError('Unable to update post', 400))
        }
        return res.status(200).json(updatedPost);
    } catch (error) {
        return next(new HttpError(error))
    }
} 



// ======================= DELETEPOST
// DELETE: api/posts/:id
// PROTECTED
module.exports.deletePostById = async(req, res, next)=>{
    res.send('Dlete Post')
}
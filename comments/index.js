const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' }
  })
  res.status(201).send(comments);
});
app.post('/events', async (req, res) => {
  console.log('Received Event', req.body.type)
  const { data, type } = req.body;
  if (type === 'CommentModerated') {
    let comments = commentsByPostId[data.postId];
    const commentIndex = comments.findIndex(comment => comment.id === data.id);
    console.log(comments[commentIndex])
    comments[commentIndex] = data;
    commentsByPostId[data.postId] = comments;
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data
    })
  }
  res.send({})
})
app.listen(4001, () => {
  console.log('Listening on 4001');
});

const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const app = express()
app.use(bodyParser.json())
app.use(cors())
const posts = {}

app.get('/posts', (req, res) => {
    res.send(posts)
})
const handleEvent = (type, data) => {
    if (type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { id, title, comments: [] }
    }
    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        const post = posts[postId];
        post.comments.push({ id, content, status })
    }
    if (type === 'CommentUpdated') {
        const { id, postId } = data;
        const post = posts[postId];
        let comments = post.comments
        const commentIndex = comments.findIndex(comment => comment.id === id);
        comments[commentIndex] = { ...data }
        posts[postId].comments = comments
    }
}
app.post('/events', (req, res) => {
    const { type, data } = req.body
    handleEvent(type, data)
    res.send({})

})


app.listen(4002, async () => {
    console.log('Query running on 4002');
    const res = await axios.get('http://event-bus-srv:4005/events');
    console.log(res.data, 'res')
    res.data.forEach(event => {
        console.log('Processing data:', event.type)
        handleEvent(event.type, event.data)
    })
})
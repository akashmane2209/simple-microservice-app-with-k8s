const express = require('express');
const bodyParser = require('body-parser')
const axios = require('axios')
const app = express();

app.use(bodyParser.json())

app.post('/events', (req, res) => {

    setTimeout(async () => {
        const { data, type } = req.body;
        if (type === 'CommentCreated') {
            if (!data.content.indexOf('orange')) {
                data.status = 'rejected'
            } else {
                data.status = 'approved';
            }
            await axios.post('http://event-bus-srv:4005/events', {
                type: 'CommentModerated',
                data
            })
        }
        res.send({})

    }, 2000)
})

app.listen(4003, () => {
    console.log('Moderation runnnig on 4003')
})
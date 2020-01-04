const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const multer  = require('multer')
const upload = multer()
const mongoose = require('mongoose')


const jwt = require('jsonwebtoken')
const expressjwt = require('express-jwt')
const db = require('./setting/database')

const server = express()
const port = 8000

const secret = "azertyuiopmlkjhgfdsqwcvbnppouyfcjvc,;v"

server.set('views','./views');
server.set('view engine','ejs');


//middlewares 
server.use(express.static('/public'));
server.use(expressjwt({ secret:secret })
    .unless({
        path:[
            '/',
            '/books',
            '/movies-search',
            '/login'
        ]
    }
))

var urlencodedParser = bodyParser.urlencoded({ extended: false })

let booksCi = [
    {title:"Le monde s'effrondre",author:"chimoire achebé "},
    {title:"L'etranger ",author:"Albert camus "},
    {title:"Merci l'artiste",author:"Isai biton coulibaly "},
    {title:"L'ordonnance",author:"soro keffala "},
    
]

db();

server.get('/',async(req,res)=>{
    const API_KEY = "7843f8d22a43911f15301ef8d76338ae"
    let movies_date ;

    const query = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=fr-FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&year=2019`
    let filmss =await axios.get(query)
        .then((response)=>{
            let tab =  getCurrentMovies(response.data.results)
            return tab
        })
    
    function getCurrentMovies(movies) {
        let tab=[]
        for (film of movies) {
            movies_date = new Date(film.release_date).getTime()
            dateResult = Date.now() - movies_date
            if (new Date(film.release_date).getTime() > 1568505600000 ){
                tab.push(film) 
            }                   
        }
        return tab
    }
    res.render('index',{tableau:filmss})
});

server.get('/books',(req,res)=>{
    const title = 'une liste de romans et leur auteur'
    res.render('books',{test:title,books:booksCi });
})

server.post('/books',upload.fields([]),(req,res)=>{
    if (!req.body) {
        return res.sendStatus(500)
    } else {
        const formData =  req.body
        console.log('formData : ',formData)
        const newBooks ={title:req.body.titre,author:req.body.auteur}
        if (req.body.titre && req.body.auteur) {
            booksCi = [...booksCi,newBooks]
            console.log(booksCi);
        }
        res.redirect("/books");
    }
})
server.get('/login',(req,res)=>{
    res.render('login',{title:'login page '})
})

let fakeUser = {
    email:'tresormhd@gmail.com',
    name:"tresor zb",
    password:"zetre"
}

server.post('/login',urlencodedParser,(req,res)=>{
    console.log('donné recueilli ' , req.body)
    if (!req.body ) {
        res.sendStatus(500) 
    } else {
        if (fakeUser.email === req.body.email && fakeUser.password === req.body.password) {
            myToken = jwt.sign({
                iss:'http://themoviesapp.ci',
                user:'tresor',
                name:fakeUser.name ,
                email:fakeUser.email,
                role:'moderator'
            },secret);

            res.json({
                myToken
            })
        }else{
            res.sendStatus(401)
        }
    }
})

server.get('/member_only',(req,res)=>{
    console.log('req.user',req.user)
    res.send(req.user)
})

server.get('/movies-search',(req,res)=>{
    res.render('movies_search')
})

server.get('/books/:id',(req,res)=>{
    const id = req.params.id
    const txt = `salut la compagnie ! ici la page de tout les livres a la page ${id}`
    res.render('books',{test:txt,books:booksCi})
})

server.listen(port,()=> console.log(`demarre sur le port  ${port}`) );
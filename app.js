const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const multer  = require('multer')
const upload = multer()

mongoose = require('mongoose')

const jwt = require('jsonwebtoken')
const expressjwt = require('express-jwt')
const faker = require('faker')
const db = require('./setting/database')

const server = express()
const port = process.env.port || 8000
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
            '/login',
            new RegExp('/books.*/','i'),
            new RegExp('/books-detail.*/','i'),
        ]
    }
))

var urlencodedParser = bodyParser.urlencoded({ extended: false })

let booksCi = []
            // db connexion
            db();
        
            var movieSchema = new mongoose.Schema({
                movieTitle:{
                    type:String
                },
                movieYear:{
                    type:Number
                }
            })
            const moviesModels = mongoose.model('Movies',movieSchema);

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
    moviesModels.find((err,findData)=>{
        if (err) {
            console.error(err)
        } else {
            console.log('data',findData)
            booksCi = findData
            res.render('books',{test:title,moviesData:booksCi });
        }
    })
})

server.post('/books',upload.fields([]),urlencodedParser,(req,res)=>{
    if (!req.body) {
        return res.sendStatus(500)
    } else {
        console.log('formData : ',req.body)
        const myMovie = new moviesModels({ 
            movieTitle:req.body.titre,
            movieYear:req.body.annéeDeSortie
        })
        myMovie.save((err,MovieSaved)=>{
            if (err) {
                console.error(err)
                return;
            } else {
                console.log('data saved', MovieSaved)
            }
        })
        res.status(201).redirect('/books')
    }
})
server.get('/books/:id',(req,res)=>{
    const id = req.params.id
    const txt = `salut la compagnie ! ici la page de tout les livres a la page ${id}`
    res.render('books-detail',{test:txt,books:booksCi})
})   
server.get('/books-detail/:id',(req,res)=>{
    const id = req.params.id
    moviesModels.findById(id,(err,movie)=>{
        if (err) {
            res.status(500).json({
                status:false,
                message:err
            })
        }
        res.render('books-detail',{books:booksCi,moviesff:movie})
    })
})
server.put('/books-detail/:id',urlencodedParser,(req,res)=>{
    if (!req.body) {
        res.sendStatus(500)
    }
        const id = req.params.id

        moviesModels.findByIdAndUpdate(id,{$set: {
            movieTitle:req.body.titre, 
            movieYear:req.body.annéeDeSortie
        }},{new: true},(err,movie)=>{
            if (err) {
                console.log('error',err)
                return res.send('mise a jour echoué | update fail')
            }
            res.redirect('/books')
        })
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



server.listen(port,()=> console.log(`demarre sur le port  ${port}`) );
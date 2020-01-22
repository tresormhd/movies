
var moviesSchema = new mongoose.Schema({
    movieTitle:{
        type:String
    },
    movieYear:{
        type:Number
    }
   
    
})

module.exports = mongoose.model('movies',moviesSchema);
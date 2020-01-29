const mongoose = require('mongoose');

const connection = async ()=>{
  const dbName = 'moviesDB'
    try {
        await mongoose.connect(`mongodb://localhost:27017/${dbName}`,{
          useNewUrlParser:true,
          useFindAndModify:false,
          useUnifiedTopology:true,
        })
        console.log('connected to mongodb')

    }catch(err){
        console.log('oups',err)

    }
    
}

module.exports = connection

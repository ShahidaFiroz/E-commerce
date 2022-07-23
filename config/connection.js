

const mongoClient=require('mongodb').MongoClient
const state={   
    db:null
}




module.exports.connect = function(done){
    const url ='mongodb+srv://shahidafiroz:eoU1dkxGFuSoUdfG@fashionstore.gg20w.mongodb.net/?retryWrites=true&w=majority'
    const dbname='fasionstore'

mongoClient.connect(url,(err,data)=>{
    if(err) return done(err)
    state.db = data.db(dbname)

    done()
})

}

module.exports.get=function(){
    return state.db
}
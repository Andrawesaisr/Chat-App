const generateMessages= (username,text)=>{
    return{
        username,
        text,
        CreatedAt: new Date().getTime()
    }
}

const generatelocationMessages=(username,lo)=>{
return {
    username,
    lo,
    CreatedAt: new Date().getTime()
}
}

module.exports={
    generateMessages,
    generatelocationMessages
}
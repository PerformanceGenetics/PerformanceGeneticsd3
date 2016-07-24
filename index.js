var express = require("express");
var app = express();
var PORT =process.env.PORT || 3000;
var engine = require("./engine");

app.use(express.static("public"));

app.get("/gettree/:group", engine.gettree);

app.get("/gethaplogroups",engine.gethaplogroups);


app.listen(PORT,function(){

  console.log("server started at port"+PORT);
})



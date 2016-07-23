var express = require("express");
var app = express();
var PORT =process.env.PORT || 3000;
var engine = require("./engine");

app.use(express.static("public"));

app.get("/getdata", engine.getdata);

app.get("/gethaplotypes",engine.gethaplotype);


app.listen(PORT,function(){

  console.log("server started at port"+PORT);
})



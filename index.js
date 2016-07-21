var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var _ = require("underscore");
var express = require("express");
var app = express();
var PORT =3000;
// spreadsheet key is the long id in the sheets URL 
var doc = new GoogleSpreadsheet('1OvqesdGFNMGAnQU12iVX-eq7g3cM_th4zvFhPN4ldvk');
var sheet;

app.use(express.static("public"));

async.series([
  function setAuth(step) {
    // see notes below for authentication instructions! 
    var creds = require('./auth.json');
    doc.useServiceAccountAuth(creds, step);
  }
]);


app.get("/getdata",function(req,res){
    doc.getInfo(function(err, info) {
var jsonData =[];
      sheet = info.worksheets[0];
      sheet.getRows(function( err, rows ){

        var props = ["haplogroup","haplotype","lowe","color","childid","name","parentid"];
        for(var i=0;i<rows.length;i++)
        {
          map = _.pick(rows[i],props);
          jsonData.push(map)
        }

        res.send(createTrees(jsonData));

        //res.send(jsonData);

      });

    });

})

var dataTree = [];

var grping = function(json,childid){

  var grp =_.groupBy(json, function(obj){
    return obj.parentid==childid;
  })

  var children = grp.true;
  var child;
  if(children !=undefined) {

      _.each(children, function (child) {
          child["children"] = grping(json, child.childid);
      })

  }

  return children;
}


var createTrees = function(json){

var parent = _.find(json,function(obj){
  return obj.parentid =="null";

})
  var obj = parent;
  obj["children"] = grping(json,parent.childid);

    return obj;
}

app.listen(PORT,function(){

  console.log("server started at port"+PORT);
})



/**
 * Created by abhishekrathore on 7/23/16.
 */


module.exports = {
    "gettree":getCustomTree,
    "gethaplogroups":gethaplogroups,
    "getwinners":getwinners
}

var async = require('async');
var _ = require("underscore");
var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('1OvqesdGFNMGAnQU12iVX-eq7g3cM_th4zvFhPN4ldvk');
var sheet,sheetDataStore,sheetDataStore2;
var worksheets = [
    {title:"haplogroup",
    cols:["haplogroup","haplotype","lowe","color","childid","name","parentid","description"]
    },
    {title:"winners",
        cols:["distance","haplotype","colour"]
    }];
var schedule = require('node-schedule');




var groupRecursively = function(json,childid){
    var children,child;

    var grp =_.groupBy(json, function(obj){
        return obj.parentid==childid;
    });

    children = grp.true;

    if(children !=undefined) {
        _.each(children, function (child) {
            child["children"] = groupRecursively(json, child.childid);
        })

    }

    return children;
}
var createTrees = function(json){

    var parent = _.find(json,function(obj){
        return obj.parentid =="null";

    })
    parent["children"] = groupRecursively(json,parent.childid);

    return parent;
}

var getSheetDataJSON = function(success,sheetTitle) {
    async.waterfall([function (cb) {
        doc.getInfo(function (err, info) {
            cb(null, info);
        })
    }
        ,
        function (info, cb) {
            var jsonData = [];
            var sheet =  _.find(info.worksheets,function(w){
                return w.title == sheetTitle;
            });
            var localsheet =  _.find(worksheets,function(w){
                return w.title == sheetTitle;
            });
            sheet.getRows(function (err, rows) {

                _.each(rows, function (row) {
                    jsonData.push(_.pick(row, localsheet.cols));
                });
                cb(null, jsonData);


            });

        }
    ], function (err, result) {
        console.log("data loaded");
        success(result)
    })
}

var getdata = function(){

    console.log("getdata");

   var storeJson = function(json){
       sheetDataStore =json;
   };
    var storeJson2 = function(json){
        sheetDataStore2 =json;
    };

    getSheetDataJSON(storeJson,worksheets[0].title);

    getSheetDataJSON(storeJson2,worksheets[1].title);

}



function getCustomTree(req,res){
    var haplogroup = req.params.group;


    res.send(createTrees(_.filter(sheetDataStore,{"haplogroup":haplogroup})));


}

function gethaplogroups(req,res){

      var haplogroup =  _.uniq(_.pluck(sheetDataStore,"haplogroup"));
        res.send({haplogroup:haplogroup});


}


var j = schedule.scheduleJob('*/5 * * * *', function(){
    getdata();
});



function getwinners(req,res){

    var haplotypes = _.groupBy(sheetDataStore2,"haplotype");

    var types = _.uniq(_.pluck(sheetDataStore2,"haplotype"));

    var max = _.max(haplotypes,function(h){
        return h.length;
    })


    var output = []
    var i;
    for(i=0;i<max.length;i++){
        var obj ={}
        _.each(types,function(type){
            if(haplotypes[type][i]) {
                obj[type] = haplotypes[type][i]["distance"]
            }
            else{
                obj[type] =0;
            }
        })
        output.push(obj);

    }
   var obj ={};

    _.each(types,function(type){
        if(haplotypes[type][0]) {
            obj[type] = haplotypes[type][0]["colour"]
        }
        else{
            obj[type] =0;
        }

    })
    output.push(obj);

   res.send(output);



}


async.series([
    function setAuth(step) {
        // see notes below for authentication instructions!
        var creds = require('./auth.json');
        doc.useServiceAccountAuth(creds, step);
    },
    getdata
]);




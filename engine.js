/**
 * Created by abhishekrathore on 7/23/16.
 */


module.exports = {
    "gettree":getCustomTree,
    "gethaplogroups":gethaplogroups
}

var async = require('async');
var _ = require("underscore");
var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('1OvqesdGFNMGAnQU12iVX-eq7g3cM_th4zvFhPN4ldvk');
var sheet,sheetDataStore;
var props = ["haplogroup","haplotype","lowe","color","childid","name","parentid"];




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

var getSheetDataJSON = function(success) {
    async.waterfall([function (cb) {
        doc.getInfo(function (err, info) {
            cb(null, info);
        })
    }
        ,
        function (info, cb) {
            var jsonData = []
            var sheet = info.worksheets[0];
            sheet.getRows(function (err, rows) {

                _.each(rows, function (row) {
                    jsonData.push(_.pick(row, props));
                });
                cb(null, jsonData);


            });

        }
    ], function (err, result) {
        console.log("data loaded");
        success(result)
    })
}

var getdata = function(req,res){

    console.log("getdata");

   var storeJson = function(json){
       sheetDataStore =json;
       console.log(json);
   };


    getSheetDataJSON(storeJson);

}


function getCustomTree(req,res){
    var haplogroup = req.params.group;


    res.send(createTrees(_.filter(sheetDataStore,{"haplogroup":haplogroup})));


}

function gethaplogroups(req,res){

      var haplogroup =  _.uniq(_.pluck(sheetDataStore,"haplogroup"));
        res.send({haplogroup:haplogroup});


}


async.series([
    function setAuth(step) {
        // see notes below for authentication instructions!
        var creds = require('./auth.json');
        doc.useServiceAccountAuth(creds, step);
    },
    getdata
]);




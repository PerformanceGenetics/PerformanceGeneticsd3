/**
 * Created by abhishekrathore on 7/23/16.
 */

var async = require('async');
var _ = require("underscore");
var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('1OvqesdGFNMGAnQU12iVX-eq7g3cM_th4zvFhPN4ldvk');
var sheet;
var props = ["haplogroup","haplotype","lowe","color","childid","name","parentid"];


async.series([
    function setAuth(step) {
        // see notes below for authentication instructions!
        var creds = require('./auth.json');
        doc.useServiceAccountAuth(creds, step);
    }
]);

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
            console.log("info", info);
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
        success(result)
    })
}

var getdata = function(req,res){


   var jsonToTree = function(json){
       res.send(createTrees(json))
   };

    getSheetDataJSON(jsonToTree);

}
var gethaplotype = function(req,res){

    doc.getInfo(function(err, info) {

        var jsonData = [], sheet = info.worksheets[0];

    })

}


module.exports = {
    "getdata":getdata,
    "gethaplotype":gethaplotype
}
var odbc = require("odbc");

var cn = "DRIVER={MYSQL};SERVER=127.0.0.1;UID=root;PWD=rootpass;DATABASE=dbms_lab";
var db;


module.exports = new Promise(function(resolve,reject){
    async.function(function(response){
        db = odbc.connect(cn);
        resolve(odbc);
    });
});
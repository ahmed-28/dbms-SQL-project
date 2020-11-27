var mysql = require('mysql');
var util = require('util');


async function setup(){

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'rootpass',
    database : 'dbms_lab'
  });
if(db) console.log("connected to your DB!!"); 
const query = util.promisify(db.query).bind(db);

const userTableQuery = `CREATE TABLE USERS(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                USERNAME VARCHAR(200),
                                PASSWORD VARCHAR(200)
                                );`;
await query(userTableQuery);
console.log("users table done");

const productTableQuery = `CREATE TABLE PRODUCT(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                SELLER_ID INT,
                                NAME VARCHAR(200),
                                PRICE INT,
                                DESCRIPTION VARCHAR(200),
                                TYPE VARCHAR(200),
                                BRAND VARCHAR(200),
                                FOREIGN KEY (SELLER_ID) REFERENCES USERS(ID)
                                );`;

await query(productTableQuery);
console.log("products table done");

const purchaseTableQuery = `CREATE TABLE PURCHASE(
                                ID INT PRIMARY KEY AUTO_INCREMENT,
                                BUYER_ID INT,
                                SELLER_ID INT,
                                PRODUCT_ID INT,
                                FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(ID) ON DELETE CASCADE,
                                FOREIGN KEY (BUYER_ID) REFERENCES USERS(ID) ON DELETE CASCADE  
                                );`;
                            

await query(purchaseTableQuery);
console.log("purchase table done");
db.end();
}

setup();
                                
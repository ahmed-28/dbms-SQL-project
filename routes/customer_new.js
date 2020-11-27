var express = require("express");
var util = require('util');

var router = express.Router();

var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rootpass',
  database : 'dbms_lab'
});

const query = util.promisify(db.query).bind(db);

if(db){
    console.log("mysql db connected!!");
    console.log("visit localhost:3000/shop/login");
}

router.get('/home',async (req,res) => {
    const user = req.user;
    let products;
    if(req.query.sort==1){
        products = await query("SELECT * FROM PRODUCT ORDER BY PRICE DESC");
    }
    else if(req.query.sort==2){
        products = await query("SELECT * FROM PRODUCT ORDER BY PRICE");
    }
    else if(req.query.type){
        products = await query("SELECT * FROM PRODUCT WHERE TYPE=?", [req.query.type]);
    }
    else if(req.query.brand){
        products = await query("SELECT * FROM PRODUCT WHERE BRAND=?", [req.query.brand]);
    }
    else{
        products = await query("SELECT * FROM PRODUCT");
    }
    const brands = await query("SELECT BRAND FROM PRODUCT");
    const types = await query("SELECT TYPE FROM PRODUCT");
    res.render('customer/home',{
        user:user,
        products : products,
        brands:brands,
        types:types
    });
});

router.get('/history',async (req,res)=>{
    const user = req.user;
    const rows = await query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
    let buyer_id = rows[0].ID;
    const products = await query("SELECT PRODUCT.*,USERS.ID AS UID FROM PRODUCT INNER JOIN USERS ON PRODUCT.SELLER_ID=USERS.ID AND USERNAME=?",[user]);
    console.log(products);
    const buyings = await query("SELECT PRODUCT.*,PURCHASE.ID AS PURID FROM PRODUCT INNER JOIN PURCHASE WHERE BUYER_ID=? AND PRODUCT_ID=PRODUCT.ID",[buyer_id])
    res.render('customer/history',{
        user:user,
        products:products,
        buyings:buyings
    });
});

router.post('/buy', async (req,res) => {
    const user = req.user;
    const prod_id = req.body.id;
    console.log(prod_id);
    const rows = await query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
    let buyer_id = rows[0].ID;
    const result = await query("INSERT INTO PURCHASE(BUYER_ID,PRODUCT_ID) VALUES(?,?)",[buyer_id,prod_id]);
    res.redirect('/history');
});

router.post('/delete_item',async (req,res)=>{
    const user = req.user;
    const prod_id = req.body.id;
    console.log("in delete" , prod_id);
    const result = await query("DELETE FROM PRODUCT WHERE ID=?",[prod_id]);
    res.redirect('/history');
});

router.post('/sell_update',async (req,res)=>{
    const user = req.user;

    let name = req.body.product_name;
    let price = req.body.price;
    let desc = req.body.description;
    let type = req.body.type;
    let brand = req.body.brand;
    let prod_id = req.body.prod_id;
    
    const result = await query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
    let seller_id = result[0].ID;
    console.log("past");
    const q = `UPDATE PRODUCT SET SELLER_ID=?,NAME=?,PRICE=?,DESCRIPTION=?,TYPE=?,BRAND=? WHERE ID=?`;
    const new_prods = await query(q,[seller_id,name,price,desc,type,brand,prod_id]);

    const buyings = await query("SELECT PRODUCT.*,PURCHASE.ID AS PURID FROM PRODUCT INNER JOIN PURCHASE WHERE BUYER_ID=? AND PRODUCT_ID=PRODUCT.ID",[seller_id])
    const products = await query("SELECT PRODUCT.*,USERS.ID AS UID FROM PRODUCT INNER JOIN USERS ON PRODUCT.SELLER_ID=USERS.ID AND USERNAME=?",[user]);
    res.render('customer/history',{
        user:user,
        products:products,
        buyings:buyings
    });
})
router.get('/sell',(req,res) => {
    const user = req.user;
    
    res.render('customer/sell',{
        user:user,
        msg:null,
    });
});

router.post('/sell',async (req,res)=>{
    const user = req.user;
    console.log(req.body);

    let name = req.body.product_name;
    let price = req.body.price;
    let desc = req.body.description;
    let type = req.body.type;
    let brand = req.body.brand;

    const result = await query("SELECT * FROM USERS WHERE USERNAME=?",[user]);
    //console.log(result);
    const id = result[0].ID;
    const q = `INSERT INTO PRODUCT(SELLER_ID,NAME,PRICE,DESCRIPTION,TYPE,BRAND) VALUES (?,?,?,?,?,?)`;
    await query(q,[id,name,price,desc,type,brand]);
    res.render('customer/sell',{
        user:user,
        msg:'success'
    });
});

router.get('/login',(req,res)=>{
    res.render('customer/login',{
        error:null
    });
})

router.post('/login',async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    const rows = await query("SELECT * FROM USERS WHERE USERNAME = ?",[username]);
    if(rows.count==0){
        res.render('customer/login',{
            error:"no such user"
        });
    }
    else{
        if(rows[0].PASSWORD==password){
            res.cookie('username',username);
            res.redirect('/home');
        }
        else
            res.render('customer/login',{
                error:"wrong password"
            });
    }
    
    //res.redirect('/home');

});

router.get('/register',async (req,res)=>{
    res.render('customer/register',{
        error:null
    });
});

router.post('/register',async (req,res)=>{
    console.log(req.body);

    let user = req.body.username;
    let password = req.body.password;

    console.log(db);
    const q = 'SELECT * FROM USERS WHERE USERNAME = ?';
    const rows = await query(q,[user]);
    console.log(rows,rows.count);
    if(rows.count!=0){
        res.render('customer/register',{
            error:"username existing"
        });
    }
    else{
        const rows = await query("INSERT INTO USERS(USERNAME,PASSWORD) VALUES (?,?)",[user,password])
        res.redirect('/login');
    }
});

//connection.end();

module.exports = router;
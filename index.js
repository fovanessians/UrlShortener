require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
// import mongoose package
const mongoose = require("mongoose");
const mySecret = process.env['MONGO_URI_SHORT']
mongoose.connect(mySecret, { dbName: 'UrlDatabase' }, { useNewUrlParser: true, useUnifiedTopology: true });
const shortid = require('shortid');
// Basic Configuration
const port = process.env.PORT || 3000;

// Node.js program to demonstrate the 
// dns.lookup() method 
// Accessing dns module
const dns = require('dns');
// Setting options for dns.lookup()
// method, all as true

/*
const options = {
    all:true,
};
*/

/*You may have added a line to your code that looks like the following:

app.use(bodyparser.json()); //utilizes the body-parser package
If you are using Express 4.16+ you can now replace that line with:

app.use(express.json()); //Used to parse JSON bodies
This should not introduce any breaking changes into your applications since the code in express.json() is based on bodyparser.json().

If you also have the following code in your environment:

app.use(bodyParser.urlencoded({extended: true}));
You can replace that with:

app.use(express.urlencoded()); //Parse URL-encoded bodies
*/

app.use(cors());
/*
const cors = require('cors');
app.use(cors({
    origin: 'https://www.section.io'
}));
_______________________
const whitelist = ['http://developer1.com', 'http://developer2.com']
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  }
}
_____________________________________
app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
*/

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// to parse POST request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// instantiate a mongoose schema
let URLSchema = new mongoose.Schema({
    urlCode: String,
    original_url: String,
    short_url: String,
    date: {
        type: String,
        default: Date.now
    }
});

//*********************************************************
// create a model from schema 
//mongoose.model(<Collectionname>, <CollectionSchema>)
/*let urls = mongoose.model('Urls', URLSchema);
let testUrl = new urls({
    urlCode: '2sX5tR2',
    original_url: 'https://bravenet.com',
    short_url: 'https://'+'6',
   
});
// Inserting one document, test MongoDB
  testUrl.save(function(err, data) {
  if (err) return console.error(err);
  else return console.log(data);
  });
*/
//test point of application
//console.log("mongoDB point passed");
//**********************************************************

let urls = mongoose.model('urls', URLSchema);

  app.post('/api/shorturl', (req, res) => {
    let longUrl = req.body.url;
    let urlCode = shortid.generate()

      const domain = new URL(longUrl).hostname;
        //check domain name
        console.log('domain', domain);
        
        console.log('step 1');
        dns.lookup(domain, function (err, addresses) { //DNS FUNCTION
          console.log(addresses);
            if (err) {
              console.log("invalid url");
              res.json({ error: "invalid url" });
              } //end if (err)
            else { res.send({ original_url : longUrl, short_url :urlCode });}//end res.send
          console.log('step2');
        }); //end dns.lookup

              let dataBaseUrls = new urls({
                urlCode: urlCode,
                original_url: longUrl,
                short_url: `https://boilerplate-project-urlshortener.frankovanessian.repl.co/api/shorturl/${urlCode}`,
              }); //end of dataBaseUrls object
                          

              dataBaseUrls.save(function(err, data) {
                if (err) return console.error(err);
                else return console.log(data);
              }); //end .save function
 });
           
      app.get("/api/shorturl/:short_url", (req, res) => {
        urls.findOne({ urlCode: req.params.short_url }, (err, urlMap) => {
        if (err) {
          console.log(err);
        }
        console.log('docs objects', urlMap);
        res.redirect(urlMap.original_url);
        console.log('docs objects2', urlMap.original_url);
        console.log('docs objects3', urlMap.urlCode);
      }) //ends urls.findOne
      }); //ends app.get
    
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

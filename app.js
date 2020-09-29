require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const body_parser = require("body-parser");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const app = express();
const session = require("express-session");
let date = require(__dirname + "/date.js");
const _ = require("lodash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const findorcreate = require("mongoose-findorcreate");
const FacebookStrategy = require("passport-facebook");
const GitHubStrategy = require("passport-github");
// const LinkedInStrategy = require("passport-linkedin");
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require("passport-twitter");
app.use(body_parser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
  cookie:{
    secure: true,
    maxAge:60000
       },
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-ajil:mongodb0013@cluster0.anj1f.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Item = mongoose.model("Item", {
  name: String,
  user_id: String
});

const List = mongoose.model("List", {
  name: String,
  items: [{
    name: String
  }],
  user_id: String
});

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  githubId: String,
  secret: String,
  linkedinId: String,
  twitterId: String,
  lists: [  {name: String,
    items: [{
      name: String
    }]}],
  initialised: {type:Boolean, default:false}
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findorcreate);
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
 done(null, user);
});

passport.deserializeUser(function(user, done) {
 done(null, user);
});

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://todolistwebapplication.herokuapp.com/auth/google/secrets"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     //console.log(profile)
//        User.findOrCreate({ googleId: profile.id, username: profile.name.givenName}, function (err, user) {
//          return done(err, user);
//        });
//   }
// ));

passport.use(new FacebookStrategy({
   clientID: process.env.FACEBOOK_APP_ID,
   clientSecret: process.env.FACEBOOK_APP_SECRET,
   callbackURL: "https://todolistwebapplication.herokuapp.com/auth/facebook/secrets"
 },
 function(accessToken, refreshToken, profile, done) {
   // console.log(profile);
   User.findOrCreate({facebookId: profile.id, username: profile.displayName}, function(err, user) {
     if (err) { return done(err); }
     done(null, user);
   });
 }
));

passport.use(new GitHubStrategy({
   clientID: process.env.GITHUB_CLIENT_ID,
   clientSecret: process.env.GITHUB_CLIENT_SECRET,
   callbackURL: "https://todolistwebapplication.herokuapp.com/auth/github/secrets"
 },
 function(accessToken, refreshToken, profile, cb) {
   // console.log(profile);
   User.findOrCreate({ githubId: profile.username, username: profile.username}, function (err, user) {
     return cb(err, user);
   });
 }
));
//
// passport.use(new TwitterStrategy({
//     consumerKey: process.env.TWITTER_CONSUMER_KEY,
//     consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//     callbackURL: "https://todolistwebapplication.herokuapp.com/auth/twitter/callback"
//   },
//   function(token, tokenSecret, profile, cb) {
//     //console.log(profile);
//     User.findOrCreate({twitterId: profile.id , username: profile.displayName}, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));
//
// // passport.use(new LinkedInStrategy({
// //    consumerKey: process.env.LINKEDIN_API_KEY,
// //    consumerSecret: process.env.LINKEDIN_SECRET_KEY,
// //    callbackURL: "http://localhost:3000/auth/linkedin/secrets"
// //  },
// //  function(token, tokenSecret, profile, done) {
// //    console.log(profile);
// //    User.findOrCreate({ linkedinId: profile.id, username: "Ajil"}, function (err, user) {
// //      return done(err, user);
// //    });
// //  }
// // ));
//
// passport.use(new LinkedInStrategy({
//   clientID: process.env.LINKEDIN_KEY,
//   clientSecret: process.env.LINKEDIN_SECRET,
//   callbackURL: "https://todolistwebapplication.herokuapp.com/auth/linkedin/callback",
//   scope: ['r_liteprofile','r_emailaddress', 'r_basicprofile'],
// }, function(accessToken, refreshToken, profile, done) {
//   // asynchronous verification, for effect...
//   //process.nextTick(function () {
//     // To keep the example simple, the user's LinkedIn profile is returned to
//     // represent the logged-in user. In a typical application, you would want
//     // to associate the LinkedIn account with a user record in your database,
//     // and return that user instead.
//   //   return done(null, profile);
//   User.findOrCreate({ linkedinId: profile.id}, function (err, user) {
//     return done(err, user);
//   });
//   //});
//
// }));

day = date.getDate();

app.get("/", function(req, res) {
  if(req.isAuthenticated()){
  // console.log(req)
  Item.find({user_id: req.user._id}, function(err, items) {
    if (!err) {
      if (items.length === 0) {
        const item_1 = new Item({
          name: "Welcome to the To-Do-List",
          user_id: req.user._id
        });

        const item_2 = new Item({
          name: "Click + button to add items",
          user_id: req.user._id
        });

        const item_3 = new Item({
          name: "<-- Check box to delete items",
          user_id: req.user._id
        });

        Item.insertMany([item_1, item_2, item_3], function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully inserted the items");
          }
        });
        List.find({user_id: req.user._id}, function(err,lists_1){
          // console.log(lists_1)
          res.render("list", {
            lists: lists_1,
            listName: day,
            item: items,
            day: day,
            user: req.user.username
          });
        });
      res.redirect("/");
      } else {
        List.find({user_id: req.user._id}, function(err,lists_1){
          // console.log(lists_1)
          res.render("list", {
            lists: lists_1,
            listName: day,
            item: items,
            day: day,
            user: req.user.username
          });
        });
      }
    }
  });
}
else{
  res.render("home")
}
});

app.get("/:customName", function(req, res) {
  if(req.isAuthenticated()){
    const listName = _.capitalize(req.params.customName);
    List.find({name:listName},function(err, lists){
      if(lists.length === 0){
        const new_list = new List({
          name: listName,
          items: [],
          user_id: req.user._id
        });
        List.insertMany(new_list, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Inserted new list successfully");
            List.find({user_id: req.user._id}, function(err,lists_1){
              res.render("list", {lists:lists_1, listName: listName, item: new_list.items, day: day,user: req.user.username});

            });
          }
        });
    }else{
        List.find({user_id: req.user._id}, function(err,lists_1){
          res.render("list", {lists:lists_1, listName: listName, item: lists[0].items, day: day, user: req.user.username});
        });
      }
    });}
    else{
      res.render("home")
    }
});

app.get("/about/a",function(req,res){
  if(req.isAuthenticated()){
    List.find({user_id: req.user._id}, function(err,lists_1){
    res.render("about", {lists:lists_1});
  });}
  else{
    res.render("home")
  }
});

app.post("/", function(req, res) {
  console.log(req.body);
  const listN = req.body.list;
  const itemN = req.body.list_item;
  console.log(listN);
  console.log(itemN);
  if (listN != day) {
    if(itemN == ""){
      console.log("The item was null");
      res.redirect("/"+listN);
    }
    else{
    List.find({name: listN, user_id: req.user._id}, function(err,lists){
      if (err) {
        console.log(err);
      }else{
      const item_list = new Item({
        name: itemN,
        user_id: req.user._id
      });
      lists[0].items.push(item_list);
      items = lists[0].items;
      List.update({name: listN, user_id: req.user._id},{items:items}, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully Updated");
          res.redirect("/"+listN);
        }
      });
      console.log(lists[0].items);
    }
  });
}
} else {
  if(itemN == ""){
    console.log("The item was null");
  }
  else{
    const item = new Item({
      name: req.body.list_item,
      user_id: req.user._id
    });
    Item.insertMany([item], function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully inserted item");
      }
    });
  }
res.redirect("/");
}
});

app.post("/delete", function(req, res) {
  if(req.body.list == day){
  Item.deleteOne({
    _id: req.body.checkbox_id, user_id: req.user._id
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully deleted the item");
    }
  });
  res.redirect("/");
}else{
  List.find({name: req.body.list, user_id: req.user._id}, function(err, lists){
    if(err){
      console.log(err);
    }else{
      lists[0].items.forEach(function(item){
        if(item._id == req.body.checkbox_id && item.user_id == req.user._id){
          lists[0].items.remove(item);}
        });
      var items = lists[0].items;
      List.update({name: req.body.list, user_id: req.user._id}, {items:items}, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Deleted the item successfully");
          res.redirect("/"+ req.body.list);
        }
      });
    }
  });
}
});

app.post("/newlist",function(req,res){
const list_name = req.body.listname;
res.redirect("/"+list_name);
});

app.post("/delete_list",function(req,res){
  const delete_list_name = req.body.delete_list;
  List.deleteOne({name:delete_list_name, user_id: req.user._id},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Deleted the list Successfully");
      res.redirect("/");
    }
  });
});



app.get("/auth/register", function(req,res){
  res.render("register");
});

app.get("/auth/login", function(req,res){
   res.render("login");
});

app.get("/auth/logout", function(req,res){
  req.logout();
  res.redirect("/");
});

// app.get("/secrets", function(req,res){
//     User.find({secret:{$ne:null}},function(err,users){
//       if(err){
//         console.log(err);
//       }else{
//         res.render("secrets",{usersWithSecrets: users});
//       }
//     });
// });

app.get('/auth/google',
  passport.authenticate('google', { scope: 'profile'}));

app.get('/auth/google/secrets',
    passport.authenticate('google', { successRedirect: '/',
                                        failureRedirect: '/auth/login' }));


app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/auth/login' }));

app.get('/auth/github',
    passport.authenticate('github'));

app.get('/auth/github/secrets',
    passport.authenticate('github', { failureRedirect: '/auth/login' }),
    function(req, res) {
      res.redirect('/');
    });

// app.get('/auth/linkedin',
//   passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
//
// app.get('/auth/linkedin/secrets',
//   passport.authenticate('linkedin', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

app.get('/auth/linkedin',
  passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});

app.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started running");
});

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash')
mongoose.set('strictQuery', true);

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//set up with mongoose
//connect to MongoDB by specifying port to access MongoDB server
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser: true});
}


////////////////////ITEMS name

// CREATE A SCHEMA for Item
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'missing']
  }

});

//CREATE A MODEL(a collection) for Items
const Item = new mongoose.model("Item", itemsSchema);

//CREATE DEFAULT ITEMS
const one = new Item({
  name: "item one"
});

const two = new Item({
  name: "item two"
});

const three = new Item({
  name: "item three"
});

//CREATE DEFAULT ITEMS ARRAY
const defaultItems = [one, two, three];

////////////////////LIST name


//CREATE A LIST SCHEMA FOR NAME TITLE OF THE listTitle

const listSchema = {
  name: String,
  items: [itemsSchema]

};

//CREATE A MODEL(a collection) for LIST title
const List = new mongoose.model("listTitle", listSchema);





//SHOWING LIST
app.get("/", function(req, res) {

  Item.find(function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("updated");
        };

      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems

      });

    }
  });

});


//INSERT NEW ITEM

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");

  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      item.save();
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

  };


});




//DELETE ROUTE
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  //create another input as type of hidden with the value of listTitle on ejs
  const listName = req.body.listName;

  if (listName === "Today") {
    //create if statement to check making post request to delete an item from the chosen listTitle  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted");
        res.redirect("/");
      };
    });

  }
  else {
    List.findOneAndUpdate(
    { name: listName
    },
    {$pull: {
        items: {
          _id: checkedItemId
        }
      }
    },
    function(err, foundList) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      };
    });

  };





});

//CREATE A ROUTE WITH MODIFY NAME OF THE listTitle

app.get("/:customeListName", function(req, res) {
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({
    name: customeListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        //CREATE A NEW LIST if there is no list name match in the collection

        const list = new List({
          name: customeListName,
          items: defaultItems

        });

        list.save();
        res.redirect("/" + customeListName);


      } else {
        //SHOW EXISITING LIST if it match with the name in the collection
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items

        });

      }
    }
  });

});



app.listen(3000, function() {
  console.log("Server 27017");

});
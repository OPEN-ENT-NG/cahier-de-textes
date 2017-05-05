
var replace = require("replace");
var ncp = require('ncp').ncp;
var fs = require('fs');

//remove index
try {
  fs.unlinkSync("../src/main/resources/view/diary.html");
}catch(e){}

//copy index
ncp("../dist/index.html","../src/main/resources/view/diary.html", function (err) {
 if (err) {
   return console.error(err);
 }else{
   //replace digest in file
   replace({
     regex: "DIGEST",
     replacement: new Date().getTime(),
     paths: ["../src/main/resources/view/diary.html"],
     silent: true,
   });
   //copy folder
   ncp("../dist/" , "../src/main/resources/public", function (err) {
    if (err) {
      return console.error(err);
    }
   });
 } 
});

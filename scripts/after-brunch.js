
var replace = require("replace");
var ncp = require('ncp').ncp;
var fs = require('fs');

//remove index
try {
  fs.unlinkSync("../src/main/resources/view/diary.html");
}catch(e){}

//copy index
console.log("copy file1");
ncp("../dist/index.html","../src/main/resources/view/diary.html",{
  stopOnErr: true,
}, function (err) {
 if (err) {
   return console.error(err);
 }else{
   //replace digest in file
   console.log("replace digest");
   replace({
     regex: "DIGEST",
     replacement: new Date().getTime(),
     paths: ["../src/main/resources/view/diary.html"],
     silent: true,
   });
   //copy folder
   ncp("../dist/" , "../src/main/resources/public", function (err) {
     console.log("copy dist");
    if (err) {
      return console.error(err);
    }
   });
 }
});

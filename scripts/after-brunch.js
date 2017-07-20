
var replace = require("replace");
var ncp = require('ncp').ncp;
var fs = require('fs');

//remove index
try {
  fs.unlinkSync("../src/main/resources/view/diary.html");
}catch(e){}

ncp("../dist/index.html","../src/main/resources/view/diary.html",{
  stopOnErr: true,
}, function (err) {
 if (err) {
   return console.error(err);
 }else{
   replace({
     regex: "DIGEST",
     replacement: new Date().getTime(),
     paths: ["../src/main/resources/view/diary.html"],
     silent: true,
   });
   //copy folder
   ncp("../dist/" , "../src/main/resources/public", function (err) {
     console.log("copy `dist` folder to `src/main/resources/public`");
    if (err) {
      return console.error(err);
    }
   });
 }
});

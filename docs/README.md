# Diary documentations

## Concept
The diary module is composed of two part, the backend and the front. They are deployed together in a final jar file to be loaded in the futur in the spring board from open ent ng project.


## Back
Run in vertx 2 context.

**tips**

```chocolatey``` : is a package manager for windows, install it and you will be able to install all windows software quikly ```choco install nodejs -version 7.8.0``` or ```choco install jdk -version 8``` just magic

## Front
To have a better developpement experience, and be able to produce faster the front part, a CORS-hack has been implemented. That means we have two mode of development. In dev we ll run on an embeded and light server, provided by [brunch](http://brunch.io/). In deployed mode all files are compacted to make one uniq angular apps

### Dev mode
The front part is loaded in a light nodejs server managed by [brunch](http://brunch.io/).

#### requirements
First you need to have ```node```,```npm```,```brunch```,```bower```, ```ncp```

#### Run your dev server
1. run your backend part
2. in the folder script run the command ```brunch w -s```
3. run [fiddler](http://www.telerik.com/fiddler) proxy load the [fiddler script](./fiddler.script.txt)
4. in fidler active the CORS option from the rule menu
5. go to [http://localhost:3333/diary](http://localhost:3333/diary)
6. its possible that you have to refresh your browser, the auto log isnt optimal

#### Where i am?
The brunch light server run the compiled source from ```../dist``` folder, and provide map files to be able to debug.


#### Auto logon

You can change the autolog  ```user``` and ```password``` in the ```script\vendor\local-adaptor.js```

#### Tools

Its recommended to use a javascript editor like [Atom](https://atom.io/) and open the ```scripts``` folder

- reommended plugins
```
apm install atom-beautify,atom-bugs-nodejs,atom-jshint,atom-ungit,auto-detect-indentation,autoclose-html,busy-signal,debug,emmet,file-icons,git-control,git-time-machine,highlight-selected,intentions,jshint,linter,linter-ui-default
```

#### Live reload ?
we use the [fb flo](https://code.facebook.com/projects/297401870435287/fb-flo/) hot reload, with javascript injection method.

brunch is already configured. you just have to install the fb flo [chrome extention](https://chrome.google.com/webstore/detail/fb-flo/ahkfhobdidabddlalamkkiafpipdfchp)

insure that your fiddler is closed, (he take the same port), run your brunch server, go to chrome, active the console F12, go to the ```flo``` tab, and click on the Activate for this site.

#### Mock server
For some mock calls we use swagger. If you want to use it, first install swagger :

```
npm install swagger```



_**tips**_

```yarn``` : instead run ```npm install```, install ```yarn``` via ```npm install -g yarn``` and after that simply run ```yarn```, it will be faster

```rimraf``` : to remove quickly and recursively a folder. Install via : ```npm install -g rimraf``` and use it simply like ````rimraf node_modules```



### Deployement

Same as is. Each brunch compilation the compiled files from the ```dist``` folder are copied in the ```src/resources/public``` folder to be include in git.

If you want to build the front part via gradle, the continius delivery server must be able to run nodejs/brunch. For this moment this operation is taked by a after brunch task who copy ```diary.html``` and no nodejs is needed.

It s the reason why you need to git push you ```script``` folder **and** the ```src/resources/public``` folder.

# Integration test

## Requierments
[Protractor](http://www.protractortest.org/#/)

Setup
Use npm to install Protractor globally with:
```npm install -g protractor```


This will install two command line tools, protractor and webdriver-manager. Try running ```protractor --version``` to make sure it's working.

The webdriver-manager is a helper tool to easily get an instance of a Selenium Server running. Use it to download the necessary binaries with:

```webdriver-manager update```

Now start up a server with:
```webdriver-manager start```

[docs protractor API](https://gist.github.com/javierarques/0c4c817d6c77b0877fda)

## Preparation

insure that all project is ready to test.
run the selenium.bat server file

**  /!\ Warning each test will be delete the data base make sure that you have configured the ```constants.js``` file correctly and you are in a safe environnement**

## Execution
run command
```webdriver-manager update```
```protractor conf.js```


## Tools
To write test use plugins like [protractor recorder](https://github.com/hanthomas/protractor-recorder)
or [Css selector](https://chrome.google.com/webstore/detail/css-selector-helper-for-c/gddgceinofapfodcekopkjjelkbjodin/related)
or [Elementor](https://github.com/andresdominguez/elementor)
Run command
```
elementor http://localhost:8090/diary --chrome="--disable-web-security
```

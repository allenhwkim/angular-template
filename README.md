AngularJS Server-Side Template
==============================


[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angular-template)

This template engine does;

  1. Converting Angular expressions into html
  2. Applying layout into html template

Install
-------

    npm install angular-template

Usage
------

    var AngularTemplate = require('angular-template');
    var template = AngularTemplate();
    var html = "output: {{::foo}} {{::bar}}";
    console.log(template.compile(html, {foo:1, bar:2}));
    //output: 1 2

Converting Angular Expressions
------------------------------
This will safely convert the following expressions into html.  
It only converts expressions that have the concept of "bind once" by using `::` or `bind-once` attribute.

1. bind once expression
  Assuming foo has the value of 123

  From 
  
        {{::foo}}
  
  To  
  
        123

2. **`ng-if`** directive with **`bind-once`** attribute
  Assuming foo has value `true`, and bar has value `false`

  Input

        <div ng-if="foo" bind-once>SHOW</div>
        <div ng-if="bar" bind-once>NO SHOW</div>

  Output

        <div server-ng-if="foo">SHOW</div>     !!! true  !!!
        <div server-ng-if="bar"></div>         !!! false !!!

3. **`ng-include`** directive with **`bind-once`** attribute  
  Assuming myfile.html has the following contents

        <div>this is my file contents</div>

  Input

        <div ng-include="'myfile.html'" bind-once></div>

  Output

        <div server-ng-include="'myfile.html'">
          <div>this is my file contents</div>  !!! inserted !!!
        </div>

3. **`ng-repeat`** directive with **`bind-once`** attribute  
  Assuming collection has the vaulue of  

        {a:1, b:2, c:3, d:4, e:5}

  Input

        <div ng-repeat="(key, val) in collection" bind-once>
          repeating contents {{::key}} : {{::val}}
        </div>

  Output

        <div server-ng-repeat="(key, val) in collection" bind-once>
          repeating contents a : 1            !!! repeated !!!
          repeating contents b : 2            !!! repeated !!!
          repeating contents c : 3            !!! repeated !!!
          repeating contents d : 4            !!! repeated !!!
          repeating contents e : 5            !!! repeated !!!

        </div>

Applying Layout 
---------------
This will decorate contents html with layout.  

Layout html have `<contents-html>` tag with attribute `tag`,  
and contents html have tag matching to layout.

For example When you execute the following code

    var template = AngularTemplate({layout: "layout.html"});
    var html = fs.readFileSync('contents.html', 'utf8');
    console.log(template.compile(html));

with the following files;

    -------------------------------------+---------------------------------
    layout.html                          | contents.html                       
    -------------------------------------+---------------------------------
    <html>                               | <head>
      <head>                             |   <script src="my.js"></script>
        <script src="main.jss"></scirpt> | <head>
        <contents-html tag="head"/>      | <body>
      </head>                            |    Angular Template
      <body>                             | </body>                            
        Hello                            |
        <contents-html tag="body"/>      |
      </body>                            |
    </html>                              |  

The output will be;  

    <html> 
      <head>
        <script src="main.jss"></scirpt>
        <script src="my.js"></script>   !!! replaced !!!
      </head>
      <body>
        Hello
        Angular template                !!! replaced !!!
      </body>
    </html>



LICENSE: MIT



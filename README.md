AngularJS Server-Side Template
==============================

[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angular-template)

AngularJS Expression Template Engine For NodeJS
-----------------------------------------------

Why do I need this? If you are a big fan of AngularJS and you want to use AngularJS as a template engine, this node module will do the job.


Install
-------

    npm install angular-template

Usage
------

    var angularTemplate = require('angular-template');
    var data = { 
        content: 'page1.html',  
        foo: true, 
        collection: [1,2,3,4,5] 
      },
    console.log( angularTemplate('layout.html', data) );


Converting Angular One Time Binding Expressions
------------------------------------------------
This will safely convert the angularjs one time binding expressions into html.

1. one time binding expression.

  Assuming foo has the value of `123`

        Input                                | Output
        -------------------------------------+---------------------------------
        {{::foo}}                            | 123

2. one time binding **`ng-if`** directive.

  Assuming foo has value `true`, and bar has value `false`

        Input                                | Output
        -------------------------------------+---------------------------------
        <p ng-if="::foo">SHOW</p>    | <p>SHOW</p>    
        <p ng-if="::bar">NO SHOW</p> | <p></p> 
        <p ng-if="bar">NO SHOW</p>   | <p>NO SHOW</p> 

3. **`ng-include`** directive.

  Assuming foo.html has the following contents `<b>file contents</b>`

 The input and output would like;

        Input                                     | Output
        ------------------------------------------+------------------------------------
        <p ng-include="'foo.html'"></p>           | <p>
                                                  |  <div>file contents</div>
                                                  | </p>


4. one time binding **`ng-repeat`** directive

  Assuming collection has the vaulue of `{a:1, b:2, c:3, d:4, e:5}`

        Input                                         | Output
        ----------------------------------------------+------------------------------------
        <ul>                                          | <ul>
           <li ng-repeat="(key, val) in ::collection">|   <li server-ng-repeat> a : 1</li>
             {{::key}} : {{::val}}                    |   <li server-ng-repeat> b : 2</li>
           </li>                                      |   <li server-ng-repeat> c : 3</li>
        </ul>                                         |   <li server-ng-repeat> d : 4</li>
                                                      |   <li server-ng-repeat> e : 5</li>
                                                      | </ul>

  Assuming collection has the vaulue of `[1,2,3,4,5]`

        Input                                         | Output
        ----------------------------------------------+------------------------------------
        <ul>                                          | <ul>
           <li ng-repeat="num in ::collection">       |   <li server-ng-repeat> 1 </li>
             {{::num}}                                |   <li server-ng-repeat> 2 </li>
           </li>                                      |   <li server-ng-repeat> 3 </li>
        </ul>                                         |   <li server-ng-repeat> 4 </li>
                                                      |   <li server-ng-repeat> 5 </li>
                                                      | </ul>

5. one time binding **`ng-class`** directive

  Assuming data is `{foo:true, bar: true}`

        Input                                         | Output
        ----------------------------------------------+------------------------------------
        <p ng-class='::{foo: c-foo, bar: c-bar}'></p> | <p class="c-foo c-bar"></p>


LICENSE: MIT

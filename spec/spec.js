var tmpl, data, expectedOutput, output;
var ht = require('../index.js');

describe("ht", () => {

  it("expressions", () => {
    /*******************************************************
     * `{{}}` expression test
     *******************************************************/
    expect(ht("{{foo}}", { foo: 1 })).toEqual("1");
    expect(ht("{{x.foo}}", { x: { foo: 1 } })).toEqual("1");
    expect(ht("{{x.foo}} {{ x.bar }}", { x: { foo: 1, bar: 2 } })).toEqual("1 2");
  });

  describe("pipes", () => {

    it('lowercase/uppercase', () => {
      expect(ht("{{x.foo | lowercase }} {{ x.bar | lowercase }}", { x: { foo: 'A', bar: 'B' } })).toEqual("a b");
    });

    it('limitTo', () => {
      expect(ht("{{value | limitTo:2 }}", { value: "abcd" })).toEqual("ab");
      expect(ht("{{value | limitTo:2:1 }}", { value: "abcd" })).toEqual("bc");
      expect(ht("{{value | limitTo }}", { value: "abcd" })).toEqual("abcd");
      expect(ht("{{[1, 2, 3, 4] | limitTo:2:2 | json:0 }}", {})).toEqual("[3,4]");
    });

    it('number', () => {
      expect(ht("{{num | number:2 }}", { num: 51.2534 })).toEqual("51.25");
    });

    it('currency', () => {
      expect(ht("{{num | currency:'':2 }}", { num: 51.2534 })).toEqual("51.25");
      expect(ht("{{num | currency }}", { num: 51.2534 })).toEqual("$51.25");
      expect(ht("{{num | currency:undefined:0 }}", { num: 51.2534 })).toEqual("$51");
    });

    it('date', () => {
      expect(ht("{{1288323623006 | date:'medium':'+0200' }}", {})).toEqual("Oct 29, 2010 5:40:23 AM");
      expect(ht("{{1288323623006 | date:\"MM/dd/yyyy 'at' h:mma\":'+0200' }}", {})).toEqual("10/29/2010 at 5:40AM");
      expect(ht("{{1288323623006 | date:'MM/dd/yyyy \\'a:t\\' h:mma':'+0200' }}", {})).toEqual("10/29/2010 a:t 5:40AM");
      expect(ht("{{value | date:\"dd-MM-yyyy '|' h:mma\":'+0200' }}", { value: new Date("2017-09-25T11:00:50.691Z") })).toEqual("25-09-2017 | 1:00PM");
      expect(ht("{{'2018-01-14T22:26:59.680Z' | date:'MM/dd/yyyy \\'a:t\\' h:mma':'+0000' }}", {})).toEqual("01/14/2018 a:t 10:26PM");
    });

    it('json', () => {
      expect(ht("{{value | json:0 }}", { value: { a: 1 } })).toEqual('{"a":1}');
    });

    it('custom', () => {
      ht.pipes.or = function (options, value, param) {
        return value ? value : param;
      };
      expect(ht("{{value | or: '12|4|b' | uppercase }}", { value: false })).toEqual("12|4|B");
    });
  });

  it("if", () => {
    /*******************************************************
     * `ht-if` expression test
     *******************************************************/
    expect(ht("<div ht-if='x.foo'>YES</div>", { x: { foo: true } })).toEqual("<div>YES</div>");
    expect(ht("<div ht-if='x.bar'>YES</div>", { x: { foo: true } })).toEqual("");
    expect(ht("<div ht-if='!x.bar'>NO</div>", { x: { foo: true } })).toEqual("<div>NO</div>");
  });

  it("repeat", () => {
    /*******************************************************
     * `ht-repeat` expression test
     *******************************************************/
    expect(ht("<li ht-repeat='el in [1,2,3]'>{{el}}</li>", {})).toEqual("<li>1</li><li>2</li><li>3</li>");
    expect(ht("<li ht-repeat='el in list'>{{el}}</li>", { list: [1, 2, 3] })).toEqual("<li>1</li><li>2</li><li>3</li>");
    expect(ht(
      "<li ht-repeat='(k,v) in list'>{{v}}</li>",
      { list: { a: 1, b: 2, c: 3 } }
    )).toEqual("<li>1</li><li>2</li><li>3</li>");

    expect(ht(
      "<li ht-repeat='(k,v) in list track by $index'>{{v}}</li>",
      { list: { a: 1, b: 2, c: 3 } }
    )).toEqual("<li>1</li><li>2</li><li>3</li>");

    expect(ht(
      "<li ht-repeat='(k,v) in list'>{{k}}{{v}}</li>",
      { list: { a: 1, b: 2, c: 3 } }
    )).toEqual("<li>a1</li><li>b2</li><li>c3</li>");

    expect(ht(
      "<a ht-repeat='i in list' ht-if='!!i'>{{i}}</a>",
      { list: [0, 1, 2, 3] }
    )).toEqual("<a>1</a><a>2</a><a>3</a>");

    expect(ht(
      "<a ht-repeat='i in list | limitTo:2:1'>{{i}}</a>",
      { list: [0, 1, 2, 3] }
    )).toEqual("<a>1</a><a>2</a>");

    expect(ht(
      "<a ht-repeat='i in list | filter:filterFn'>{{i}}</a>",
      { list: [0, 1, 2, 3], filterFn: (v) => v > 0 }
    )).toEqual("<a>1</a><a>2</a><a>3</a>");

    expect(ht(
      "<a ht-repeat='i in list track by $index| filter:filterFn'>{{i}}</a>",
      { list: [0, 1, 2, 3], filterFn: (v) => v > 0 }
    )).toEqual("<a>1</a><a>2</a><a>3</a>");

    expect(ht(
      "<a ht-repeat='i in list | filter:filterFn | limitTo:2:1'>{{i}}</a>",
      { list: [0, 1, 2, 3], filterFn: (v) => v > 0 }
    )).toEqual("<a>2</a><a>3</a>");
  });

  it('class', () => {
    /*******************************************************
     * `ht-class` expression test
     *******************************************************/
    expect(ht("<div ht-class='item.classes'>YES</div>", { item: { classes: 'highlight' } })).toEqual("<div class=\"highlight\">YES</div>");
    expect(ht("<div ht-class='item.classes'>YES</div>", { item: { classes: { highlight: true } } })).toEqual("<div class=\"highlight\">YES</div>");
    expect(ht("<div ht-class='item.classes'>YES</div>", { item: { classes: { highlight: true, odd: true } } })).toEqual("<div class=\"highlight odd\">YES</div>");
    expect(ht("<div ht-class='item.classes'>YES</div>", { item: { classes: ['odd', { highlight: true }] } })).toEqual("<div class=\"odd highlight\">YES</div>");
    expect(ht("<div class='baz' ht-class='item.classes'>YES</div>", { item: { classes: ['odd', { highlight: true }] } })).toEqual("<div class=\"baz odd highlight\">YES</div>");
    expect(ht("<div class='baz' ht-class='item.classes'>YES</div>", { item: { classes: ['odd', { highlight: false }] } })).toEqual("<div class=\"baz odd\">YES</div>");
    expect(ht("<div class='baz' ht-class='{ highlight: item.highlight }'>YES</div>", { item: { highlight: true } })).toEqual("<div class=\"baz highlight\">YES</div>");

  });

  it('bind', () => {
    /*******************************************************
     * `ht-bind` expression test
     *******************************************************/
    expect(ht("<div ht-bind='title'></div>", { title: 'YES' })).toEqual("<div>YES</div>");
    expect(ht("<div ht-bind-html='title'></div>", { title: '<span>YES</span>' })).toEqual("<div><span>YES</span></div>");
  });

  it('style', () => {

    expect(ht("<div ht-style='styles'>YES</div>", { styles: { color: 'red' } })).toEqual("<div style=\"color:red\">YES</div>");
    expect(ht("<div style='color:red' ht-style='styles'>YES</div>", { styles: { 'font-size': '12px' } })).toEqual("<div style=\"color:red;font-size:12px\">YES</div>");
    expect(ht("<div style='color:red' ht-style='styles'>YES</div>", { styles: { 'font-size': '12px', width: '45px' } })).toEqual("<div style=\"color:red;font-size:12px;width:45px\">YES</div>");
    expect(ht("<div style='color:red' ht-style='{\"font-size\": fontSize}'>YES</div>", { fontSize: '12px' })).toEqual("<div style=\"color:red;font-size:12px\">YES</div>");
  });

  it("include", () => {
    /*******************************************************************
     * `ht-include` expression test, passed as non existing property for backwards compatibility
     * file does not exist, so it will print out as html, the file name
     *******************************************************************/
    expect(ht("<div ht-include=\"file1.html\"></div>", {})).toMatch(/<div>.*file1.html<\/div>/);

    /*******************************************************************
     * `ht-include` expression test, passed as string
     * file does not exist, so it will print out as html, the file name
     *******************************************************************/
    expect(ht("<div ht-include=\"'file1.html'\"></div>", {})).toMatch(/<div>.*file1.html<\/div>/);

    /*******************************************************************
     * `ht-include` expression test, passed as property
     * file does not exist, so it will print out as html, the file name
     *******************************************************************/
    expect(ht("<div ht-include=\"item.template\"></div>", { item: { template: 'file2.html' } })).toMatch(/<div>.*file2.html<\/div>/);

    /*******************************************************************
     * `ht-include` expression test, passed as property in a repeat
     * file does not exist, so it will print out as html, the file name
     *******************************************************************/
    var exampleResult = ht("<div ht-repeat=\"item in items\"><div ht-include=\"item.template\"></div>", { items: [{ template: 'file3.html' }, { content: 'foo', template: 'spec/small.html' }] });
    expect(exampleResult).toMatch(/<div>.*file3.html<\/div>/);
    expect(exampleResult).toMatch(/<span>foo<\/span>/);

    /*******************************************************************
     * `ht-include` expression test, passed as property in a nested repeat with key value
     * file does not exist, so it will print out as html, the file name
     *******************************************************************/
    var exampleResult2 = ht("<div ht-repeat=\"parentItem in items\"><div ht-repeat=\"(key, item) in parentItem.items\"><div ht-include=\"item.template\"></div>", { items: [{ items: [{ template: 'file3.html' }] }, { items: [{ content: 'foo', template: 'spec/small.html' }] }] });
    expect(exampleResult2).toMatch(/<div>.*file3.html<\/div>/);
    expect(exampleResult2).toMatch(/<span>foo<\/span>/);

  });

  it("directory", () => {
    /*******************************************************************
     *  * includeDirs test
     * *******************************************************************/
    expect(ht("<div ng-include=\"'small.html'\"></div>", { item: { content: 'test1' } }, { prefix: 'ng', includeDirs: [__dirname, __dirname + '/includes'] })).toEqual('<div><span>test1</span></div>');
    expect(ht("<div ng-include=\"'small.html'\"></div>", { item: { content: 'test1' } }, { prefix: 'ng', includeDirs: [__dirname + '/includes', __dirname] })).toEqual('<div><div>test1</div></div>');
    expect(ht("<div ng-include=\"'medium.html'\"></div>", { item: { content: 'test1' } }, { prefix: 'ng', includeDirs: [__dirname + '/shared', __dirname + '/includes', __dirname] })).toEqual('<div><div class="medium">test1</div></div>');

  });

  it("include context", () => {
    expect(ht("<div ng-include=\"'includes/small.html'\" ng-include-context=\"{item:foo}\"></div>", { foo: { content: 'test1' } }, { prefix: 'ng', includeDirs: [__dirname] })).toEqual('<div><div>test1</div></div>');
    expect(ht("<div ng-repeat=\"parentItem in items\"><div ng-include=\"'includes/small.html'\" ng-include-context=\"{item:parentItem.foo}\"></div></div>", { items: [{ foo: { content: 'test1' } }] }, { prefix: 'ng', includeDirs: [__dirname] })).toEqual('<div><div><div>test1</div></div></div>');
  });

  it("jsdoc template", () => {
    /*******************************************************************
     * jsdoc template test
     *******************************************************************/
    expect(function () {
      ht("spec/layout.html",
        { nav: [], children: [{ members: [], functions: [] }] },
        { jsMode: false, prefix: 'ng' });
    }).not.toThrow();
  });

  it("cache and preprocess", () => {
    /*******************************************************************
     * cache and preprocess test
     *******************************************************************/

    var exampleResult3 = ht("<div><div ng-include=\"'spec/small.html'\"></div><div ng-include=\"'spec/small.html'\"></div></div>", { item: { content: 'foo' } }, {
      prefix: 'ng', cache: 'test', preprocess: function (tpl) {
        tpl = tpl.replace(/span/g, 'div');
        return tpl;
      }
    });
    expect(exampleResult3).toMatch(/<div>foo<\/div>/);
    expect(ht.cache.get('test')).toMatch(/spec\/small\.html/);
    expect(ht.cache.get('test$$spec/small.html')).toMatch(/item\.content/);

    expect(ht("<div><div ng-include=\"'spec/small.html'\"></div><div ng-include=\"'spec/small.html'\"></div></div>", { item: { content: 'foo' } }, {
      prefix: 'ng', cache: 'test', preprocess: function (tpl) {
        tpl = tpl.replace(/span/g, 'div');
        return tpl;
      }
    })).toMatch(/<div>foo<\/div>/);

    ht.cache.remove('test');
    expect(ht.cache.get('test')).toBeUndefined();
    expect(ht.cache.get('test$$spec/small.html')).toBeUndefined();
  });
});
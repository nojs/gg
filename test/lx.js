

var Lx=require("../lx")
var tt=require("./tests")
var Tests=tt.Tests,__assert=tt.__assert,__eql=tt.__eql
var dbg,debug=dbg=true
var tt=new Tests()

tt.add("simple lexer", function (){
  var L=new Lx()
  L.add("a")
  //var aa=gg.list("a")
  var ls=L.extract("a a a a a o o o o o a a a a a")
  debug && console.dir(ls)

  for(var i=0,rr=[];i<ls.length;i++){
    rr.push(ls.peek(i))}
  
  debug && console.dir(rr)
  __assert(__eql(
    rr,
    [ [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Id', 'o', 0 ],
      [ 'Id', 'o', 0 ],
      [ 'Id', 'o', 0 ],
      [ 'Id', 'o', 0 ],
      [ 'Id', 'o', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Keyword', 'a', 0 ],
      [ 'Eof', 'eof', 0 ] ]),"very simple lexer")})

tt.add("lexer1",function(){
  var L=new Lx()
  var ls=L.extract("3+2*6;abc('wer')")
  dbg&&console.dir(ls)
  
  for(var i=0,rr=[];i<ls.length;i++){
    rr.push(ls.peek(i))}

  dbg&&console.dir(rr)
  __assert(__eql(
    rr,
    [ [ 'Number', 3, 0 ],
      [ 'Keyword', '+', 0 ],
      [ 'Number', 2, 0 ],
      [ 'Keyword', '*', 0 ],
      [ 'Number', 6, 0 ],
      [ 'Keyword', ';', 0 ],
      [ 'Id', 'abc', 0 ],
      [ 'Keyword', '(', 0 ],
      [ 'String', 'wer', 0 ],
      [ 'Keyword', ')', 0 ],
      [ 'Eof', 'eof', 0 ] ]))})


tt.add("compound keywords",function(){
  var L=new Lx()
  L.add(["+=","{{","}}"])
  var ls=L.extract("{{g+=3+2*6;abc}}('wer')")
  for(var i=0,rr=[];i<ls.length;i++){
    rr.push(ls.peek(i))}
  __assert(__eql(
    rr,
    [ [ 'Keyword', '{{', 0 ],
      [ 'Id', 'g', 0 ],
      [ 'Keyword', '+=', 0 ],
      [ 'Number', 3, 0 ],
      [ 'Keyword', '+', 0 ],
      [ 'Number', 2, 0 ],
      [ 'Keyword', '*', 0 ],
      [ 'Number', 6, 0 ],
      [ 'Keyword', ';', 0 ],
      [ 'Id', 'abc', 0 ],
      [ 'Keyword', '}}', 0 ],
      [ 'Keyword', '(', 0 ],
      [ 'String', 'wer', 0 ],
      [ 'Keyword', ')', 0 ],
      [ 'Eof', 'eof', 0 ] ]))})


tt.add("newlines",function(){
  var L=new Lx()
  L.add(["+=","{{","}}"])
  var ls=L.extract("{{g+=3+2*6;abc}}\r\n\n\n('wer')")
  dbg&&console.dir(ls)
  for(var i=0,rr=[];i<ls.length;i++){
    rr.push(ls.peek(i))}
  dbg&&console.dir(rr)
  __assert(__eql(
    rr,
    [ [ 'Keyword', '{{', 0 ],
      [ 'Id', 'g', 0 ],
      [ 'Keyword', '+=', 0 ],
      [ 'Number', 3, 0 ],
      [ 'Keyword', '+', 0 ],
      [ 'Number', 2, 0 ],
      [ 'Keyword', '*', 0 ],
      [ 'Number', 6, 0 ],
      [ 'Keyword', ';', 0 ],
      [ 'Id', 'abc', 0 ],
      [ 'Keyword', '}}', 0 ],
      [ 'Keyword', '(', 3 ],
      [ 'String', 'wer', 0 ],
      [ 'Keyword', ')', 0 ],
      [ 'Eof', 'eof', 0 ] ]))})

tt.add("numbers",function (){
  "123"
  "-123"
  "0x8"
  "011"
  "12.34e23"
  "-3.12e-1"})

tt.add("comments",function(){
  "\n\n//oijoioij  asdoijfoai//oijoij\n\n2+3"})

tt.add("regexp",function(){})
tt.add("strings",function(){})
tt.add("escape",function(){})
tt.add("unicode",function(){})

tt.add("keyword7",function(){
  var L=new Lx()
  L.add(["+=","{{","}}"])
  var ls=L.extract("{{g+=3+2*6;abc}}('wer')")
  __assert(__eql(
    ls.keyword7(ls.peek()),
    "{{"))

  __assert(__eql(
    ls.keyword7(ls.peek(),"+","-","*","{{"),
    "{{"))
})



tt.run_all(dbg)

module.exports=tt








var Lx=require("../lx")
var gg=require("../gg")
var tt=require("./tests")
var Tests=tt.Tests,__assert=tt.__assert,__eql=tt.__eql,__log=tt.__log
var dbg,debug=dbg=true
var tt=new Tests()

tt.add("simple sequence", function (){
  var L=new Lx()
  L.add("a")
  var ls=L.extract("a o a Xsdf a o o o o o a a a a a")
  var ao=gg.seq(["a",gg.id,"a",gg.id,"a"])

  var x=ao.parse(ls)
  dbg&&console.dir(x)

  __assert(__eql(
    x,['seq',['Id','o'],['Id','Xsdf']]))})

tt.add("simple list", function (){
  var L=new Lx()
  L.add("a")
  var ls=L.extract("a o o o o a a a a a a a")
  var l=gg.seq(["a",gg.list([gg.id]),"a"])
  //var l=gg.list([gg.id])

  var x=l.parse(ls)
  dbg&&console.dir(x)
  __assert(__eql(
    x,
    [ 'seq',
      [ [ 'Id', 'o' ], [ 'Id', 'o' ], [ 'Id', 'o' ], [ 'Id', 'o' ] ] ]))

  var ls=L.extract("{sdf,wer,sdf,wer} a a a a b b b")
  var l=gg.seq(["{",gg.list([gg.id,[","]]),"}"])
  var x=l.parse(ls)
  dbg&&console.dir(x)
  __assert(__eql(
    x,
    [ 'seq',
      [ [ 'Id', 'sdf' ],
        [ 'Id', 'wer' ],
        [ 'Id', 'sdf' ],
        [ 'Id', 'wer' ] ] ]))
})

tt.add("simple choice", function (){
  var L=new Lx()
  var ls=L.extract("{sdf,wer,sdf,wer} [asdf:oij:oijowe:oijo]")
  var m=gg.mseq([
    [["{",gg.list([gg.id,[","]]),"}"],{builder:function (e){return ["B",e[0]]}}],
    [["[",gg.list([gg.id,[":"]]),"]"],{builder:function (e){return ["A",e[0]]}}]])
  var x0=m.parse(ls)
  dbg&&console.dir(x0)
  __assert(__eql(
    x0,
    [ 'B',
      [ [ 'Id', 'sdf' ],
        [ 'Id', 'wer' ],
        [ 'Id', 'sdf' ],
        [ 'Id', 'wer' ] ] ]))
  var x1=m.parse(ls)
  dbg&&console.dir(x1)
  __assert(__eql(
    x1,
    [ 'A',
      [ [ 'Id', 'asdf' ],
        [ 'Id', 'oij' ],
        [ 'Id', 'oijowe' ],
        [ 'Id', 'oijo' ] ] ]))})

tt.add("onkey",function(){})
tt.add("opt",function(){})

tt.add("expr: arithmetics",function(){
  debugger
  var L=new Lx()
  var ls=L.extract("a*b+c*d")
  var E=gg.expr([],{
    primary:gg.id,
    infix:[
      [["*"],{prec:90,  builder:function(e1,op,e2){return ["Op","*",e1,e2]}}],
      [["+"],{prec:120, builder:function(e1,op,e2){return ["Op","+",e1,e2]}}]],})
  var x0=E.parse(ls)
  dbg&&__log(x0)
  __assert(__eql(
    x0,
    ["Op", "+",
     ["Op", "*",
      ["Id", "a"],
      ["Id", "b"]],
     ["Op", "*",
      ["Id", "c"],
      ["Id", "d"]]]))
  
})

tt.add("expr: right assoc",function(){
  var L=new Lx()
  var ls=L.extract("a,b,c*d+e")
  var E=gg.expr([],{
    primary:gg.id,
    infix:[
      [[","],{prec:130,  builder:function(e1,op,e2){return ["Op",",",e1,e2]},
              assoc:"right"}],
      [["*"],{prec:90,  builder:function(e1,op,e2){return ["Op","*",e1,e2]}}],
      [["+"],{prec:120, builder:function(e1,op,e2){return ["Op","+",e1,e2]}}]],})
  var x0=E.parse(ls)
  dbg&&__log(x0)
  __assert(__eql(
    x0,
    ["Op", ",",
     ["Id", "a"],
     ["Op", ",",
      ["Id", "b"],
      ["Op", "+",
       ["Op", "*",
        ["Id", "c"],
        ["Id", "d"]],
       ["Id", "e"]]]]))
  
})

tt.add("expr: prefix",function(){
  var L=new Lx()
  L.add(["++"])
  var ls=L.extract("++a*b+c")
  var E=gg.expr([],{
    primary:gg.id,
    infix:[
      [["*"],{prec:90,  builder:function(e1,op,e2){return ["Op","*",e1,e2]}}],
      [["+"],{prec:120, builder:function(e1,op,e2){return ["Op","+",e1,e2]}}]],
    prefix:[
      [["++"],{prec:100, builder:function(op,e){return ["Op","++",e]}}]]})
  var x0=E.parse(ls)
  dbg&&__log(x0)
  __assert(__eql(
    x0,
    ["Op", "+",
     ["Op", "++",
      ["Op", "*",
       ["Id", "a"],
       ["Id", "b"]]],
     ["Id", "c"]]))
})


tt.add("expr: prefix/suffix",function(){
  var L=new Lx()
  L.add(["++"])
  var ls=L.extract("++a[b].d(eee)+c++")
  var E=gg.expr([],{
    primary:gg.id,
    infix:[
      [["*"],{prec:90,  builder:function(e1,op,e2){return ["Op","*",e1,e2]}}],
      [["+"],{prec:120, builder:function(e1,op,e2){return ["Op","+",e1,e2]}}]],
    prefix:[
      [["++"],{prec:100, builder:function(op,e){return ["Op","++X",e]}}]],
    suffix:[
      [["++"],{prec:200, builder:function(e,op){return ["Op","X++",e]}}],
      [["[",gg.id,"]"],
       {prec:40,  builder:function(e,op){return ["Idx",e,op[0]]}}],
      [[".",gg.id],
       {prec:40,  builder:function(e,op){return ["Dot",e,op[0]]}}],
      [["(",gg.id,")"],
       {prec:40,  builder:function(e,op){return ["Call",e,op[0]]}}]]})
  var x0=E.parse(ls)
  dbg&&__log(x0)
  __assert(__eql(
    x0,
    ["Op","X++",
     ["Op", "+",
      ["Op", "++X",
       ["Call",
        ["Dot",
         ["Idx",
          ["Id", "a"],
          ["Id", "b"]],
         ["Id", "d"]],
        ["Id", "eee"]]],
      ["Id", "c"]]]))})

tt.run_all(dbg)

module.exports=tt






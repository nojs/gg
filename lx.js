
var TAG=0,VAL=1

function __assert(t,msg){
  if(!t) throw new Error("assert: "+msg)}

function MAP(a,fn,o){
  var rr=[]
  for(var i=0,l=a.length;i<l;i++){
    var r=fn.call(o,a[i],i)
    rr.push(r)}
  return rr}

function LexStream(){
  this.src=null
  this.i=0
  this.tokens=[]
  this.ti=0
  this.lx=null
  this.length=0
  this._nl=0}

LexStream.prototype={
  clone:function(){
    var ls=new LexStream()
    ls.src=this.src
    ls.i=this.i
    ls.tokens=this.tokens
    ls.ti=this.ti
    ls.lx=this.lx
    ls._nl=this._nl
    ls.length=this.length
    return ls},
  restore:function(ls){
    __assert(this.tokens.length===ls.tokens.length)
    this.ti=ls.ti},
  next:function(n){
    n=n||0
    var tok=this.peek(n)
    this.ti++
    return tok},
  peek:function(n){
    n=n||0
    return this.tokens[this.ti+n]},
  keyword7:function(){
    return this.lx.keyword7.apply(this.lx,arguments)}}


function Lexer(){
  this.sym={}
  this.alpha={}
}

Lexer.prototype={
  X:{
    spaces:/^[ \t]+/g,
    newline:/^\r?\n/g,
    comment:{
      short:/^\/\/[^\n]*(?=\r?\n)/g,
      long:/^\/[*]([^*]|[*][^\/])*[*]\//g,
      final:/^\/\/([^\n]*)$/g},
    number:{
      mantissa:[
          /^[0-9]+[.]?[0-9]*/g,
          /^[0-9]*[.][0-9]+/g],
      exponent:/^[eE][-+]?[0-9]+/g,
      hex:/^0[xX][0-9a-fA-F]+/g,
      oct:/^0[0-7]+()/g,},
    string:{
      '"':RegExp('[\\\r\n"]',"g"),
      "'":RegExp("[\\\r\n']","g")},
    word:/^([a-zA-Z$_][a-zA-Z$0-9_]*)/g},
  extractors:{
    newlines:function(S){
      var MAX=10,i=0
      do{
        this.X.newline.lastIndex=0
        var m=this.X.newline.exec(
          S.src.slice(S.i,S.i+MAX))
        if(m){
          this.dbg&&console.log("newline match")
          i++
          S.i+=this.X.newline.lastIndex}
      }while(m)
      if(i){
        S._nl=i}
      if(S.src.length<=S.i){
        return ["Eof","eof",S._nl]}},
    whitespaces:function(S){
      var eof=false,MAX=100
      do{
        var again=false
        var src=S.src.slice(S.i,S.i+MAX)
        var X=this.X.spaces;X.lastIndex=0
        var m=X.exec(src)
        if(m){
          this.dbg&&console.log("whitespace match")
          var j=m[0].length
          if(j==MAX){
            again=true}
          if(S.src.length<=S.i+j){
            eof=true}
          S.i+=j
          if(eof){
            return ["Eof","eof"]}}
      }while(again)},
    comments:function(S){
      var MAX=200
      if(S.src.slice(S.i,S.i+2)=="//"){
        var src=S.src.slice(S.i,S.i+MAX)
        var X=this.X.comment.short;X.lastIndex=0
        var m=X.exec(src)
        if(!m){
          return ["Eof","eof",S._nl]
          throw "comment at the end of file"}
        var j=X.lastIndex
        var comment=src.slice(2,j)
        S.i+=j}},
    string:function(S){
      var MAX=1000
      var c=S.src[S.i]
      var i=S.i+1,j=i
      if(c=="'"||c=='"'){
        var X=this.X.string[c];X.lastIndex=0
        while(1){
          var m=X.exec(S.src.slice(j,j+MAX))
          if(m){
            var x=m[0]
            if(x=="\\"){
              j+=1
              continue}
            else if(x==c){
              j+=X.lastIndex
              break}
            else{
              __assert(x=="\r"||x=="\n")}}
          throw "unterminated string"}
        S.i=j
        var _=["String",
          unescape_string(
            S.src.slice(i,j-1)),S._nl]
        S._nl=0
        return _}},
    word:function(S){
      var MAX=100
      this.X.word.lastIndex=0
      var m=this.X.word.exec(S.src.slice(S.i,S.i+MAX))
      if(m){
        var word=m[0]
        S.i+=this.X.word.lastIndex
        if(this.alpha[word]){
          var _=["Keyword",word,S._nl]
          S._nl=0
          return _}
        else{
          var _=["Id",word,S._nl]
          S._nl=0
          return _}}},
    number:function(S){
      //get number
      var MAX=100,src=S.src.slice(S.i,S.i+MAX)
      var X=this.X.number.hex;X.lastIndex=0
      var m=X.exec(src)
      if(m){
        var n=parseInt(src.slice(0,X.lastIndex))
        S.i+=X.lastIndex
        var _=["Number",n,S._nl]
        S._nl=0
        return _}
      else{
        var X0=this.X.number.mantissa[0]; X0.lastIndex=0
        var X1=this.X.number.mantissa[1]; X1.lastIndex=0
        var m=X0.exec(src)||X1.exec(src)
        if(m){
          var j=m.index+m[0].length
          var X=this.X.number.exponent;X.lastIndex=0
          m=X.exec(src.slice(j))
          if(m){
            j+=m.index+m[0].length}
          var n=parseFloat(src.slice(0,j))
          S.i+=j
          var _=["Number",n,S._nl]
          S._nl=0
          return _}}},
    symbol:function(S){
      var k=S.src[S.i]
      var symk=this.sym[k]
      if(!symk){
        S.i+=1
        var _=["Keyword",k,S._nl]
        S._nl=0
        return _}
      for(var i0=0;i0<symk.length;i0++){
        var sym=symk[i0]
        if(sym===S.src.slice(S.i,S.i+sym.length)){
          var _=["Keyword",sym,S._nl]
          S.i+=sym.length
          S._nl=0
          return _}}
      S.i+=1
      var _=["Keyword",k,S._nl]
      S._nl=0
      return _}},
  
  precedence:[
    "whitespaces","newlines","comments",
    "string","word","number","symbol"],

  _extract1:function(S){
    for(var i in this.precedence){
      var e=this.precedence[i]
      var tok=this.extractors[e].call(this,S)
      if(tok){
        return tok}}
    throw "None of the extractors worked"},
  extract:function(src){
    __assert(typeof src==="string")
    var S=new LexStream()
    S.src=src
    S.length=0
    S.lx=this 
    this._extract_all(S)
    return S},
  _extract_all:function(S){
    do{
      var tok=this._extract1(S)
      if(tok) {
        S.tokens.push(tok)
        S.length++}}
    while(tok && tok.length
          && typeof tok.length==="number"
          && tok[0]!="Eof")
    //FIXME: set length of lexstream
    //is it needed?
  },

  add:function(ww){
    if((typeof ww)==="string"){
      this._add1(ww)}
    else if(ww && ww.length
            && (typeof ww.length)==="number"){
      for(var i=0,l=ww.length;i<l;i++){
        this._add1(ww[i])}}},
  _add1:function(w){
    //FIXME: check for some invalid keywords
    if(!(w in this.alpha)){
      var X=this.X.word;X.lastIndex=0
      var m=X.exec(w)
      if(X.lastIndex==w.length){
        this.alpha[w]=true}
      else{
        if(1<w.length){
          var k=w[0]
          var list=this.sym[k]
          if(!list){
            list=[]
            this.sym[k]=list}
          list.push(w)}}}},
  keyword7:function(){
    var aa=arguments,tok=aa[0]
    if(tok[TAG]!=="Keyword"){
      return false}
    if(1<aa.length){
      for(var i=1,l=aa.length;i<l;i++){
        __assert(typeof aa[i]==="string")
        if(aa[i]===tok[VAL]){
          return aa[i]}}
      return false}
    else if(aa.length===1){
      return tok[VAL]}},

}



function unescape_string(s){
  //FIXME
  return s}

module.exports=Lexer



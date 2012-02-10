
function __assert(t,msg){
  if(!t) throw ["assert",msg]}

function MAP(a,fn,o){
  var rr=[]
  for(var i=0,l=a.length;i<l;i++){
    var r=fn.call(o,a[i],i)
    rr.push(r)}
  return rr}

var fail={v:"<fail>"}

function Parser(){}

Parser.prototype={
  lift:function(p){
    if(p.parse && typeof p.parse==="function"){
      return p}
    else if(typeof p==="object" && p && typeof p.length==="number"){
      return Seq.def(p)}
    else if(typeof p==="string"){
      return Key.def(p)}
    else if(typeof p==="function"){
      p=p()
      Parser.lift(p)}
    else {
      throw "unsupported type lift to Parser"}},
  parse:function(ls){
    var ls1=ls.clone()
    var x=this._parse(ls)
    if(x===fail){
      ls.restore(ls1)
      return fail}
    else{
      return this.builder(x)}},
  _parse:function(ls){
    this.error(ls,"Invalid parser")},
  error:function(ls,msg){
    throw ["parse",this,ls,]},
  builder:function(e){
    return e}}

function Seq(){
  this.pp=[]}

Seq.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    var S=new Seq()
    oo&&oo.builder&&(S.builder=oo.builder)
    S.pp=MAP(pp,function(p,i){
      return Parser.lift(p)})
    return S},
  _parse:function(ls){
    var ee=[]
    for(var i=0,l=this.pp.length;i<l;i++){
      var r=this.pp[i].parse(ls)
      if(r){
        if(r===fail){
          return fail}
        //ee.[i]=r
        ee.push(r)}}
    return ee},
  builder:function(ee){
    ee.unshift("seq")
    return ee}}


function MSeq(){
  this.keys={}
  this._default=null}

MSeq.prototype={
  __proto__:Parser.prototype,
  def:function(ss,oo){
    var M=new MSeq()
    MAP(ss,function(dd,i){
      var s=dd[0],oo=dd[1]
      __assert(typeof s[0]==="string")
      var k=s[0]
      var S=seq(s,oo)
      if(k in M.keys){
        throw ["def","multiple sequences with same key:'"+s+"'"]}
      M.keys[k]=S})
    return M},
  _parse:function(ls){
    var w
    if(w=ls.keyword7(ls.peek())){
      var p=this.keys[w]||this._default
      if(!p){
        return fail}
      return p.parse(ls)}}}


function Key(){
  this._key=null}

Key.prototype={
  __proto__:Parser.prototype,
  def:function(k){
    __assert(typeof k==="string")
    var K=new Key()
    K._key=k
    return K},
  _parse:function(ls){
    if(!ls.keyword7(ls.peek(),this._key)){
      return fail}
    ls.next()
    return null}}

function OnKey(){
  this._key=null}

OnKey.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    __assert(pp && pp[0] && typeof pp[0]==="string")
    var k=pp[0]
    var p=Parser.lift(pp[1])
    var K=new OnKey()
    K._key=k
    K.parser=parser
    return K},
  _parse:function(ls){
    if(!ls.keyword7(ls.peek(),this._key)){
      return fail}
    ls.next()
    return this.parser.parse(ls)}}


function List(){
  this.empty_allowed=true
  this.primary=id}

List.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    var L=new List()
    __assert(pp && pp[0])
    var prim=Parser.lift(pp[0])
    var sep=pp[1]&&array_to_hash(pp[1])
    var term=pp[2]&&array_to_hash(pp[2])
    L.primary=prim
    sep&&(L.separators=sep)
    term&&(L.terminators=term)
    return L},
  _parse:function(ls){
    var ee=[]
    do{
      var elt=this.primary.parse(ls)
      if(elt===fail){
        break}
      ee.push(elt)
      var w=ls.keyword7(ls.peek())
      if(w && this.separators && w in this.separators){
        ls.next()}
    }while(!(
      //end list, if:
      //1. separators defined and next token is not separator
      (w && this.separators && !(w in this.separators)) 
      //2. terminators defined and next token is terminator
        ||(w && this.terminators && w in this.terminators)))
    if(ee.length===0 && !this.empty_allowed){
      return fail}
    return ee}}

function Id(){}

Id.prototype={
  __proto__:Parser.prototype,
  _parse:function(ls){
    var w=ls.peek()
    if(w[0]!=="Id"){
      return fail}
    ls.next()
    return w},
  builder:function(w){
    return ["Id",w[1]]}}

function Opt(){
  this.parser=function(){return false}
}

Opt.prototype={
  def:function(p){
    var P=Parser.lift(p)
    var O=new Opt()
    O.parser=p
    return O},
  _parse:function(ls){
    var x=this.parser.parse(ls1)
    if(x===fail){
      return null}
    else{
      return x}}}

function seq(){
  return Seq.prototype.def.apply(Seq,arguments)}
function mseq(){
  return MSeq.prototype.def.apply(MSeq,arguments)}
function key(){
  return Key.prototype.def.apply(Key,arguments)}
function onkey(){
  return OnKey.prototype.def.apply(OnKey,arguments)}
function list(){
  return List.prototype.def.apply(List,arguments)}
var id=new Id()
//var one=new One()
//var zero=new Zero()
function opt(){
  return Opt.prototype.def.apply(Opt,arguments)}
function expr(){
  return Expr.def.apply(Expr,arguments)}
function choice(){
  return Choice.def.apply(Choice,arguments)}
function one(){
  return new One}
function zero(){
  return new Zero}

module.exports={
  Seq:Seq,
  List:List,
  MSeq:MSeq,
  OnKey:OnKey,
  Opt:Opt,
  Key:Key,
  seq:seq,
  list:list,
  mseq:mseq,
  onkey:onkey,
  id:id,
  opt:opt,
  key:key,
  expr:expr,
  choice:choice,
  one:one,
  zero:zero}




Parser.lift=Parser.prototype.lift
Seq.def=Seq.prototype.def
Key.def=Key.prototype.def

function array_to_hash(a){
  var r={}
  MAP(a,function(e,i){
    __assert(typeof e==="string")
    r[e]=true})
  return r}

function Expr(){
  this.infix={}
  this.prefix={}
  this.suffix={}
}

Expr.prototype={
  __proto__:Parser.prototype,
  def:function(dd,oo){
    __assert(oo && oo.primary && oo.infix)
    var E=new Expr()
    E.primary=Parser.lift(oo.primary)
    oo.infix &&  def_infix(E,oo.infix)
    oo.prefix && def_prefix(E,oo.prefix)
    oo.suffix && def_suffix(E,oo.suffix)
    return E
    
    function def_infix(E,ii){
      MAP(ii,function(pp,i){
        var s=pp[0],oo=pp[1]
        __assert(typeof s[0]==="string")
        var k=s[0]
        __assert(!(k in E.infix))
        var O=OpInfix.def(s,oo)
        E.infix[k]=O})}
    function def_prefix(E,pp){
      MAP(pp,function(pp1,i){
        var s=pp1[0],oo=pp1[1]
        __assert(typeof s[0]==="string")
        var k=s[0]
        __assert(!(k in E.prefix))
        var O=OpPrefix.def(s,oo)
        E.prefix[k]=O})}
    function def_suffix(E,pp){
      MAP(pp,function(pp1,i){
        var s=pp1[0],oo=pp1[1]
        __assert(typeof s[0]==="string")
        var k=s[0]
        __assert(!(k in E.suffix))
        var O=OpSuffix.def(s,oo)
        E.suffix[k]=O})}},

  parse:function(ls,prec){
    prec=prec||Infinity
    var ls1=ls.clone()
    var x=this._parse(ls,prec)
    if(x===fail){
      ls.restore(ls1)
      return fail}
    return this.builder(x)},

  _parse:function(ls,prec){
    var self=this
    var e=parse_prefix.call(this,ls)
    if(e===fail){
      var e=this.primary.parse(ls)
      if(e===fail){
        return fail}}
    while(true){
      var x=parse_infix.call(this,ls,e)
      var e1=(x!==fail?x:e)
      var y=parse_suffix.call(this,ls,e1)
      if(x===fail
         && y===fail){
        break}
      e=(y!==fail?y:x)}
    return e

    function parse_suffix(ls,e){
      var w=ls.keyword7(ls.peek())
      if(!w||!this.suffix[w]){
        return fail}
      var S=this.suffix[w]
      if(prec<S.prec){
        return fail}
      var op=S.parse(ls)
      if(op===fail){
        return fail}
      return S.builder(e,op)}

    function parse_prefix(ls){
      var w=ls.keyword7(ls.peek())
      if(!w||!this.prefix[w]){
        return fail}
      var P=this.prefix[w]
      if(prec<P.prec){
        return fail}
      var op=P.parse(ls)
      if(op===fail){
        return fail}
      var e=self.parse(ls,P.prec)
      return P.builder(op,e)}
    
    function parse_infix(ls,e0){
      var w=ls.keyword7(ls.peek())
      if(!w||!this.infix[w]){
        return fail}
      var I=this.infix[w]
      if(I.prec<prec
         || I.prec===prec && I.assoc==="right"){
        var op=I.parse(ls)
        if(op===fail){
          console.log("why would it parse not?")
          return e0}
        var e1=self.parse(ls,I.prec)
        if(e1===fail){
          return fail}
        return I.builder(e0,op,e1)}
      else if(I.prec<=prec&&I.assoc==="flat"){
        throw ["assert","flat associativity is not implemented"]}
      else{
        return fail}}}}
Expr.def=Expr.prototype.def

function OpInfix(){
  this.pp=[]
  this.prec=100
  this.assoc="left"
  this._op="??"}

OpInfix.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    var Op=new OpInfix()
    oo&&oo.builder&&(Op.builder=oo.builder)
    oo&&oo.prec&&(Op.prec=oo.prec)
    oo&&oo.assoc&&(Op.assoc=oo.assoc)
    Op.pp=MAP(pp,function(p,i){
      return Parser.lift(p)})
    return Op},
  parse:function(ls,prec){
    if(prec<=this.prec){
      return fail}
    var ls1=ls.clone()
    var x=this._parse(ls,prec)
    if(x===fail){
      ls.restore(ls1)
      return fail}
    else{
      return x}},
  _parse:function(ls,prec){
    var ee=[]
    for(var i=0,l=this.pp.length;i<l;i++){
      var r=this.pp[i].parse(ls)
      if(r){
        if(r===fail){
          return fail}
        ee.push(r)}}
    return ee},
  builder:function(e0,op,e1){
    return ["Op",this._op,e0,e1[0]]}
}

OpInfix.def=OpInfix.prototype.def



function OpSuffix(){
  this.pp=[]
  this.prec=500
  this._op="??"}

OpSuffix.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    var Op=new OpSuffix()
    oo&&oo.builder&&(Op.builder=oo.builder)
    oo&&oo.prec&&(Op.prec=oo.prec)
    Op.pp=MAP(pp,function(p,i){
      return Parser.lift(p)})
    return Op},
  parse:function(ls,prec){
    if(prec<=this.prec){
      return fail}
    var ls1=ls.clone()
    var x=this._parse(ls,prec)
    if(x===fail){
      ls.restore(ls1)
      return fail}
    else{
      return x}},
  _parse:function(ls,prec){
    var ee=[]
    for(var i=0,l=this.pp.length;i<l;i++){
      var r=this.pp[i].parse(ls)
      if(r){
        if(r===fail){
          return fail}
        ee.push(r)}}
    return ee},
  builder:function(e,op){
    return ["Op",this._op,e]}
}

OpSuffix.def=OpSuffix.prototype.def


function OpPrefix(){
  this.pp=[]
  this.prec=100
  this.assoc="left"
  this._op="??"}

OpPrefix.prototype={
  __proto__:Parser.prototype,
  def:function(pp,oo){
    var Op=new OpPrefix()
    oo&&oo.builder&&(Op.builder=oo.builder)
    oo&&oo.prec&&(Op.prec=oo.prec)
    Op.pp=MAP(pp,function(p,i){
      return Parser.lift(p)})
    return Op},
  parse:function(ls,prec){
    if(prec<=this.prec){
      return fail}
    var ls1=ls.clone()
    var x=this._parse(ls,prec)
    if(x===fail){
      ls.restore(ls1)
      return fail}
    else{
      return x}},
  _parse:function(ls,prec){
    var ee=[]
    for(var i=0,l=this.pp.length;i<l;i++){
      var r=this.pp[i].parse(ls)
      if(r){
        if(r===fail){
          return fail}
        ee.push(r)}}
    return ee},
  builder:function(op,e){
    return ["Op",this._op,e1]}
}

OpPrefix.def=OpPrefix.prototype.def


function Choice(){
  this.pp=[]}

Choice.prototype={
  __proto__:Parser.prototype,
  def:function(dd,oo){
    var C=new Choice()
    var pp=MAP(dd,function(p,i){
      return Parser.lift(p)})
    C.pp=pp
    return pp},
  _parse:function(ls){
    for(var i=0,l=this.pp.length;i<l;i++){
      var ls0=ls.clone()
      var x=this.pp[i].parse(ls0)
      if(x!==fail){
        return x}}
    return fail}
}
Choice.def=Choice.prototype.def

function One(){}
One.prototype={
  __proto__:Parser.prototype,
  parse:function(ls){
    return null}}

function Zero(){}
Zero.prototype={
  __proto__:Parser.prototype,
  parse:function(ls){
    return fail}}

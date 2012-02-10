
function __assert(t,m){
  if(!t){
    throw ["assert",m]}}

function __type(v){
  var t=typeof v
  if(t==="object"){
    if(v===null){
      return "atom"}
    else if(typeof v.length==="number"){
      return "list"}
    else{
      return "dict"}}
  else {
    //if(t==="function"
    //   ||t==="number"
    //      ||t==="string"
    //      ||t==="boolean")
    return "atom"}}

function __log(o){
  console.log(JSON.stringify(o,null,2))
}

function __eql(a,b){
  function eq_list(a,b){
    if(a.length!==b.length){
      return false}
    for(var i=0,l=a.length;i<l;i++){
      if(!__eql(a[i],b[i])){
        return false}}
    return true}
  function eq_dict(a,b){
    for(var k in a){
      if(!(k in b)
        ||!__eql(a,b)){
        return false}}
    for(var k in b){
      if(!(k in a)){
        return false}}
    return true}

  var ta=__type(a),tb=__type(b)
  if(ta===tb){
    if(ta==="atom"){
      return a===b}
    else if(ta==="list"){
      return eq_list(a,b)}
    else if(ta==="dict"){
      return eq_dict(a,b)}
    else{
      throw "What's the type?"+a}}
  else{
    return false}}

var Tests

(Tests=function Tests(){
  this._tests={},
  this._keys=[]})
  .prototype={
    add:function(k,t){
      __assert(!(k in this._tests),"two tests with same name: "+k)
      this._tests[k]=t
      this._keys.push(k)},
    get:function(k){
      if(k in this._tests){
        return this._tests[k]}
      else{
        return function(){}}},
    doeach:function(fn,o){
      for(var i=0,l=this._keys.length;i<l;i++){
        var k=this._keys[i]
        fn.call(o,this._tests[k],k)}},
    tryit:function(t,debug){
      try{
        t()
        return true}
      catch(e){
        if(debug){
          throw e}
        return e}},
    run:function(k){
      var t=this.get(k),e
      console.log("running "+k)
      if(e=this.tryit(t)===true){
        console.log("ok.")}
      else{
        console.log("fail. error: "+e)}},
    run_all:function(debug){
      var err=0,ok=0,e
      this.doeach(function(t,k){
        console.log("running "+k)
        if((e=this.tryit(t,debug))===true){
          ok++
          console.log("ok.")}
        else{
          err++
          console.log("fail. error: "+e)}
      },this)
      console.log("=============================================")
      console.log("all done. Passed "+ok+" of "+this._keys.length+", failed "+err)}}


function eql(a,b){
  
}


module.exports={
  Tests:Tests,
  __eql:__eql,
  __assert:__assert,
  __log:__log,
}

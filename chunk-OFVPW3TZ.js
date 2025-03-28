import{a as j,b as k}from"./chunk-L5QIBQOE.js";import{e as M}from"./chunk-VK3OUH2U.js";import{$a as w,L as a,M as m,N as p,R as f,Ra as g,Va as b,X as _,eb as v,f as c,i as n,mb as C,s as h,tb as y,vb as S}from"./chunk-JF3HJCKF.js";var u=(()=>{class o{constructor(i,e,t,r,l,R){this._translate=i,this._budgettransactionService=e,this._alert=t,this._form=r,this._core=l,this._router=R,this.columns=["amount","note"],this.form=this._form.getForm("budgettransaction",j),this.budget_id=this._router.url.includes("transactions/")?this._router.url.replace("/transactions/",""):"",this.config={paginate:this.setRows.bind(this),perPage:20,setPerPage:this._budgettransactionService.setPerPage.bind(this._budgettransactionService),allDocs:!1,create:this.budget_id?()=>{this._form.modal(this.form,{label:"Create",click:(s,d)=>c(this,null,function*(){d(),this._preCreate(s),yield n(this._budgettransactionService.create(s)),this.setRows()})})}:null,update:this.budget_id?s=>{this._form.modal(this.form,[],s).then(d=>{this._core.copy(d,s),this._budgettransactionService.update(s)})}:null,delete:s=>{this._alert.question({text:this._translate.translate("Common.Are you sure you want to delete this budgettransaction?"),buttons:[{text:this._translate.translate("Common.No")},{text:this._translate.translate("Common.Yes"),callback:()=>c(this,null,function*(){yield n(this._budgettransactionService.delete(s)),this.setRows()})}]})},buttons:[this.budget_id?{icon:"cloud_download",click:s=>{this._form.modalUnique("budgettransaction","url",s)}}:null],headerButtons:[this.budget_id?{icon:"playlist_add",click:this._bulkManagement(),class:"playlist"}:null,this.budget_id?{icon:"edit_note",click:this._bulkManagement(!1),class:"edit"}:null]},this.rows=[],this._page=1,this.setRows()}setRows(i=this._page){this._page=i,this._core.afterWhile(this,()=>{this._budgettransactionService.get({page:i,query:this.budget_id?"budget="+this.budget_id:""}).subscribe(e=>{this.rows.splice(0,this.rows.length),this.rows.push(...e)})},250)}_bulkManagement(i=!0){return()=>{this._form.modalDocs(i?[]:this.rows).then(e=>c(this,null,function*(){if(i)for(let t of e)this._preCreate(t),yield n(this._budgettransactionService.create(t));else{for(let t of this.rows)e.find(r=>r._id===t._id)||(yield n(this._budgettransactionService.delete(t)));for(let t of e){let r=this.rows.find(l=>l._id===t._id);r?(this._core.copy(t,r),yield n(this._budgettransactionService.update(r))):(this._preCreate(t),yield n(this._budgettransactionService.create(t)))}}this.setRows()}))}}_preCreate(i){i.__created=!1,i.budget=this.budget_id}static{this.\u0275fac=function(e){return new(e||o)(a(C),a(k),a(v),a(S),a(w),a(g))}}static{this.\u0275cmp=m({type:o,selectors:[["ng-component"]],standalone:!1,decls:1,vars:3,consts:[["title","Transactions",3,"columns","config","rows"]],template:function(e,t){e&1&&_(0,"wtable",0),e&2&&f("columns",t.columns)("config",t.config)("rows",t.rows)},dependencies:[y],encapsulation:2})}}return o})();var I=[{path:"",component:u},{path:":budget",component:u}],E=(()=>{class o{static{this.\u0275fac=function(e){return new(e||o)}}static{this.\u0275mod=p({type:o})}static{this.\u0275inj=h({imports:[b.forChild(I),M]})}}return o})();export{E as TransactionsModule};

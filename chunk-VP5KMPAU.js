import{a as w}from"./chunk-FVMTY43I.js";import{a as S}from"./chunk-BU52CSBB.js";import{e as C}from"./chunk-VK3OUH2U.js";import{$a as p,L as n,M as m,N as l,R as u,Va as h,X as f,eb as _,mb as g,s as d,tb as b,vb as v}from"./chunk-JF3HJCKF.js";var y=(()=>{class o{get rows(){return this._budgetService.budgets}constructor(r,t,e,s,c){this._budgetService=r,this._translate=t,this._alert=e,this._form=s,this._core=c,this.columns=["name","description"],this.form=this._form.getForm("budget",w),this.config={create:()=>{this._form.modal(this.form,{label:"Create",click:(i,a)=>{this._preCreate(i),this._budgetService.create(i),a()}})},update:i=>{this._form.modal(this.form,[],i).then(a=>{this._core.copy(a,i),this._budgetService.update(i)})},delete:i=>{this._alert.question({text:this._translate.translate("Common.Are you sure you want to delete this budget?"),buttons:[{text:this._translate.translate("Common.No")},{text:this._translate.translate("Common.Yes"),callback:()=>{this._budgetService.delete(i)}}]})},buttons:[{icon:"swap_vert",hrefFunc:i=>"/transactions/"+i._id},{icon:"cloud_download",click:i=>{this._form.modalUnique("budget","url",i)}}],headerButtons:[{icon:"playlist_add",click:this._bulkManagement(),class:"playlist"},{icon:"edit_note",click:this._bulkManagement(!1),class:"edit"}]}}_bulkManagement(r=!0){return()=>{this._form.modalDocs(r?[]:this.rows).then(t=>{if(r)for(let e of t)this._preCreate(e),this._budgetService.create(e);else{for(let e of this.rows)t.find(s=>s._id===e._id)||this._budgetService.delete(e);for(let e of t){let s=this.rows.find(c=>c._id===e._id);s?(this._core.copy(e,s),this._budgetService.update(s)):(this._preCreate(e),this._budgetService.create(e))}}})}}_preCreate(r){r.__created=!1}static{this.\u0275fac=function(t){return new(t||o)(n(S),n(g),n(_),n(v),n(p))}}static{this.\u0275cmp=m({type:o,selectors:[["ng-component"]],standalone:!1,decls:1,vars:3,consts:[["title","Budgets",3,"columns","config","rows"]],template:function(t,e){t&1&&f(0,"wtable",0),t&2&&u("columns",e.columns)("config",e.config)("rows",e.rows)},dependencies:[b],encapsulation:2})}}return o})();var k=[{path:"",component:y}],R=(()=>{class o{static{this.\u0275fac=function(t){return new(t||o)}}static{this.\u0275mod=l({type:o})}static{this.\u0275inj=d({imports:[h.forChild(k),C]})}}return o})();export{R as BudgetsModule};

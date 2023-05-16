(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const He={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},De=t=>(...e)=>({_$litDirective$:t,values:e});let ie=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,s,r){this._$Ct=e,this._$AM=s,this._$Ci=r}_$AS(e,s){return this.update(e,s)}update(e,s){return this.render(...s)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var F;const j=window,S=j.trustedTypes,de=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,K="$lit$",$=`lit$${(Math.random()+"").slice(9)}$`,Ue="?"+$,ut=`<${Ue}>`,C=document,k=()=>C.createComment(""),L=t=>t===null||typeof t!="object"&&typeof t!="function",ze=Array.isArray,dt=t=>ze(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",I=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fe=/-->/g,pe=/>/g,w=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),me=/'/g,ve=/"/g,je=/^(?:script|style|textarea|title)$/i,ft=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),pt=ft(1),y=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),ge=new WeakMap,A=C.createTreeWalker(C,129,null,!1),mt=(t,e)=>{const s=t.length-1,r=[];let n,i=e===2?"<svg>":"",o=R;for(let a=0;a<s;a++){const c=t[a];let h,u,d=-1,p=0;for(;p<c.length&&(o.lastIndex=p,u=o.exec(c),u!==null);)p=o.lastIndex,o===R?u[1]==="!--"?o=fe:u[1]!==void 0?o=pe:u[2]!==void 0?(je.test(u[2])&&(n=RegExp("</"+u[2],"g")),o=w):u[3]!==void 0&&(o=w):o===w?u[0]===">"?(o=n??R,d=-1):u[1]===void 0?d=-2:(d=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?w:u[3]==='"'?ve:me):o===ve||o===me?o=w:o===fe||o===pe?o=R:(o=w,n=void 0);const m=o===w&&t[a+1].startsWith("/>")?" ":"";i+=o===R?c+ut:d>=0?(r.push(h),c.slice(0,d)+K+c.slice(d)+$+m):c+$+(d===-2?(r.push(void 0),a):m)}const l=i+(t[s]||"<?>")+(e===2?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[de!==void 0?de.createHTML(l):l,r]};class O{constructor({strings:e,_$litType$:s},r){let n;this.parts=[];let i=0,o=0;const l=e.length-1,a=this.parts,[c,h]=mt(e,s);if(this.el=O.createElement(c,r),A.currentNode=this.el.content,s===2){const u=this.el.content,d=u.firstChild;d.remove(),u.append(...d.childNodes)}for(;(n=A.nextNode())!==null&&a.length<l;){if(n.nodeType===1){if(n.hasAttributes()){const u=[];for(const d of n.getAttributeNames())if(d.endsWith(K)||d.startsWith($)){const p=h[o++];if(u.push(d),p!==void 0){const m=n.getAttribute(p.toLowerCase()+K).split($),v=/([.?@])?(.*)/.exec(p);a.push({type:1,index:i,name:v[2],strings:m,ctor:v[1]==="."?gt:v[1]==="?"?$t:v[1]==="@"?bt:B})}else a.push({type:6,index:i})}for(const d of u)n.removeAttribute(d)}if(je.test(n.tagName)){const u=n.textContent.split($),d=u.length-1;if(d>0){n.textContent=S?S.emptyScript:"";for(let p=0;p<d;p++)n.append(u[p],k()),A.nextNode(),a.push({type:2,index:++i});n.append(u[d],k())}}}else if(n.nodeType===8)if(n.data===Ue)a.push({type:2,index:i});else{let u=-1;for(;(u=n.data.indexOf($,u+1))!==-1;)a.push({type:7,index:i}),u+=$.length-1}i++}}static createElement(e,s){const r=C.createElement("template");return r.innerHTML=e,r}}function T(t,e,s=t,r){var n,i,o,l;if(e===y)return e;let a=r!==void 0?(n=s._$Co)===null||n===void 0?void 0:n[r]:s._$Cl;const c=L(e)?void 0:e._$litDirective$;return(a==null?void 0:a.constructor)!==c&&((i=a==null?void 0:a._$AO)===null||i===void 0||i.call(a,!1),c===void 0?a=void 0:(a=new c(t),a._$AT(t,s,r)),r!==void 0?((o=(l=s)._$Co)!==null&&o!==void 0?o:l._$Co=[])[r]=a:s._$Cl=a),a!==void 0&&(e=T(t,a._$AS(t,e.values),a,r)),e}let vt=class{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var s;const{el:{content:r},parts:n}=this._$AD,i=((s=e==null?void 0:e.creationScope)!==null&&s!==void 0?s:C).importNode(r,!0);A.currentNode=i;let o=A.nextNode(),l=0,a=0,c=n[0];for(;c!==void 0;){if(l===c.index){let h;c.type===2?h=new D(o,o.nextSibling,this,e):c.type===1?h=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(h=new _t(o,this,e)),this._$AV.push(h),c=n[++a]}l!==(c==null?void 0:c.index)&&(o=A.nextNode(),l++)}return i}v(e){let s=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,s),s+=r.strings.length-2):r._$AI(e[s])),s++}};class D{constructor(e,s,r,n){var i;this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=r,this.options=n,this._$Cp=(i=n==null?void 0:n.isConnected)===null||i===void 0||i}get _$AU(){var e,s;return(s=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&s!==void 0?s:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=T(this,e,s),L(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==y&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):dt(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==f&&L(this._$AH)?this._$AA.nextSibling.data=e:this.$(C.createTextNode(e)),this._$AH=e}g(e){var s;const{values:r,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=O.createElement(n.h,this.options)),n);if(((s=this._$AH)===null||s===void 0?void 0:s._$AD)===i)this._$AH.v(r);else{const o=new vt(i,this),l=o.u(this.options);o.v(r),this.$(l),this._$AH=o}}_$AC(e){let s=ge.get(e.strings);return s===void 0&&ge.set(e.strings,s=new O(e)),s}T(e){ze(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let r,n=0;for(const i of e)n===s.length?s.push(r=new D(this.k(k()),this.k(k()),this,this.options)):r=s[n],r._$AI(i),n++;n<s.length&&(this._$AR(r&&r._$AB.nextSibling,n),s.length=n)}_$AR(e=this._$AA.nextSibling,s){var r;for((r=this._$AP)===null||r===void 0||r.call(this,!1,!0,s);e&&e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){var s;this._$AM===void 0&&(this._$Cp=e,(s=this._$AP)===null||s===void 0||s.call(this,e))}}class B{constructor(e,s,r,n,i){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=s,this._$AM=n,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=f}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,s=this,r,n){const i=this.strings;let o=!1;if(i===void 0)e=T(this,e,s,0),o=!L(e)||e!==this._$AH&&e!==y,o&&(this._$AH=e);else{const l=e;let a,c;for(e=i[0],a=0;a<i.length-1;a++)c=T(this,l[r+a],s,a),c===y&&(c=this._$AH[a]),o||(o=!L(c)||c!==this._$AH[a]),c===f?e=f:e!==f&&(e+=(c??"")+i[a+1]),this._$AH[a]=c}o&&!n&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class gt extends B{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}}const yt=S?S.emptyScript:"";class $t extends B{constructor(){super(...arguments),this.type=4}j(e){e&&e!==f?this.element.setAttribute(this.name,yt):this.element.removeAttribute(this.name)}}class bt extends B{constructor(e,s,r,n,i){super(e,s,r,n,i),this.type=5}_$AI(e,s=this){var r;if((e=(r=T(this,e,s,0))!==null&&r!==void 0?r:f)===y)return;const n=this._$AH,i=e===f&&n!==f||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==f&&(n===f||i);i&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s,r;typeof this._$AH=="function"?this._$AH.call((r=(s=this.options)===null||s===void 0?void 0:s.host)!==null&&r!==void 0?r:this.element,e):this._$AH.handleEvent(e)}}class _t{constructor(e,s,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){T(this,e)}}const ye=j.litHtmlPolyfillSupport;ye==null||ye(O,D),((F=j.litHtmlVersions)!==null&&F!==void 0?F:j.litHtmlVersions=[]).push("2.7.3");const wt=(t,e,s)=>{var r,n;const i=(r=s==null?void 0:s.renderBefore)!==null&&r!==void 0?r:e;let o=i._$litPart$;if(o===void 0){const l=(n=s==null?void 0:s.renderBefore)!==null&&n!==void 0?n:null;i._$litPart$=o=new D(e.insertBefore(k(),l),l,void 0,s??{})}return o._$AI(t),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let ee=class extends ie{constructor(e){if(super(e),this.et=f,e.type!==He.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===f||e==null)return this.ft=void 0,this.et=e;if(e===y)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const s=[e];return s.raw=s,this.ft={_$litType$:this.constructor.resultType,strings:s,values:[]}}};ee.directiveName="unsafeHTML",ee.resultType=1;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let $e=class extends ee{};$e.directiveName="unsafeSVG",$e.resultType=2;/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const z=window,oe=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ae=Symbol(),be=new WeakMap;let Ve=class{constructor(e,s,r){if(this._$cssResult$=!0,r!==ae)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(oe&&e===void 0){const r=s!==void 0&&s.length===1;r&&(e=be.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&be.set(s,e))}return e}toString(){return this.cssText}};const x=t=>new Ve(typeof t=="string"?t:t+"",void 0,ae),Be=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((r,n,i)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+t[i+1],t[0]);return new Ve(s,t,ae)},Et=(t,e)=>{oe?t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet):e.forEach(s=>{const r=document.createElement("style"),n=z.litNonce;n!==void 0&&r.setAttribute("nonce",n),r.textContent=s.cssText,t.appendChild(r)})},_e=oe?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const r of e.cssRules)s+=r.cssText;return x(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Y;const V=window,we=V.trustedTypes,At=we?we.emptyScript:"",Ee=V.reactiveElementPolyfillSupport,te={toAttribute(t,e){switch(e){case Boolean:t=t?At:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},We=(t,e)=>e!==t&&(e==e||t==t),G={attribute:!0,type:String,converter:te,reflect:!1,hasChanged:We};class E extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(e){var s;this.finalize(),((s=this.h)!==null&&s!==void 0?s:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((s,r)=>{const n=this._$Ep(r,s);n!==void 0&&(this._$Ev.set(n,r),e.push(n))}),e}static createProperty(e,s=G){if(s.state&&(s.attribute=!1),this.finalize(),this.elementProperties.set(e,s),!s.noAccessor&&!this.prototype.hasOwnProperty(e)){const r=typeof e=="symbol"?Symbol():"__"+e,n=this.getPropertyDescriptor(e,r,s);n!==void 0&&Object.defineProperty(this.prototype,e,n)}}static getPropertyDescriptor(e,s,r){return{get(){return this[s]},set(n){const i=this[e];this[s]=n,this.requestUpdate(e,i,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||G}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const s=this.properties,r=[...Object.getOwnPropertyNames(s),...Object.getOwnPropertySymbols(s)];for(const n of r)this.createProperty(n,s[n])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const n of r)s.unshift(_e(n))}else e!==void 0&&s.push(_e(e));return s}static _$Ep(e,s){const r=s.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}u(){var e;this._$E_=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach(s=>s(this))}addController(e){var s,r;((s=this._$ES)!==null&&s!==void 0?s:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)===null||r===void 0||r.call(e))}removeController(e){var s;(s=this._$ES)===null||s===void 0||s.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,s)=>{this.hasOwnProperty(s)&&(this._$Ei.set(s,this[s]),delete this[s])})}createRenderRoot(){var e;const s=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return Et(s,this.constructor.elementStyles),s}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach(s=>{var r;return(r=s.hostConnected)===null||r===void 0?void 0:r.call(s)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach(s=>{var r;return(r=s.hostDisconnected)===null||r===void 0?void 0:r.call(s)})}attributeChangedCallback(e,s,r){this._$AK(e,r)}_$EO(e,s,r=G){var n;const i=this.constructor._$Ep(e,r);if(i!==void 0&&r.reflect===!0){const o=(((n=r.converter)===null||n===void 0?void 0:n.toAttribute)!==void 0?r.converter:te).toAttribute(s,r.type);this._$El=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$El=null}}_$AK(e,s){var r;const n=this.constructor,i=n._$Ev.get(e);if(i!==void 0&&this._$El!==i){const o=n.getPropertyOptions(i),l=typeof o.converter=="function"?{fromAttribute:o.converter}:((r=o.converter)===null||r===void 0?void 0:r.fromAttribute)!==void 0?o.converter:te;this._$El=i,this[i]=l.fromAttribute(s,o.type),this._$El=null}}requestUpdate(e,s,r){let n=!0;e!==void 0&&(((r=r||this.constructor.getPropertyOptions(e)).hasChanged||We)(this[e],s)?(this._$AL.has(e)||this._$AL.set(e,s),r.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,r))):n=!1),!this.isUpdatePending&&n&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((n,i)=>this[i]=n),this._$Ei=void 0);let s=!1;const r=this._$AL;try{s=this.shouldUpdate(r),s?(this.willUpdate(r),(e=this._$ES)===null||e===void 0||e.forEach(n=>{var i;return(i=n.hostUpdate)===null||i===void 0?void 0:i.call(n)}),this.update(r)):this._$Ek()}catch(n){throw s=!1,this._$Ek(),n}s&&this._$AE(r)}willUpdate(e){}_$AE(e){var s;(s=this._$ES)===null||s===void 0||s.forEach(r=>{var n;return(n=r.hostUpdated)===null||n===void 0?void 0:n.call(r)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach((s,r)=>this._$EO(r,this[r],s)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}E.finalized=!0,E.elementProperties=new Map,E.elementStyles=[],E.shadowRootOptions={mode:"open"},Ee==null||Ee({ReactiveElement:E}),((Y=V.reactiveElementVersions)!==null&&Y!==void 0?Y:V.reactiveElementVersions=[]).push("1.6.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var q,J;class N extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,s;const r=super.createRenderRoot();return(e=(s=this.renderOptions).renderBefore)!==null&&e!==void 0||(s.renderBefore=r.firstChild),r}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=wt(s,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return y}}N.finalized=!0,N._$litElement$=!0,(q=globalThis.litElementHydrateSupport)===null||q===void 0||q.call(globalThis,{LitElement:N});const Ae=globalThis.litElementPolyfillSupport;Ae==null||Ae({LitElement:N});((J=globalThis.litElementVersions)!==null&&J!==void 0?J:globalThis.litElementVersions=[]).push("3.3.2");var St=globalThis&&globalThis.__esDecorate||function(t,e,s,r,n,i){function o(_){if(_!==void 0&&typeof _!="function")throw new TypeError("Function expected");return _}for(var l=r.kind,a=l==="getter"?"get":l==="setter"?"set":"value",c=!e&&t?r.static?t:t.prototype:null,h=e||(c?Object.getOwnPropertyDescriptor(c,r.name):{}),u,d=!1,p=s.length-1;p>=0;p--){var m={};for(var v in r)m[v]=v==="access"?{}:r[v];for(var v in r.access)m.access[v]=r.access[v];m.addInitializer=function(_){if(d)throw new TypeError("Cannot add initializers after decoration has completed");i.push(o(_||null))};var g=(0,s[p])(l==="accessor"?{get:h.get,set:h.set}:h[a],m);if(l==="accessor"){if(g===void 0)continue;if(g===null||typeof g!="object")throw new TypeError("Object expected");(u=o(g.get))&&(h.get=u),(u=o(g.set))&&(h.set=u),(u=o(g.init))&&n.push(u)}else(u=o(g))&&(l==="field"?n.push(u):h[a]=u)}c&&Object.defineProperty(c,r.name,h),d=!0},Ct=globalThis&&globalThis.__runInitializers||function(t,e,s){for(var r=arguments.length>2,n=0;n<e.length;n++)s=r?e[n].call(t,s):e[n].call(t);return r?s:void 0},Tt=globalThis&&globalThis.__setFunctionName||function(t,e,s){return typeof e=="symbol"&&(e=e.description?"[".concat(e.description,"]"):""),Object.defineProperty(t,"name",{configurable:!0,value:s?"".concat(s," ",e):e})};function Rt(){function t(e,s){return e}return t}let Fe=(()=>{let t=[Rt()],e,s=[],r;return r=class extends N{},Tt(r,"DeclarativeElement"),St(null,e={value:r},t,{kind:"class",name:r.name},null,s),r=e.value,Ct(r,s),r})();const Pt={capitalizeFirstLetter:!1};function Nt(t){return t.length?t[0].toUpperCase()+t.slice(1):""}function kt(t,e){return e.capitalizeFirstLetter?Nt(t):t}function Lt(t,e=Pt){const s=t.toLowerCase();if(!s.length)return"";const r=s.replace(/^-+/,"").replace(/-{2,}/g,"-").replace(/-(?:.|$)/g,n=>{const i=n[1];return i?i.toUpperCase():""});return kt(r,e)}function Se(t){return t!==t.toUpperCase()}function Ot(t){return t.split("").reduce((s,r,n,i)=>{const o=n>0?i[n-1]:"",l=n<i.length-1?i[n+1]:"",a=Se(o)||Se(l);return r===r.toLowerCase()||n===0||!a?s+=r:s+=`-${r.toLowerCase()}`,s},"").toLowerCase()}const xt=["january","february","march","april","may","june","july","august","september","october","november","december"];xt.map(t=>t.slice(0,3));function Mt(t){return t?t instanceof Error?t.message:String(t):""}function Ht(t){return t instanceof Error?t:new Error(Mt(t))}const Dt=[(t,e)=>e in t,(t,e)=>e in t.constructor.prototype];function W(t,e){return t?Dt.some(s=>{try{return s(t,e)}catch{return!1}}):!1}function Ut(t,e){return t&&e.every(s=>W(t,s))}function b(t){let e;try{e=Reflect.ownKeys(t)}catch{}return e??[...Object.keys(t),...Object.getOwnPropertySymbols(t)]}function zt(t){return b(t).filter(e=>isNaN(Number(e)))}function Ie(t){return zt(t).map(s=>t[s])}function jt(t,e){return Ie(e).includes(t)}function M(t,e){let s=!1;const r=b(t).reduce((n,i)=>{const o=e(i,t[i],t);return o instanceof Promise&&(s=!0),{...n,[i]:o}},{});return s?new Promise(async(n,i)=>{try{await Promise.all(b(r).map(async o=>{const l=await r[o];r[o]=l})),n(r)}catch(o){i(o)}}):r}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt=(t,e)=>e.kind==="method"&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(s){s.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){typeof e.initializer=="function"&&(this[e.key]=e.initializer.call(this))},finisher(s){s.createProperty(e.key,t)}};function Ye(t){return(e,s)=>s!==void 0?((r,n,i)=>{n.constructor.createProperty(i,r)})(t,e,s):Vt(t,e)}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Z;((Z=window.HTMLSlotElement)===null||Z===void 0?void 0:Z.prototype.assignedElements)!=null;const se=Symbol("this-is-an-element-vir-declarative-element"),le=Symbol("key for ignoring inputs not having been set yet"),Bt={[le]:!0};function Ge(t,e){const s=t.instanceState;b(e).forEach(r=>{if(s&&r in s)throw new Error(`Cannot set input '${r}' on '${t.tagName}'. '${t.tagName}' already has a state property with the same name.`);Ye()(t,r),"instanceInputs"in t?t.instanceInputs[r]=e[r]:t[r]=e[r]}),"instanceInputs"in t&&b(t.instanceInputs).forEach(r=>{r in e||(t.instanceInputs[r]=void 0)}),qe(t)}function qe(t){t.haveInputsBeenSet||(t.haveInputsBeenSet=!0)}function Je(t,e){return Wt(t,e),t.element}function Wt(t,e){if(t.type!==He.ELEMENT)throw new Error(`${e} directive can only be attached directly to an element.`);if(!t.element)throw new Error(`${e} directive found no element.`)}function Ze(t,e){return e?Ce(t,e):Ce(void 0,t)}const Ce=De(class extends ie{constructor(t){super(t),this.element=Je(t,"assign")}render(t,e){return Ft(t,this.element,e),y}});function Ft(t,e,s){Ge(e,s)}function Qe(t){const e=t.getRootNode();if(!(e instanceof ShadowRoot))return!1;const s=e.host;return s instanceof Fe?!0:Qe(s)}function Xe(t,e){return`${t}-${Ot(e)}`}function It(t,e){return e?M(e,s=>x(`--${Xe(t,String(s))}`)):{}}function Yt(t,e){return t?M(t,(s,r)=>{const n=e[s];return x(`var(${n}, ${r})`)}):{}}class Gt extends CustomEvent{get type(){return this._type}constructor(e,s){super(typeof e=="string"?e:e.type,{detail:s,bubbles:!0,composed:!0}),this._type=""}}function Ke(){return t=>{var e;return e=class extends Gt{constructor(s){super(t,s),this._type=t}},e.type=t,e}}function qt(){return Ke()}function Jt(t){return t?Object.keys(t).filter(e=>{if(typeof e!="string")throw new Error(`Expected event key of type string but got type "${typeof e}" for key ${String(e)}`);if(e==="")throw new Error("Got empty string for events key.");return!0}).reduce((e,s)=>{const r=Ke()(s);return e[s]=r,e},{}):{}}const Te="_is_element_vir_observable_property_handler_instance",Re="_is_element_vir_observable_property_handler_creator";function Zt(t){return W(t,Re)&&t[Re]===!0}function Qt(t){return W(t,Te)&&t[Te]===!0}function Pe(t,e,s){if(typeof t!="string"&&typeof t!="number"&&typeof t!="symbol")throw new Error(`Property name must be a string, got type '${typeof t}' from: '${String(t)}' for '${s.toLowerCase()}'`);if(!(t in e))throw new Error(`Property '${String(t)}' does not exist on '${s.toLowerCase()}'.`)}function Ne(t,e){const s=t;function r(i,o){return e&&Pe(o,t,t.tagName),s[o]}return new Proxy({},{get:r,set:(i,o,l)=>{e&&Pe(o,t,t.tagName);const a=t.observablePropertyHandlerMap[o];function c(h){i[o]=h,s[o]=h}return Zt(l)&&(l=l.init()),Qt(l)?(a&&l!==a?(l.addMultipleListeners(a.getAllListeners()),a.removeAllListeners()):l.addListener(!0,h=>{c(h)}),t.observablePropertyHandlerMap[o]=l):a?a.setValue(l):c(l),!0},ownKeys:i=>Reflect.ownKeys(i),getOwnPropertyDescriptor(i,o){if(o in i)return{get value(){return r(i,o)},configurable:!0,enumerable:!0}},has:(i,o)=>Reflect.has(i,o)})}function Xt(t,e){return e?M(e,s=>Xe(t,String(s))):{}}function Kt({hostClassNames:t,cssVarNames:e,cssVarValues:s}){return{hostClassSelectors:M(t,(r,n)=>x(`:host(.${n})`)),hostClassNames:M(t,(r,n)=>x(n)),cssVarNames:e,cssVarValues:s}}function es({host:t,hostClassesInit:e,hostClassNames:s,state:r,inputs:n}){e&&b(e).forEach(i=>{const o=e[i],l=s[i];typeof o=="function"&&(o({state:r,inputs:n})?t.classList.add(l):t.classList.remove(l))})}function ts(t,e){function s(n){b(n).forEach(i=>{const o=n[i];t.instanceState[i]=o})}return{dispatch:n=>t.dispatchEvent(n),updateState:s,inputs:t.instanceInputs,host:t,state:t.instanceState,events:e}}var ss=globalThis&&globalThis.__setFunctionName||function(t,e,s){return typeof e=="symbol"&&(e=e.description?"[".concat(e.description,"]"):""),Object.defineProperty(t,"name",{configurable:!0,value:s?"".concat(s," ",e):e})};function ce(t){var e;if(!t.renderCallback||typeof t.renderCallback=="string")throw new Error(`Failed to define element '${t.tagName}': renderCallback is not a function`);const s=Jt(t.events),r=Xt(t.tagName,t.hostClasses),n=It(t.tagName,t.cssVars),i=Yt(t.cssVars,n),o={...Bt,...t.options},l=typeof t.styles=="function"?t.styles(Kt({hostClassNames:r,cssVarNames:n,cssVarValues:i})):t.styles||Be``,a=t.renderCallback,c=(e=class extends Fe{createRenderParams(){return ts(this,s)}get instanceType(){throw new Error(`"instanceType" was called on ${t.tagName} as a value but it is only for types.`)}static get inputsType(){throw new Error(`"inputsType" was called on ${t.tagName} as a value but it is only for types.`)}static get stateType(){throw new Error(`"stateType" was called on ${t.tagName} as a value but it is only for types.`)}markInputsAsHavingBeenSet(){qe(this)}render(){try{Qe(this)&&!this.haveInputsBeenSet&&!o[le]&&console.warn(this,`${t.tagName} got rendered before its input object was set. This was most likely caused by forgetting to use the "${Ze.name}" directive on it. If no inputs are intended, use "${ce.name}" to define ${t.tagName}.`),this.hasRendered=!0;const h=this.createRenderParams();!this.initCalled&&t.initCallback&&(this.initCalled=!0,t.initCallback(h));const u=a(h);return es({host:h.host,hostClassesInit:t.hostClasses,hostClassNames:r,state:h.state,inputs:h.inputs}),this.lastRenderedProps={inputs:{...h.inputs},state:{...h.state}},u}catch(h){const u=Ht(h);throw u.message=`Failed to render '${t.tagName}': ${u.message}`,u}}connectedCallback(){if(super.connectedCallback(),this.hasRendered&&!this.initCalled&&t.initCallback){this.initCalled=!0;const h=this.createRenderParams();t.initCallback(h)}}disconnectedCallback(){if(super.disconnectedCallback(),t.cleanupCallback){const h=this.createRenderParams();t.cleanupCallback(h)}this.initCalled=!1}assignInputs(h){Ge(this,h)}constructor(){super(),this.initCalled=!1,this.hasRendered=!1,this.lastRenderedProps=void 0,this.haveInputsBeenSet=!1,this.definition={},this.observablePropertyHandlerMap={},this.instanceInputs=Ne(this,!1),this.instanceState=Ne(this,!0);const h=t.stateInit||{};b(h).forEach(u=>{Ye()(this,u),this.instanceState[u]=h[u]}),this.definition=c}},ss(e,"anonymousClass"),e.tagName=t.tagName,e.styles=l,e.isStrictInstance=()=>!1,e.events=s,e.renderCallback=a,e.hostClasses=r,e.cssVarNames=n,e.stateInit=t.stateInit,e.cssVarValues=n,e);return Object.defineProperties(c,{[se]:{value:!0,writable:!1},name:{value:Lt(t.tagName,{capitalizeFirstLetter:!0}),writable:!0},isStrictInstance:{value:h=>h instanceof c,writable:!1}}),window.customElements.get(t.tagName)?console.warn(`Tried to define custom element '${t.tagName}' but it is already defined.`):window.customElements.define(t.tagName,c),c}function rs(){return t=>ce({...t,options:{[le]:!1},...t.options})}function ns(t,e){return is(t,e)}const is=De(class extends ie{constructor(t){super(t),this.element=Je(t,"listen")}resetListener(t){this.lastListenerMetaData&&this.element.removeEventListener(this.lastListenerMetaData.eventType,this.lastListenerMetaData.listener),this.element.addEventListener(t.eventType,t.listener),this.lastListenerMetaData=t}createListenerMetaData(t,e){return{eventType:t,callback:e,listener:s=>{var r;return(r=this.lastListenerMetaData)==null?void 0:r.callback(s)}}}render(t,e){const s=typeof t=="string"?t:t.type;if(typeof s!="string")throw new Error(`Cannot listen to an event with a name that is not a string. Given event name: "${s}"`);return this.lastListenerMetaData&&this.lastListenerMetaData.eventType===s?this.lastListenerMetaData.callback=e:this.resetListener(this.createListenerMetaData(s,e)),y}});globalThis&&globalThis.__classPrivateFieldGet;globalThis&&globalThis.__classPrivateFieldSet;function os(t,e){return t.filter((s,r)=>!e.includes(r))}function et(t){return t.filter(e=>Ut(e,["tagName",se])&&!!e.tagName&&!!e[se])}const tt=new WeakMap;function as(t,e){var n;const s=et(e);return(n=st(tt,[t,...s]).value)==null?void 0:n.template}function ls(t,e,s){const r=et(e);return nt(tt,[t,...r],s)}function st(t,e,s=0){const{currentTemplateAndNested:r,reason:n}=rt(t,e,s);return r?s===e.length-1?{value:r,reason:"reached end of keys array"}:r.nested?st(r.nested,e,s+1):{value:void 0,reason:`map at key index ${s} did not have nested maps`}:{value:r,reason:n}}function rt(t,e,s){const r=e[s];if(r==null)return{currentKey:void 0,currentTemplateAndNested:void 0,reason:`key at index ${s} not found`};if(!t.has(r))return{currentKey:r,currentTemplateAndNested:void 0,reason:`key at index ${s} was not in the map`};const n=t.get(r);return n==null?{currentKey:r,currentTemplateAndNested:void 0,reason:`value at key at index ${s} was undefined`}:{currentKey:r,currentTemplateAndNested:n,reason:"key and value exists"}}function nt(t,e,s,r=0){const{currentTemplateAndNested:n,currentKey:i,reason:o}=rt(t,e,r);if(!i)return{result:!1,reason:o};const l=n??{nested:void 0,template:void 0};if(n||t.set(i,l),r===e.length-1)return l.template=s,{result:!0,reason:"set value at end of keys array"};const a=l.nested??new WeakMap;return l.nested||(l.nested=a),nt(a,e,s,r+1)}function it(t,e,s){return{name:t,check:e,transform:s}}const cs=new WeakMap;function ot(t,e,s){const r=as(t,e),n=r??s();if(!r){const o=ls(t,e,n);if(o.result)cs.set(t,n);else throw new Error(`Failed to set template transform: ${o.reason}`)}const i=os(e,n.valueIndexDeletions);return{strings:n.templateStrings,values:i}}function at(t,e,s,r){const n=[],i=[],o=[];return t.forEach((a,c)=>{var g;const h=n.length-1,u=n[h],d=c-1,p=e[d];let m;r&&r(a),typeof u=="string"&&(m=(g=s.find(_=>_.check(u,a,p)))==null?void 0:g.transform,m&&(n[h]=u+m(p)+a,o.push(d))),m||n.push(a);const v=t.raw[c];m?i[h]=i[h]+m(p)+v:i.push(v)}),{templateStrings:Object.assign([],n,{raw:i}),valueIndexDeletions:o}}function lt(t){return W(t,"tagName")&&typeof t.tagName=="string"&&t.tagName.includes("-")}const hs=[it("tag name css selector interpolation",(t,e,s)=>lt(s),t=>t.tagName)];function us(t,e){return at(t,e,hs)}function ds(t,...e){const s=ot(t,e,()=>us(t,e));return Be(s.strings,...s.values)}const fs=[it("tag name interpolation",(t,e,s)=>{const r=t.trim().endsWith("<")&&!!e.match(/^[\s\n>]/)||(t==null?void 0:t.trim().endsWith("</"))&&e.trim().startsWith(">"),n=lt(s);if(r&&!n)throw console.error({lastNewString:t,currentLitString:e,currentValue:s}),new Error(`Got interpolated tag name but it wasn't of type VirElement: '${s.prototype.constructor.name}'`);return r&&n},t=>t.tagName)];function ps(t){}function ms(t){return at(t.strings,t.values,fs,ps)}function re(t,...e){const s=pt(t,...e),r=ot(t,e,()=>ms(s));return{...s,strings:r.strings,values:r.values}}const vs=0;function gs(t){return!(t.type!=="click"||t.metaKey||t.altKey||t.ctrlKey||t.shiftKey||t.button!==vs)}function ys(t,e,s){gs(t)&&(t.preventDefault(),s.setRoutes(e))}class U extends Error{constructor(e){super(e),this.name="SpaRouterError"}}class ke extends U{constructor(e){super(e),this.name="WindowEventConsolidationError"}}const H="locationchange";globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY=!1;const $s=globalThis.history.pushState;function Le(...t){const e=$s.apply(globalThis.history,t);return globalThis.dispatchEvent(new Event(H)),e}const bs=globalThis.history.replaceState;function Oe(...t){const e=bs.apply(globalThis.history,t);return globalThis.dispatchEvent(new Event(H)),e}function _s(){if(!globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY){if(globalThis.history.pushState===Le)throw new ke("The consolidation module thinks that window events have not been consolidated yet but globalThis.history.pushState has already been overridden. Does this module have two copies in your repo?");if(globalThis.history.replaceState===Oe)throw new ke("The consolidation module thinks that window events have not been consolidated yet but globalThis.history.replaceState has already been overridden. Does this module have two copies in your repo?");globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY=!0,globalThis.history.pushState=Le,globalThis.history.replaceState=Oe,globalThis.addEventListener("popstate",()=>{globalThis.dispatchEvent(new Event(H))})}}function ct(t){return Array.from(t.entries()).reduce((e,s)=>(e[s[0]]=s[1],e),{})}function ws(t){const e=Object.entries(t).reduce((s,r)=>{const n=`${r[0]}=${r[1]}`;return`${s}&${n}`},"");return new URLSearchParams(e)}function Es(t){const s=(t?globalThis.location.pathname.replace(t,""):globalThis.location.pathname).split("/").filter(o=>!!o),n=globalThis.location.search?ct(new URLSearchParams(globalThis.location.search)):void 0,i=globalThis.location.hash||void 0;return{paths:s,search:n,hash:i}}class As extends U{constructor(e){super(e),this.name="SanitizationDepthMaxed"}}function he(t,e){if(t.paths.join(" ")!==e.paths.join(" "))return!1;if(typeof t.search=="object"&&typeof e.search=="object"){const s=Object.entries(t.search).join(" "),r=Object.entries(e.search).join(" ");if(s!==r)return!1}else if(t.search!==e.search)return!1;return t.hash===e.hash}const xe=6;function Me(t,e){const s=t.getCurrentRawRoutes();if(t.sanitizationDepth>xe)throw new As(`Route sanitization depth has exceed the max of ${xe} with ${JSON.stringify(s)}`);const r=t.sanitizeFullRoute(s);if(he(r,s))t.sanitizationDepth=0,e?e(r):t.listeners.forEach(n=>{n(r)});else return t.sanitizationDepth++,t.setRoutes(r,!0)}class Q extends U{constructor(e){super(e),this.name="InvalidRouterInitParamsError"}}function Ss(t){if("routeBase"in t&&typeof t.routeBase!="string"&&t.routeBase!=null)throw new Q(`Invalid type for router init params "routeBase" property. Expected string or undefined but got "${t.routeBase}" with type "${typeof t.routeBase}".`);if("routeSanitizer"in t&&typeof t.routeSanitizer!="function"&&t.routeSanitizer!=null)throw new Q(`Invalid type for router init params "routeSanitizer" property. Expected a function or undefined but got "${t.routeSanitizer}" with type "${typeof t.routeSanitizer}".`);if("maxListenerCount"in t&&(typeof t.maxListenerCount!="number"||isNaN(t.maxListenerCount))&&t.maxListenerCount!=null)throw new Q(`Invalid type for router init params "maxListenerCount" property. Expected a number or undefined but got "${t.maxListenerCount}" with type "${typeof t.maxListenerCount}".`)}function Cs(t,e,s,r=!1){const n=ht(t,e,s);r?globalThis.history.replaceState(void 0,"",n):globalThis.history.pushState(void 0,"",n)}function ht(t,e,s=""){var a;if(!s&&e!=null)throw new U("Route base regexp was defined but routeBase string was not provided.");const r=Ts(e)?`/${s}`:"",n=t.search?ws(t.search).toString():"",i=n?`?${n}`:"",o=(a=t.hash)!=null&&a.startsWith("#")?"":"#",l=t.hash?`${o}${t.hash}`:"";return`${r}/${t.paths.join("/")}${i}${l}`}function Ts(t){return!!(t&&globalThis.location.pathname.match(t))}function Rs(t={}){var o;Ss(t),_s();const e=(o=t.routeBase)==null?void 0:o.replace(/\/+$/,""),s=e?new RegExp(`^\\/${t.routeBase}`):void 0;let r=!1;const n=()=>Me(i),i={listeners:new Set,initParams:t,sanitizeFullRoute:l=>{const a={hash:void 0,search:void 0,...l};return t.routeSanitizer?t.routeSanitizer(a):a},setRoutes:(l,a=!1,c=!1)=>{const h=i.getCurrentRawRoutes(),u={...h,...l},d=i.sanitizeFullRoute(u);if(!(!c&&he(h,d)))return Cs(d,s,e,a)},createRoutesUrl:l=>ht(l,s,e),getCurrentRawRoutes:()=>Es(s),removeAllRouteListeners(){i.listeners.forEach(l=>i.removeRouteListener(l))},addRouteListener:(l,a)=>{if(t.maxListenerCount&&i.listeners.size>=t.maxListenerCount)throw new U(`Tried to exceed route listener max of '${t.maxListenerCount}'.`);return i.listeners.add(a),r||(globalThis.addEventListener(H,n),r=!0),l&&Me(i,a),a},hasRouteListener:l=>i.listeners.has(l),removeRouteListener:l=>{const a=i.listeners.delete(l);return i.listeners.size||(globalThis.removeEventListener(H,n),r=!1),a},sanitizationDepth:0};return i}var ue=(t=>(t.Home="home",t.Page1="page1",t.Page2="page2",t.About="about",t))(ue||{});const ne={paths:["home","main"],hash:void 0,search:void 0},Ps=Rs({routeSanitizer:t=>{var l;if(!t.paths.length)return{...t,paths:ne.paths};const e=t.paths[0];if(!jt(e,ue))return{...t,paths:ne.paths};const s=t.paths[1],r=typeof s=="string"?[e,s]:[e],n=((l=t.hash)==null?void 0:l.replace(/^#/,"").length)===3?t.hash:void 0;return{search:Object.keys(t.search||{}).every(a=>{var c,h;return a.length===3&&((h=(c=t.search)==null?void 0:c[a])==null?void 0:h.length)===3})?t.search:void 0,hash:n,paths:r}}}),Ns=globalThis.crypto;function X(t=16){const e=Math.ceil(t/2),s=new Uint8Array(e);return Ns.getRandomValues(s),Array.from(s).map(r=>r.toString(16).padStart(2,"0")).join("").substring(0,t)}function ks(t,e,s){ys(t,e,s)}const P=rs()({tagName:"vir-spa-nav",stateInit:{router:Ps,routeListener:void 0},events:{routeChange:qt()},initCallback:({state:t,dispatch:e,events:s})=>{t.router.addRouteListener(!0,r=>{e(new s.routeChange(r))})},renderCallback:({state:t,inputs:e})=>(he(e.currentRoute,t.router.getCurrentRawRoutes())||t.router.setRoutes(e.currentRoute),re`
            <nav>
                ${Ie(ue).map(s=>{const r={paths:[s]},n=t.router.createRoutesUrl(r);return re`
                        <a
                            href=${n}
                            data-route-name=${s}
                            @click=${o=>ks(o,r,t.router)}
                        >
                            ${s}
                        </a>
                    `})}

                <button
                    @click=${()=>{t.router.setRoutes({hash:X(3)})}}
                >
                    add hash
                </button>
                <button
                    @click=${()=>{t.router.setRoutes({search:ct(new URLSearchParams(`${X(3)}=${X(3)}`))})}}
                >
                    add search
                </button>
            </nav>
        `)});ce({tagName:"vir-spa-router-test-app",styles:ds`
        :host {
            display: flex;
            flex-direction: column;
            padding: 32px;
        }

        ${P} {
            margin-bottom: 16px;
        }
    `,stateInit:{currentRoute:ne},renderCallback:({state:t,updateState:e})=>re`
            <${P}
                ${Ze(P,{currentRoute:t.currentRoute})}
                ${ns(P.events.routeChange,s=>{e({currentRoute:s.detail})})}
            ></${P}>
            <div>
                <span>current main route path: ${t.currentRoute.paths[0]}</span>
            </div>
        `});

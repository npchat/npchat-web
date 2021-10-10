var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var e = Symbol();
var n = new Map();
var s = class {
  constructor(t3, n5) {
    if (this._$cssResult$ = true, n5 !== e)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3;
  }
  get styleSheet() {
    let e4 = n.get(this.cssText);
    return t && e4 === void 0 && (n.set(this.cssText, e4 = new CSSStyleSheet()), e4.replaceSync(this.cssText)), e4;
  }
  toString() {
    return this.cssText;
  }
};
var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
var r = (t3, ...n5) => {
  const o5 = t3.length === 1 ? t3[0] : n5.reduce((e4, n6, s5) => e4 + ((t4) => {
    if (t4._$cssResult$ === true)
      return t4.cssText;
    if (typeof t4 == "number")
      return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n6) + t3[s5 + 1], t3[0]);
  return new s(o5, e);
};
var i = (e4, n5) => {
  t ? e4.adoptedStyleSheets = n5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n5.forEach((t3) => {
    const n6 = document.createElement("style"), s5 = window.litNonce;
    s5 !== void 0 && n6.setAttribute("nonce", s5), n6.textContent = t3.cssText, e4.appendChild(n6);
  });
};
var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const n5 of t4.cssRules)
    e4 += n5.cssText;
  return o(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window.reactiveElementPolyfillSupport;
var r2 = { toAttribute(t3, i3) {
  switch (i3) {
    case Boolean:
      t3 = t3 ? "" : null;
      break;
    case Object:
    case Array:
      t3 = t3 == null ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, i3) {
  let s5 = t3;
  switch (i3) {
    case Boolean:
      s5 = t3 !== null;
      break;
    case Number:
      s5 = t3 === null ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        s5 = JSON.parse(t3);
      } catch (t4) {
        s5 = null;
      }
  }
  return s5;
} };
var h = (t3, i3) => i3 !== t3 && (i3 == i3 || t3 == t3);
var o2 = { attribute: true, type: String, converter: r2, reflect: false, hasChanged: h };
var n2 = class extends HTMLElement {
  constructor() {
    super(), this._$Et = new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
  }
  static addInitializer(t3) {
    var i3;
    (i3 = this.l) !== null && i3 !== void 0 || (this.l = []), this.l.push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    const t3 = [];
    return this.elementProperties.forEach((i3, s5) => {
      const e4 = this._$Eh(s5, i3);
      e4 !== void 0 && (this._$Eu.set(e4, s5), t3.push(e4));
    }), t3;
  }
  static createProperty(t3, i3 = o2) {
    if (i3.state && (i3.attribute = false), this.finalize(), this.elementProperties.set(t3, i3), !i3.noAccessor && !this.prototype.hasOwnProperty(t3)) {
      const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e4 = this.getPropertyDescriptor(t3, s5, i3);
      e4 !== void 0 && Object.defineProperty(this.prototype, t3, e4);
    }
  }
  static getPropertyDescriptor(t3, i3, s5) {
    return { get() {
      return this[i3];
    }, set(e4) {
      const r4 = this[t3];
      this[i3] = e4, this.requestUpdate(t3, r4, s5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || o2;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return false;
    this.finalized = true;
    const t3 = Object.getPrototypeOf(this);
    if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = new Map(), this.hasOwnProperty("properties")) {
      const t4 = this.properties, i3 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
      for (const s5 of i3)
        this.createProperty(s5, t4[s5]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(i3) {
    const s5 = [];
    if (Array.isArray(i3)) {
      const e4 = new Set(i3.flat(1 / 0).reverse());
      for (const i4 of e4)
        s5.unshift(S(i4));
    } else
      i3 !== void 0 && s5.push(S(i3));
    return s5;
  }
  static _$Eh(t3, i3) {
    const s5 = i3.attribute;
    return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
  }
  o() {
    var t3;
    this._$Ev = new Promise((t4) => this.enableUpdating = t4), this._$AL = new Map(), this._$Ep(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
  }
  addController(t3) {
    var i3, s5;
    ((i3 = this._$Em) !== null && i3 !== void 0 ? i3 : this._$Em = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
  }
  removeController(t3) {
    var i3;
    (i3 = this._$Em) === null || i3 === void 0 || i3.splice(this._$Em.indexOf(t3) >>> 0, 1);
  }
  _$Ep() {
    this.constructor.elementProperties.forEach((t3, i3) => {
      this.hasOwnProperty(i3) && (this._$Et.set(i3, this[i3]), delete this[i3]);
    });
  }
  createRenderRoot() {
    var t3;
    const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
    return i(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t3;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostConnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    var t3;
    (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostDisconnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  attributeChangedCallback(t3, i3, s5) {
    this._$AK(t3, s5);
  }
  _$Eg(t3, i3, s5 = o2) {
    var e4, h3;
    const n5 = this.constructor._$Eh(t3, s5);
    if (n5 !== void 0 && s5.reflect === true) {
      const o5 = ((h3 = (e4 = s5.converter) === null || e4 === void 0 ? void 0 : e4.toAttribute) !== null && h3 !== void 0 ? h3 : r2.toAttribute)(i3, s5.type);
      this._$Ei = t3, o5 == null ? this.removeAttribute(n5) : this.setAttribute(n5, o5), this._$Ei = null;
    }
  }
  _$AK(t3, i3) {
    var s5, e4, h3;
    const o5 = this.constructor, n5 = o5._$Eu.get(t3);
    if (n5 !== void 0 && this._$Ei !== n5) {
      const t4 = o5.getPropertyOptions(n5), l3 = t4.converter, a2 = (h3 = (e4 = (s5 = l3) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e4 !== void 0 ? e4 : typeof l3 == "function" ? l3 : null) !== null && h3 !== void 0 ? h3 : r2.fromAttribute;
      this._$Ei = n5, this[n5] = a2(i3, t4.type), this._$Ei = null;
    }
  }
  requestUpdate(t3, i3, s5) {
    let e4 = true;
    t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || h)(this[t3], i3) ? (this._$AL.has(t3) || this._$AL.set(t3, i3), s5.reflect === true && this._$Ei !== t3 && (this._$ES === void 0 && (this._$ES = new Map()), this._$ES.set(t3, s5))) : e4 = false), !this.isUpdatePending && e4 && (this._$Ev = this._$EC());
  }
  async _$EC() {
    this.isUpdatePending = true;
    try {
      await this._$Ev;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return t3 != null && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i4) => this[i4] = t4), this._$Et = void 0);
    let i3 = false;
    const s5 = this._$AL;
    try {
      i3 = this.shouldUpdate(s5), i3 ? (this.willUpdate(s5), (t3 = this._$Em) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostUpdate) === null || i4 === void 0 ? void 0 : i4.call(t4);
      }), this.update(s5)) : this._$EU();
    } catch (t4) {
      throw i3 = false, this._$EU(), t4;
    }
    i3 && this._$AE(s5);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    var i3;
    (i3 = this._$Em) === null || i3 === void 0 || i3.forEach((t4) => {
      var i4;
      return (i4 = t4.hostUpdated) === null || i4 === void 0 ? void 0 : i4.call(t4);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EU() {
    this._$AL = new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$Ev;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$ES !== void 0 && (this._$ES.forEach((t4, i3) => this._$Eg(i3, this[i3], t4)), this._$ES = void 0), this._$EU();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
n2.finalized = true, n2.elementProperties = new Map(), n2.elementStyles = [], n2.shadowRootOptions = { mode: "open" }, e2 == null || e2({ ReactiveElement: n2 }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.0.1");

// node_modules/lit-html/lit-html.js
var t2;
var i2 = globalThis.trustedTypes;
var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var e3 = `lit$${(Math.random() + "").slice(9)}$`;
var o3 = "?" + e3;
var n3 = `<${o3}>`;
var l = document;
var h2 = (t3 = "") => l.createComment(t3);
var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
var d = Array.isArray;
var u = (t3) => {
  var i3;
  return d(t3) || typeof ((i3 = t3) === null || i3 === void 0 ? void 0 : i3[Symbol.iterator]) == "function";
};
var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v = /-->/g;
var a = />/g;
var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
var _ = /'/g;
var m = /"/g;
var g = /^(?:script|style|textarea)$/i;
var $ = (t3) => (i3, ...s5) => ({ _$litType$: t3, strings: i3, values: s5 });
var p = $(1);
var y = $(2);
var b = Symbol.for("lit-noChange");
var T = Symbol.for("lit-nothing");
var x = new WeakMap();
var w = (t3, i3, s5) => {
  var e4, o5;
  const n5 = (e4 = s5 == null ? void 0 : s5.renderBefore) !== null && e4 !== void 0 ? e4 : i3;
  let l3 = n5._$litPart$;
  if (l3 === void 0) {
    const t4 = (o5 = s5 == null ? void 0 : s5.renderBefore) !== null && o5 !== void 0 ? o5 : null;
    n5._$litPart$ = l3 = new N(i3.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
  }
  return l3._$AI(t3), l3;
};
var A = l.createTreeWalker(l, 129, null, false);
var C = (t3, i3) => {
  const o5 = t3.length - 1, l3 = [];
  let h3, r4 = i3 === 2 ? "<svg>" : "", d2 = c;
  for (let i4 = 0; i4 < o5; i4++) {
    const s5 = t3[i4];
    let o6, u3, $2 = -1, p2 = 0;
    for (; p2 < s5.length && (d2.lastIndex = p2, u3 = d2.exec(s5), u3 !== null); )
      p2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a : u3[2] !== void 0 ? (g.test(u3[2]) && (h3 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h3 != null ? h3 : c, $2 = -1) : u3[1] === void 0 ? $2 = -2 : ($2 = d2.lastIndex - u3[2].length, o6 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a ? d2 = c : (d2 = f, h3 = void 0);
    const y2 = d2 === f && t3[i4 + 1].startsWith("/>") ? " " : "";
    r4 += d2 === c ? s5 + n3 : $2 >= 0 ? (l3.push(o6), s5.slice(0, $2) + "$lit$" + s5.slice($2) + e3 + y2) : s5 + e3 + ($2 === -2 ? (l3.push(void 0), i4) : y2);
  }
  const u2 = r4 + (t3[o5] || "<?>") + (i3 === 2 ? "</svg>" : "");
  return [s3 !== void 0 ? s3.createHTML(u2) : u2, l3];
};
var P = class {
  constructor({ strings: t3, _$litType$: s5 }, n5) {
    let l3;
    this.parts = [];
    let r4 = 0, d2 = 0;
    const u2 = t3.length - 1, c2 = this.parts, [v2, a2] = C(t3, s5);
    if (this.el = P.createElement(v2, n5), A.currentNode = this.el.content, s5 === 2) {
      const t4 = this.el.content, i3 = t4.firstChild;
      i3.remove(), t4.append(...i3.childNodes);
    }
    for (; (l3 = A.nextNode()) !== null && c2.length < u2; ) {
      if (l3.nodeType === 1) {
        if (l3.hasAttributes()) {
          const t4 = [];
          for (const i3 of l3.getAttributeNames())
            if (i3.endsWith("$lit$") || i3.startsWith(e3)) {
              const s6 = a2[d2++];
              if (t4.push(i3), s6 !== void 0) {
                const t5 = l3.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i4 = /([.?@])?(.*)/.exec(s6);
                c2.push({ type: 1, index: r4, name: i4[2], strings: t5, ctor: i4[1] === "." ? M : i4[1] === "?" ? k : i4[1] === "@" ? H : S2 });
              } else
                c2.push({ type: 6, index: r4 });
            }
          for (const i3 of t4)
            l3.removeAttribute(i3);
        }
        if (g.test(l3.tagName)) {
          const t4 = l3.textContent.split(e3), s6 = t4.length - 1;
          if (s6 > 0) {
            l3.textContent = i2 ? i2.emptyScript : "";
            for (let i3 = 0; i3 < s6; i3++)
              l3.append(t4[i3], h2()), A.nextNode(), c2.push({ type: 2, index: ++r4 });
            l3.append(t4[s6], h2());
          }
        }
      } else if (l3.nodeType === 8)
        if (l3.data === o3)
          c2.push({ type: 2, index: r4 });
        else {
          let t4 = -1;
          for (; (t4 = l3.data.indexOf(e3, t4 + 1)) !== -1; )
            c2.push({ type: 7, index: r4 }), t4 += e3.length - 1;
        }
      r4++;
    }
  }
  static createElement(t3, i3) {
    const s5 = l.createElement("template");
    return s5.innerHTML = t3, s5;
  }
};
function V(t3, i3, s5 = t3, e4) {
  var o5, n5, l3, h3;
  if (i3 === b)
    return i3;
  let d2 = e4 !== void 0 ? (o5 = s5._$Cl) === null || o5 === void 0 ? void 0 : o5[e4] : s5._$Cu;
  const u2 = r3(i3) ? void 0 : i3._$litDirective$;
  return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n5 = d2 == null ? void 0 : d2._$AO) === null || n5 === void 0 || n5.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e4)), e4 !== void 0 ? ((l3 = (h3 = s5)._$Cl) !== null && l3 !== void 0 ? l3 : h3._$Cl = [])[e4] = d2 : s5._$Cu = d2), d2 !== void 0 && (i3 = V(t3, d2._$AS(t3, i3.values), d2, e4)), i3;
}
var E = class {
  constructor(t3, i3) {
    this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  p(t3) {
    var i3;
    const { el: { content: s5 }, parts: e4 } = this._$AD, o5 = ((i3 = t3 == null ? void 0 : t3.creationScope) !== null && i3 !== void 0 ? i3 : l).importNode(s5, true);
    A.currentNode = o5;
    let n5 = A.nextNode(), h3 = 0, r4 = 0, d2 = e4[0];
    for (; d2 !== void 0; ) {
      if (h3 === d2.index) {
        let i4;
        d2.type === 2 ? i4 = new N(n5, n5.nextSibling, this, t3) : d2.type === 1 ? i4 = new d2.ctor(n5, d2.name, d2.strings, this, t3) : d2.type === 6 && (i4 = new I(n5, this, t3)), this.v.push(i4), d2 = e4[++r4];
      }
      h3 !== (d2 == null ? void 0 : d2.index) && (n5 = A.nextNode(), h3++);
    }
    return o5;
  }
  m(t3) {
    let i3 = 0;
    for (const s5 of this.v)
      s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i3), i3 += s5.strings.length - 2) : s5._$AI(t3[i3])), i3++;
  }
};
var N = class {
  constructor(t3, i3, s5, e4) {
    var o5;
    this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i3, this._$AM = s5, this.options = e4, this._$Cg = (o5 = e4 == null ? void 0 : e4.isConnected) === null || o5 === void 0 || o5;
  }
  get _$AU() {
    var t3, i3;
    return (i3 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i3 !== void 0 ? i3 : this._$Cg;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i3 = this._$AM;
    return i3 !== void 0 && t3.nodeType === 11 && (t3 = i3.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i3 = this) {
    t3 = V(this, t3, i3), r3(t3) ? t3 === T || t3 == null || t3 === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.S(t3) : u(t3) ? this.M(t3) : this.$(t3);
  }
  A(t3, i3 = this._$AB) {
    return this._$AA.parentNode.insertBefore(t3, i3);
  }
  S(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.A(t3));
  }
  $(t3) {
    this._$AH !== T && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.S(l.createTextNode(t3)), this._$AH = t3;
  }
  T(t3) {
    var i3;
    const { values: s5, _$litType$: e4 } = t3, o5 = typeof e4 == "number" ? this._$AC(t3) : (e4.el === void 0 && (e4.el = P.createElement(e4.h, this.options)), e4);
    if (((i3 = this._$AH) === null || i3 === void 0 ? void 0 : i3._$AD) === o5)
      this._$AH.m(s5);
    else {
      const t4 = new E(o5, this), i4 = t4.p(this.options);
      t4.m(s5), this.S(i4), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i3 = x.get(t3.strings);
    return i3 === void 0 && x.set(t3.strings, i3 = new P(t3)), i3;
  }
  M(t3) {
    d(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s5, e4 = 0;
    for (const o5 of t3)
      e4 === i3.length ? i3.push(s5 = new N(this.A(h2()), this.A(h2()), this, this.options)) : s5 = i3[e4], s5._$AI(o5), e4++;
    e4 < i3.length && (this._$AR(s5 && s5._$AB.nextSibling, e4), i3.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, i3) {
    var s5;
    for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i3); t3 && t3 !== this._$AB; ) {
      const i4 = t3.nextSibling;
      t3.remove(), t3 = i4;
    }
  }
  setConnected(t3) {
    var i3;
    this._$AM === void 0 && (this._$Cg = t3, (i3 = this._$AP) === null || i3 === void 0 || i3.call(this, t3));
  }
};
var S2 = class {
  constructor(t3, i3, s5, e4, o5) {
    this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i3, this._$AM = e4, this.options = o5, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = T;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, i3 = this, s5, e4) {
    const o5 = this.strings;
    let n5 = false;
    if (o5 === void 0)
      t3 = V(this, t3, i3, 0), n5 = !r3(t3) || t3 !== this._$AH && t3 !== b, n5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let l3, h3;
      for (t3 = o5[0], l3 = 0; l3 < o5.length - 1; l3++)
        h3 = V(this, e5[s5 + l3], i3, l3), h3 === b && (h3 = this._$AH[l3]), n5 || (n5 = !r3(h3) || h3 !== this._$AH[l3]), h3 === T ? t3 = T : t3 !== T && (t3 += (h3 != null ? h3 : "") + o5[l3 + 1]), this._$AH[l3] = h3;
    }
    n5 && !e4 && this.k(t3);
  }
  k(t3) {
    t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
  }
};
var M = class extends S2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  k(t3) {
    this.element[this.name] = t3 === T ? void 0 : t3;
  }
};
var k = class extends S2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  k(t3) {
    t3 && t3 !== T ? this.element.setAttribute(this.name, "") : this.element.removeAttribute(this.name);
  }
};
var H = class extends S2 {
  constructor(t3, i3, s5, e4, o5) {
    super(t3, i3, s5, e4, o5), this.type = 5;
  }
  _$AI(t3, i3 = this) {
    var s5;
    if ((t3 = (s5 = V(this, t3, i3, 0)) !== null && s5 !== void 0 ? s5 : T) === b)
      return;
    const e4 = this._$AH, o5 = t3 === T && e4 !== T || t3.capture !== e4.capture || t3.once !== e4.once || t3.passive !== e4.passive, n5 = t3 !== T && (e4 === T || o5);
    o5 && this.element.removeEventListener(this.name, this, e4), n5 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var i3, s5;
    typeof this._$AH == "function" ? this._$AH.call((s5 = (i3 = this.options) === null || i3 === void 0 ? void 0 : i3.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var I = class {
  constructor(t3, i3, s5) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    V(this, t3);
  }
};
var R = window.litHtmlPolyfillSupport;
R == null || R(P, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.0.1");

// node_modules/lit-element/lit-element.js
var l2;
var o4;
var s4 = class extends n2 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
  }
  createRenderRoot() {
    var t3, e4;
    const i3 = super.createRenderRoot();
    return (t3 = (e4 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e4.renderBefore = i3.firstChild), i3;
  }
  update(t3) {
    const i3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = w(i3, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t3;
    super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
  }
  disconnectedCallback() {
    var t3;
    super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
  }
  render() {
    return b;
  }
};
s4.finalized = true, s4._$litElement$ = true, (l2 = globalThis.litElementHydrateSupport) === null || l2 === void 0 || l2.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
n4 == null || n4({ LitElement: s4 });
((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.0.1");

// src/util/base58.js
function base58() {
  const result = {};
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const ALPHABET_MAP = {};
  let i3 = 0;
  while (i3 < ALPHABET.length) {
    ALPHABET_MAP[ALPHABET.charAt(i3)] = i3;
    i3++;
  }
  result.encode = (buffer) => {
    let carry, digits, j;
    if (buffer.length === 0) {
      return "";
    }
    i3 = void 0;
    j = void 0;
    digits = [0];
    i3 = 0;
    while (i3 < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i3];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = digits[j] / 58 | 0;
        digits[j] %= 58;
        ++j;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = carry / 58 | 0;
      }
      i3++;
    }
    i3 = 0;
    while (buffer[i3] === 0 && i3 < buffer.length - 1) {
      digits.push(0);
      i3++;
    }
    return digits.reverse().map(function(digit) {
      return ALPHABET[digit];
    }).join("");
  };
  result.decode = (string) => {
    let bytes, c2, carry, j;
    if (string.length === 0) {
      return new Uint8Array(0);
    }
    i3 = void 0;
    j = void 0;
    bytes = [0];
    i3 = 0;
    while (i3 < string.length) {
      c2 = string[i3];
      if (!(c2 in ALPHABET_MAP)) {
        throw "Base58.decode received unacceptable input. Character '" + c2 + "' is not in the Base58 alphabet.";
      }
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= 58;
        j++;
      }
      bytes[0] += ALPHABET_MAP[c2];
      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 255;
        ++j;
      }
      while (carry) {
        bytes.push(carry & 255);
        carry >>= 8;
      }
      i3++;
    }
    i3 = 0;
    while (string[i3] === "1" && i3 < string.length - 1) {
      bytes.push(0);
      i3++;
    }
    return new Uint8Array(bytes.reverse());
  };
  return result;
}

// src/util/sign.js
var sigAlgorithm = {
  name: "ECDSA",
  hash: "SHA-384"
};
async function sign(privCryptoKey, bytes) {
  return crypto.subtle.sign(sigAlgorithm, privCryptoKey, bytes);
}

// src/util/auth.js
async function fetchChallenge(host, sigPubJwkHash) {
  const resp = await fetch(`https://${host}/${sigPubJwkHash}/challenge`);
  return resp.json();
}
function hasChallengeExpired(challenge) {
  if (Date.now() > challenge.exp) {
    return true;
  }
  return false;
}
async function signChallenge(privateKey, challengeText) {
  const bytes = new TextEncoder().encode(challengeText);
  const sig = new Uint8Array(await sign(privateKey, bytes));
  return base58().encode(sig);
}

// src/util/hash.js
var hashAlgorithm = "SHA-256";
async function hash(bytes) {
  return crypto.subtle.digest(hashAlgorithm, bytes);
}

// src/util/key.js
var sigKeyParams = {
  name: "ECDSA",
  namedCurve: "P-384"
};
async function genKeyPair() {
  return crypto.subtle.generateKey(sigKeyParams, true, ["sign", "verify"]);
}
async function exportKey(cryptoKey) {
  return crypto.subtle.exportKey("jwk", cryptoKey);
}
async function importKey(jwk, keyUsages) {
  return crypto.subtle.importKey("jwk", jwk, sigKeyParams, true, keyUsages);
}
function getJwkBytes(jwk) {
  const str = JSON.stringify(jwk);
  return new TextEncoder().encode(str);
}

// src/util/message.js
async function fetchMessages(host, sigPubJwk, sigPubJwkHash, challengeSig) {
  const sigPubJwkBytes = getJwkBytes(sigPubJwk);
  const sigPubJwkBase58 = base58().encode(sigPubJwkBytes);
  const resp = await fetch(`https://${host}/${sigPubJwkHash}`, {
    headers: {
      "oc-pk": sigPubJwkBase58,
      "oc-sig": challengeSig
    }
  });
  return (await resp.json()).messages;
}
function buildMessage(message, to, from) {
  return {
    m: message,
    from,
    to
  };
}
async function sendMessage(host, toSigPubJwkHash, fromSigPubJwkHash, message) {
  const resp = await fetch(`https://${host}/${toSigPubJwkHash}`, {
    method: "POST",
    body: JSON.stringify(buildMessage(message, void 0, fromSigPubJwkHash))
  });
  return resp.json();
}

// src/components/client.js
var Client = class extends s4 {
  constructor() {
    super();
    this.host = "";
    this.name = "";
    this.sharable = {};
    this.sigKeyPair = {};
    this.sigPrivJwk = {};
    this.sigPubJwk = {};
    this.sigPubJwkHash = {};
    this.challenge = {};
    this.challengeSig = {};
    this.selectedContact = {};
    this.contacts = [];
    this.messages = [];
  }
  connectedCallback() {
    super.connectedCallback();
    this.initDetails();
    this.initContacts();
    this.initKeys().then(() => this.initMessages()).then(() => this.initSharable()).then(() => console.log("init done"));
  }
  async initKeys() {
    const storedSigPrivJwk = localStorage.getItem("sigPrivJwk");
    const storedSigPubJwk = localStorage.getItem("sigPubJwk");
    const storedSigPubJwkHash = localStorage.getItem("sigPubJwkHash");
    if (!storedSigPrivJwk || !storedSigPubJwk || !storedSigPubJwkHash) {
      this.sigKeyPair = await genKeyPair();
      this.sigPrivJwk = await exportKey(this.sigKeyPair.privateKey);
      this.sigPubJwk = await exportKey(this.sigKeyPair.publicKey);
      localStorage.setItem("sigPrivJwk", JSON.stringify(this.sigPrivJwk));
      localStorage.setItem("sigPubJwk", JSON.stringify(this.sigPubJwk));
      const hashBytes = new Uint8Array(await hash(getJwkBytes(this.sigPubJwk)));
      this.sigPubJwkHash = base58().encode(hashBytes);
      localStorage.setItem("sigPubJwkHash", this.sigPubJwkHash);
    } else {
      this.sigPrivJwk = JSON.parse(storedSigPrivJwk);
      this.sigPubJwk = JSON.parse(storedSigPubJwk);
      this.sigPubJwkHash = storedSigPubJwkHash;
      this.sigKeyPair = {
        privateKey: await importKey(this.sigPrivJwk, ["sign"]),
        publicKey: await importKey(this.sigPubJwk, ["verify"])
      };
    }
    console.log("initKeys done", this.sigKeyPair, this.sigPubJwkHash);
  }
  initDetails() {
    this.name = localStorage.getItem("name");
    if (!this.name) {
      this.name = "Joey";
    }
    this.host = localStorage.getItem("host");
    if (!this.host) {
      this.host = "openchat.dr-useless.workers.dev";
    }
  }
  initSharable() {
    const sharable = {
      name: this.name,
      sigPubJwk: this.sigPubJwk,
      host: this.host
    };
    this.sharable = btoa(JSON.stringify(sharable));
    console.log("initSharable done");
  }
  initContacts() {
    const stored = localStorage.getItem("contacts");
    if (!stored) {
      this.contacts = [];
      return;
    }
    this.contacts = JSON.parse(stored);
    this.selectContact(this.contacts[0]);
  }
  async initMessages() {
    const stored = localStorage.getItem("messages");
    if (!stored) {
      this.messages = [];
    } else {
      this.messages = JSON.parse(stored);
    }
    const fetched = await fetchMessages(this.host, this.sigPubJwk, this.sigPubJwkHash, await this.getChallengeSig());
    this.messages.push(...fetched);
    localStorage.setItem("messages", JSON.stringify(this.messages));
    this.requestUpdate();
  }
  async getChallengeSig() {
    if (this.challengeSig && this.challenge.txt && !hasChallengeExpired(this.challenge)) {
      return this.challengeSig;
    }
    const stored = localStorage.getItem("challenge");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!hasChallengeExpired(parsed)) {
        this.challenge = parsed;
        this.challengeSig = await signChallenge(this.sigKeyPair.privateKey, this.challenge.txt);
        return this.challengeSig;
      }
    }
    const challenge = await fetchChallenge(this.host, this.sigPubJwkHash);
    localStorage.setItem("challenge", JSON.stringify(challenge));
    this.challenge = challenge;
    this.challengeSig = await signChallenge(this.sigKeyPair.privateKey, challenge.txt);
    return this.challengeSig;
  }
  async addContact() {
    const inputValue = this.contactInput.value;
    if (inputValue.length < 1) {
      console.log("invalid");
      return false;
    }
    const jsonString = atob(inputValue);
    let contact = {};
    try {
      contact = JSON.parse(jsonString);
    } catch (e4) {
      console.log("failed to parse json", jsonString);
      return;
    }
    if (!contact.sigPubJwk || !contact.host) {
      console.log("failed, missing sigPubJwk or host", contact);
      return;
    }
    const sigPubJwkHashBytes = new Uint8Array(await hash(getJwkBytes(contact.sigPubJwk)));
    contact.sigPubJwkHash = base58().encode(sigPubJwkHashBytes);
    this.contacts.push(contact);
    localStorage.setItem("contacts", JSON.stringify(this.contacts));
    this.contactInput.value = "";
    this.requestUpdate();
  }
  selectContact(contact) {
    this.selectedContact = contact;
    console.log("selected", this.selectedContact);
  }
  async handleSendMessage() {
    const message = this.messageInput.value;
    if (message.length < 1) {
      return;
    }
    if (!this.selectedContact.sigPubJwkHash) {
      console.log("no contact selected");
      return;
    }
    const c2 = this.selectedContact;
    const res = await sendMessage(c2.host, c2.sigPubJwkHash, this.sigPubJwkHash, message);
    console.log("post result", res);
    if (res.error) {
      console.log("error", res);
      return;
    }
    const sentMessage = buildMessage(message, c2.sigPubJwkHash);
    this.messages.push(sentMessage);
    localStorage.setItem("messages", JSON.stringify(this.messages));
    this.requestUpdate();
  }
  render() {
    let messages = this.messages;
    if (this.selectedContact.sigPubJwk) {
      messages = messages.filter((m2) => {
        return m2.from === this.selectedContact.sigPubJwkHash || m2.to === this.selectedContact.sigPubJwkHash;
      });
    }
    return p`
      <header>
        <h1>Openchat client</h1>
        <div>
          <h2>Hello, ${this.name}</h2>
          <h3 class="wrap">${this.sigPubJwkHash}</h3>
          <p class="sharable wrap">${this.sharable}</p>
        </div>
      </header>
      <div class="main">
        <div class="contacts">
          <ul class="no-list">
            ${this.contacts.map((contact) => p`<li class="contact wrap ${this.selectedContact.sigPubJwkHash === contact.sigPubJwkHash ? "selected" : ""}" @click=${() => this.selectContact(contact)}>${contact.name} [${contact.sigPubJwkHash}]</li>`)}
          </ul>
          <input id="contact-addtext" placeholder="Sharable (base64)">
          <button @click=${this.addContact}>Add</button>
        </div>
        <div class="messages">
          <div class="compose">
              <input id="message-compose" type="text"
                placeholder="Write a message to ${this.selectedContact.name ? this.selectedContact.name : this.selectedContact.sigPubJwkHash}"/>
              <button @click=${this.handleSendMessage}>Send</button>
          </div>
          <ul class="no-list">
            ${messages.map((message) => p`<li class="message wrap">${message.m}</li>`)}
          </ul>
        </div>
      </div>
      <footer>
      </footer>
    `;
  }
  get contactInput() {
    return this.renderRoot?.querySelector("#contact-addtext") ?? null;
  }
  get messageInput() {
    return this.renderRoot?.querySelector("#message-compose") ?? null;
  }
};
__publicField(Client, "properties", {
  host: {},
  sharable: {},
  name: {},
  sigKeyPair: {},
  sigPrivJwk: {},
  sigPubJwk: {},
  sigPubJwkHash: {},
  challenge: {},
  challengeSig: {},
  selectedContact: {},
  contacts: {},
  messages: {}
});
__publicField(Client, "styles", r`
    header, .main, footer {
      max-width: 600px
    }
    .main > div {
      margin: 5rem 0;
    }
    li {
      font-size: 1.2rem;
    }
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
    input {
      font-size: 1.2rem;
    }
    button {
      padding: 0.25rem;
      font-size: 1rem;
    }
    .sharable {
      background-color: #e5e5e5;
      display: block;
      padding: 0.5rem;
    }
    .wrap {
      overflow-wrap: anywhere;
    }
    .no-list{
      list-style: none;
      padding: 0
    }
    .contact {
      padding: 0.5rem;
    }
    .contact:hover, .contact.selected {
      background-color: #e5e5e5;
    }
    .message {
      padding: 0.5rem;
    }
    .message.background {
      background-color: #e5e5e5
    }
  `);

// src/index.js
window.addEventListener("DOMContentLoaded", async () => {
  customElements.define("openchat-client", Client);
});
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

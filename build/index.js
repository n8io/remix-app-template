var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __objSpread = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// <stdin>
__markAsModule(exports);
__export(exports, {
  assets: () => import_assets.default,
  entry: () => entry,
  routes: () => routes
});

// node_modules/@remix-run/dev/compiler/shims/react.ts
var React = __toModule(require("react"));

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => entry_server_default
});
var import_server = __toModule(require("react-dom/server"));
var import_remix = __toModule(require("remix"));
var handleRequest = (request, responseStatusCode, responseHeaders, remixContext) => {
  const markup = import_server.default.renderToString(/* @__PURE__ */ React.createElement(import_remix.RemixServer, {
    context: remixContext,
    url: request.url
  }));
  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: __objSpread(__objSpread({}, Object.fromEntries(responseHeaders)), {
      "Content-Type": "text/html"
    })
  });
};
var entry_server_default = handleRequest;

// route-module:/Users/n8/code/n8io/remix-app-template/app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => root_default,
  links: () => links,
  loader: () => loader
});

// app/components/App/index.tsx
var import_react_router_dom = __toModule(require("react-router-dom"));
var import_remix3 = __toModule(require("remix"));

// app/components/Document/index.tsx
var import_remix2 = __toModule(require("remix"));
var Document = ({children}) => /* @__PURE__ */ React.createElement("html", {
  lang: "en"
}, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement("meta", {
  charSet: "utf-8"
}), /* @__PURE__ */ React.createElement("link", {
  rel: "icon",
  href: "/favicon.png",
  type: "image/png"
}), /* @__PURE__ */ React.createElement(import_remix2.Meta, null), /* @__PURE__ */ React.createElement(import_remix2.Links, null)), /* @__PURE__ */ React.createElement("body", null, children, /* @__PURE__ */ React.createElement(import_remix2.Scripts, null), process.env.NODE_ENV === "development" && /* @__PURE__ */ React.createElement(import_remix2.LiveReload, null)));

// app/components/App/index.css
var App_default = "/build/_assets/index-I5E7NNPL.css";

// app/components/App/index.tsx
var links = () => [{rel: "stylesheet", href: App_default}];
var loader = async () => ({date: new Date()});
var App = () => {
  const data = (0, import_remix3.useRouteData)();
  return /* @__PURE__ */ React.createElement(Document, null, /* @__PURE__ */ React.createElement(import_react_router_dom.Outlet, null), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement("p", null, "This page was rendered at ", data.date.toLocaleString())));
};

// route-module:/Users/n8/code/n8io/remix-app-template/app/root.tsx
var root_default = App;

// route-module:/Users/n8/code/n8io/remix-app-template/app/routes/404.tsx
var __exports = {};
__export(__exports, {
  default: () => __default,
  meta: () => meta
});

// app/modules/NotFound/index.tsx
var meta = () => ({title: "Ain't nothing here"});
var NotFound = () => /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "404"));

// route-module:/Users/n8/code/n8io/remix-app-template/app/routes/404.tsx
var __default = NotFound;

// route-module:/Users/n8/code/n8io/remix-app-template/app/routes/index.tsx
var routes_exports = {};
__export(routes_exports, {
  default: () => routes_default,
  links: () => links2,
  loader: () => loader2,
  meta: () => meta2
});

// app/modules/Root/index.tsx
var import_remix4 = __toModule(require("remix"));

// app/modules/Root/index.css
var Root_default = "/build/_assets/index-55DNWN2R.css";

// app/modules/Root/index.tsx
var links2 = () => [{rel: "stylesheet", href: Root_default}];
var loader2 = async () => ({message: "this is awesome \u{1F60E}"});
var meta2 = () => ({
  title: "Remix Starter",
  description: "Welcome to remix!"
});
var Root = () => {
  const data = (0, import_remix4.useRouteData)();
  return /* @__PURE__ */ React.createElement("div", {
    style: {textAlign: "center", padding: 20}
  }, /* @__PURE__ */ React.createElement("h2", null, "Welcome to Remix!"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://remix.run/dashboard/docs"
  }, "Check out the docs"), " to get started."), /* @__PURE__ */ React.createElement("p", null, "Message from the loader: ", data.message));
};

// route-module:/Users/n8/code/n8io/remix-app-template/app/routes/index.tsx
var routes_default = Root;

// <stdin>
var import_assets = __toModule(require("./assets.json"));
var entry = {module: entry_server_exports};
var routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "/",
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/404": {
    id: "routes/404",
    parentId: "root",
    path: "*",
    caseSensitive: false,
    module: __exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: "/",
    caseSensitive: false,
    module: routes_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  entry,
  routes
});

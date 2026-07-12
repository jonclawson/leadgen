// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/public",
    "/public/.DS_Store",
    "/public/.gitkeep",
    "/public/analog.svg",
    "/public/favicon.ico",
    "/public/logo.png",
    "/public/vite.svg",
    "/public/assets/_overlay-module-chunk-BFSjeJKb.js",
    "/public/assets/_slug_.page-BwjtWly6.js",
    "/public/assets/_slug_.server-Higt3U9E.js",
    "/public/assets/(home).page-BoWgOfHD.js",
    "/public/assets/(layout).page-DqZ3Y9QL.js",
    "/public/assets/a11y-ROSSyLaW.js",
    "/public/assets/article-form.component-Hamh5P8Y.js",
    "/public/assets/article.service-g4IqxDZY.js",
    "/public/assets/auth-client-D9mS15dz.js",
    "/public/assets/checkbox-D7_JZsjd.js",
    "/public/assets/dialog-BXi6Hty6.js",
    "/public/assets/dynamic-form.service-Cc0mKinC.js",
    "/public/assets/edit.page-BzNgC4iL.js",
    "/public/assets/edit.page-uue9UQgS.js",
    "/public/assets/form-builder.component-IgpMd1fY.js",
    "/public/assets/form-submission.service-KRFRCojg.js",
    "/public/assets/form.component-rIW7uIxG.js",
    "/public/assets/forms-B-XHHIzh.js",
    "/public/assets/icon-CJNIe49O.js",
    "/public/assets/index-BjKSaAyG.css",
    "/public/assets/index-CEhP96A4.js",
    "/public/assets/index-DnaAGG-m.css",
    "/public/assets/index.page-C8EMGPw4.js",
    "/public/assets/index.page-CvLiuuOQ.js",
    "/public/assets/index.page-NRQQYrBX.js",
    "/public/assets/input-tmQ2LHfC.js",
    "/public/assets/list.page-CwH34Y2O.js",
    "/public/assets/new.page-BoJg_Uo5.js",
    "/public/assets/new.page-BSeg_0GH.js",
    "/public/assets/observers-Cugi5dU_.js",
    "/public/assets/progress-spinner-DYcbksMI.js",
    "/public/assets/rxjs-interop-Cp05BaX8.js",
    "/public/assets/select-BDW3uliX.js",
    "/public/assets/signin.page-DzQyN0F_.js",
    "/public/assets/signout.page-C9D3pbSt.js",
    "/public/assets/signup.page-Co1tEbml.js",
    "/public/assets/snack-bar-M4sKFTGm.js",
    "/public/assets/subscription.page-hzBKH_TT.js",
    "/public/assets/table-Bj1ofZaA.js",
    "/public/assets/tooltip-BBRGUHlf.js",
    "/public/.well-known/appspecific/com.chrome.devtools.json"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/app/.wrangler/tmp/pages-EpJCjk/bundledWorker-0.9833899704187361.mjs";
import { isRoutingRuleMatch } from "/app/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/app/.wrangler/tmp/pages-EpJCjk/bundledWorker-0.9833899704187361.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=n0olxmt8xko.js.map

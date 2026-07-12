import{c as t}from"../nitro/nitro.mjs";import{g as s}from"./index.mjs";const requireAuth=async a=>{const e=a.headers,o=await s(),r=await o.api.getSession({headers:e});if(!r)throw t({statusCode:401,statusMessage:"Unauthorized"});return a.context.auth=r,r};export{requireAuth as r};
//# sourceMappingURL=require-auth.mjs.map

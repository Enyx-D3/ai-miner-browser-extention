import fs from "node:fs";
const adapter=fs.readFileSync("provider_adapters.js","utf8");
const capture=fs.readFileSync("capture.js","utf8");
const manifest=JSON.parse(fs.readFileSync("manifest.json","utf8"));
for(const provider of ["chatgpt","claude","gemini"])if(!adapter.includes(`${provider}:`))throw new Error(`Missing adapter ${provider}`);
if(!capture.includes("Brain2ProviderAdapters"))throw new Error("capture.js is not routed through provider adapter contract");
const scripts=manifest.content_scripts?.[0]?.js??[];
if(scripts[0]!=="provider_adapters.js"||!scripts.includes("capture.js"))throw new Error("provider adapter must load before capture.js");
console.log("Global Context provider adapter contract PASS");

import fs from 'fs';

let functionsApi = fs.readFileSync('src/modules/page-builder/api/functionsApi.ts', 'utf8');
if (!functionsApi.includes('usageMetadata?: any;')) {
  functionsApi = functionsApi.replace(/export interface ApiResponse<T = any> \{/, "export interface ApiResponse<T = any> {\n  usageMetadata?: any;");
  functionsApi = functionsApi.replace(/return \{\n\s*success: true,\n\s*data: parsed,/g, "return {\n            success: true,\n            data: parsed,\n            usageMetadata: result.usageMetadata,");
  functionsApi = functionsApi.replace(/return \{\n\s*success: true,\n\s*data: cleaned as any,/g, "return {\n          success: true,\n          data: cleaned as any,\n          usageMetadata: result.usageMetadata,");
  fs.writeFileSync('src/modules/page-builder/api/functionsApi.ts', functionsApi);
}

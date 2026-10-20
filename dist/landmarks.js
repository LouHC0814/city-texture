(()=>{var Pd=Object.create;var Qh=Object.defineProperty;var Ld=Object.getOwnPropertyDescriptor;var Nd=Object.getOwnPropertyNames;var Dd=Object.getPrototypeOf,Od=Object.prototype.hasOwnProperty;var eu=(i,e)=>()=>{try{return e||i((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Ud=(i,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Nd(e))!Od.call(i,s)&&s!==t&&Qh(i,s,{get:()=>e[s],enumerable:!(n=Ld(e,s))||n.enumerable});return i};var Fd=(i,e,t)=>(t=i!=null?Pd(Dd(i)):{},Ud(e||!i||!i.__esModule?Qh(t,"default",{value:i,enumerable:!0}):t,i));var ud=eu((hd,Ll)=>{(function(i,e){typeof Ll=="object"&&Ll.exports?Ll.exports=e():i.GLTFAdmission=e()})(typeof globalThis<"u"?globalThis:hd,function(){"use strict";var i={container:"GLB 2.0（magic=glTF, version=2，且总长度字段必须等于实际字节数）",selfContained:"buffer 只能取 GLB 内嵌 BIN chunk；image 只能内嵌 bufferView 或 data: URI",geometry:"静态三角网格；POSITION 必须 float32 VEC3；indices 必须 SCALAR 5121/5123/5125",allowedExtensions:[],rejectedExtensions:["KHR_draco_mesh_compression","KHR_mesh_quantization","EXT_meshopt_compression","KHR_materials_unlit","KHR_materials_specular","KHR_materials_ior","KHR_materials_emissive_strength","KHR_materials_volume","KHR_materials_transmission","KHR_materials_sheen","KHR_materials_clearcoat","KHR_materials_iridescence","KHR_materials_pbrSpecularGlossiness","EXT_texture_webp","EXT_texture_avif","KHR_texture_basisu","KHR_texture_transform"],rejectedFeatures:["skins","animations","morphTargets","sparse accessor","data: URI buffer"],limits:{fileBytes:67108864,jsonChunkBytes:8388608,nodeDepth:32,nodeCount:1048576,accessorCount:1048576,bufferViewCount:65536,meshCount:65536,primitiveCount:1048576,sceneCount:65536,textureCount:65536,imageBytes:16777216,textureDimension:8192,vertexCount:16777216,indexCount:16777216}},e=i.limits,t={ERROR:"error",UNSUPPORTED:"unsupported",WARNING:"warning",INFO:"info"},n={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},r={MAT2:2,MAT3:3,MAT4:4},a=Object.keys(s),o=[5121,5123,5125];function l(M,C,b,z){return{code:M,severity:C,message:b,target:z||null}}function c(M,C){var b=n[M],z=s[C];if(!b||!z)return 0;if(C.indexOf("MAT")===0&&b<4){var B=r[C],H=Math.ceil(b*B/4)*4;return B*H}return b*z}function h(M){return typeof M=="number"&&isFinite(M)}function u(M){return typeof M=="number"&&isFinite(M)&&Math.floor(M)===M&&M>=0}function f(M){return u(M)&&M>0}function d(M){return M!=null&&typeof M=="object"&&!Array.isArray(M)}function x(M,C){if(!Array.isArray(M)||M.length!==C)return!1;for(var b=0;b<C;b++)if(!h(M[b]))return!1;return!0}var v=["baseColorTexture","metallicRoughnessTexture","normalTexture","occlusionTexture","emissiveTexture"];function m(M,C,b,z,B){if(M!=null){var H="material/"+b+"/"+C;if(!d(M)){B.push(l("E_TEXINFO_BAD_SHAPE",t.ERROR,"material "+b+" "+C+" 必须是对象，实际是 "+(Array.isArray(M)?"array":typeof M),H));return}u(M.index)?M.index>=z&&B.push(l("E_TEXINFO_OUT_OF_RANGE",t.ERROR,"material "+b+" "+C+".index="+M.index+" 越界：textures 只有 "+z+" 项",H)):B.push(l("E_TEXINFO_BAD_INDEX",t.ERROR,"material "+b+" "+C+".index="+JSON.stringify(M.index)+" 必须是非负整数",H)),M.texCoord!=null&&(!u(M.texCoord)||M.texCoord>15)&&B.push(l("E_TEXINFO_BAD_TEXCOORD",t.ERROR,"material "+b+" "+C+".texCoord="+JSON.stringify(M.texCoord)+" 必须是 0..15 的整数",H))}}function p(M){var C=[],b=M.length;if(b<12)return C.push(l("E_FILE_TOO_SMALL",t.ERROR,"文件长度 "+b+" < 12 字节","file")),{ok:!1,status:"error",issues:C};if(b>e.fileBytes)return C.push(l("E_FILE_TOO_LARGE",t.ERROR,"文件 "+b+" 字节超过 "+e.fileBytes+" 上限","file")),{ok:!1,status:"error",issues:C};var z=String.fromCharCode(M[0],M[1],M[2],M[3]);if(z!=="glTF")return C.push(l("E_BAD_MAGIC",t.ERROR,"magic 错误："+JSON.stringify(z)+"，应为 glTF","header")),{ok:!1,status:"error",issues:C};var B=new DataView(M.buffer,M.byteOffset,M.byteLength),H=B.getUint32(4,!0);if(H!==2)return C.push(l("E_UNSUPPORTED_VERSION",t.ERROR,"版本 "+H+" 不支持，仅支持 2","header")),{ok:!1,status:"error",issues:C};var Z=B.getUint32(8,!0);if(Z!==b)return C.push(l("E_LENGTH_MISMATCH",t.ERROR,"总长度字段 "+Z+" 与实际 "+b+" 不一致","header")),{ok:!1,status:"error",issues:C};if(b<20)return C.push(l("E_TRUNCATED",t.ERROR,"缺少 JSON chunk 头","chunk0")),{ok:!1,status:"error",issues:C};var X=B.getUint32(12,!0);if(X>e.jsonChunkBytes)return C.push(l("E_JSON_CHUNK_TOO_LARGE",t.ERROR,"JSON chunk "+X+" 超过 "+e.jsonChunkBytes+" 上限","chunk0")),{ok:!1,status:"error",issues:C};var oe=String.fromCharCode(M[16],M[17],M[18],M[19]);if(oe!=="JSON")return C.push(l("E_BAD_CHUNK",t.ERROR,"第一个 chunk 类型 "+JSON.stringify(oe)+"，应为 JSON","chunk0")),{ok:!1,status:"error",issues:C};var ae=20+X;if(ae>b)return C.push(l("E_TRUNCATED",t.ERROR,"JSON chunk 长度 "+X+" 越界（实际剩余 "+(b-20)+" 字节）","chunk0")),{ok:!1,status:"error",issues:C};var Ue;try{Ue=new TextDecoder("utf-8").decode(M.subarray(20,ae))}catch(Ce){return C.push(l("E_BAD_JSON",t.ERROR,"JSON chunk 不是合法 UTF-8："+(Ce&&Ce.message),"chunk0")),{ok:!1,status:"error",issues:C}}Ue.charCodeAt(0)===65279&&(Ue=Ue.slice(1));var we;try{we=JSON.parse(Ue)}catch(Ce){return C.push(l("E_BAD_JSON",t.ERROR,"JSON 解析失败："+(Ce&&Ce.message),"chunk0")),{ok:!1,status:"error",issues:C}}if(!d(we))return C.push(l("E_JSON_NOT_OBJECT",t.ERROR,"JSON 顶层必须是对象，实际是 "+(we===null?"null":Array.isArray(we)?"array":typeof we),"chunk0")),{ok:!1,status:"error",issues:C};var Te=ae,K=0,j=0,le=!1;if(Te+8<=b){var me=B.getUint32(Te,!0),se=String.fromCharCode(M[Te+4],M[Te+5],M[Te+6],M[Te+7]);if(se!=="BIN\0")return C.push(l("E_BAD_CHUNK",t.ERROR,"第二个 chunk 类型 "+JSON.stringify(se)+"，应为 BIN\\0","chunk1")),{ok:!1,status:"error",issues:C};if(Te+8+me>b)return C.push(l("E_TRUNCATED",t.ERROR,"BIN chunk 长度 "+me+" 越界（实际剩余 "+(b-Te-8)+" 字节）","chunk1")),{ok:!1,status:"error",issues:C};j=Te+8,K=me,le=!0}else if(Te!==b)return C.push(l("E_TRUNCATED",t.ERROR,"JSON chunk 之后有残留字节但不足 chunk 头","chunk1")),{ok:!1,status:"error",issues:C};return{ok:!0,status:"pass",issues:C,json:we,byteLength:b,binOffset:j,binLength:K,binPresent:le,jsonChunkBytes:X,binChunkBytes:K,container:{magicOk:!0,version:2,jsonChunkBytes:X,binChunkBytes:K,binPresent:le,externalReferences:[]}}}function R(M,C){var b=[],z=e;d(M.asset)?M.asset.version!=="2.0"&&b.push(l("E_UNSUPPORTED_VERSION",t.ERROR,"asset.version="+JSON.stringify(M.asset.version)+' 不支持，仅支持 "2.0"',"asset")):b.push(l("E_ASSET_MISSING",t.ERROR,"缺少 asset 对象","asset"));for(var B=["buffers","bufferViews","accessors","meshes","nodes","scenes","materials","textures","images","samplers","skins","animations"],H=0;H<B.length;H++){var Z=B[H];M[Z]!=null&&!Array.isArray(M[Z])&&b.push(l("E_BAD_SHAPE",t.ERROR,Z+" 必须是数组，实际是 "+typeof M[Z],Z))}function X(On){return Array.isArray(M[On])?M[On]:[]}function oe(On){return X(On).length}var ae={accessors:z.accessorCount,nodes:z.nodeCount,bufferViews:z.bufferViewCount,meshes:z.meshCount,scenes:z.sceneCount,textures:z.textureCount},Ue=!1;for(var we in ae)oe(we)>ae[we]&&(b.push(l("E_TOO_MANY",t.ERROR,we+" 数量 "+oe(we)+" 超过上限 "+ae[we],we)),Ue=!0);if(Ue)return L(M,b,null,null,null);var Te=X("buffers"),K=X("bufferViews"),j=X("accessors"),le=X("meshes"),me=X("nodes"),se=X("scenes"),Ce=X("materials"),rt=X("textures"),De=X("images"),ze=X("samplers");if(Te.length===0)b.push(l("E_NO_BUFFER",t.ERROR,"缺少 buffers，GLB 必须至少有 buffer 0 指向 BIN chunk","buffers"));else if(Te.length>1)b.push(l("E_TOO_MANY_BUFFERS",t.UNSUPPORTED,"buffer 数量 "+Te.length+" > 1，首版仅支持单一 BIN chunk","buffers"));else{var Xe=Te[0];d(Xe)?typeof Xe.uri=="string"?Xe.uri.slice(0,5)==="data:"?b.push(l("E_BUFFER_DATA_URI_UNSUPPORTED",t.UNSUPPORTED,"buffer 0 使用 data: URI，首版只支持 GLB 内嵌 BIN chunk（无法核验容量）","buffer/0")):b.push(l("E_NOT_SELF_CONTAINED",t.ERROR,"buffer 0 引用外部 URI："+N(Xe.uri,80),"buffer/0")):f(Xe.byteLength)?Xe.byteLength>C&&b.push(l("E_BIN_TOO_SHORT",t.ERROR,"buffer 0 声明 byteLength="+Xe.byteLength+"，但 BIN chunk 只有 "+C+" 字节","buffer/0")):b.push(l("E_BUFFER_BAD_LENGTH",t.ERROR,"buffer 0 byteLength="+JSON.stringify(Xe.byteLength)+" 必须是正整数","buffer/0")):b.push(l("E_BUFFER_BAD_SHAPE",t.ERROR,"buffer 0 不是对象","buffer/0"))}for(var Le=new Array(Te.length),ot=0;ot<Te.length;ot++){var gt=Te[ot];Le[ot]=d(gt)&&f(gt.byteLength)?gt.byteLength:null}Le.length===1&&Le[0]!=null&&C>Le[0]&&C-Le[0]>3&&b.push(l("W_BIN_PADDING_EXCESS",t.WARNING,"BIN chunk "+C+" 字节比 buffer 0 声明的 "+Le[0]+" 多 "+(C-Le[0])+" 字节，超过 4 字节对齐允许的 0–3 字节填充","chunk1"));for(var Tt=new Array(K.length),Ve=0;Ve<K.length;Ve++){var Ze=K[Ve];if(!d(Ze)){b.push(l("E_BV_BAD_SHAPE",t.ERROR,"bufferView "+Ve+" 不是对象","bufferView/"+Ve));continue}if(!u(Ze.buffer)||Ze.buffer>=Te.length){b.push(l("E_BAD_REFERENCE",t.ERROR,"bufferView "+Ve+".buffer="+JSON.stringify(Ze.buffer)+" 越界 [0,"+Te.length+")","bufferView/"+Ve));continue}var O=Ze.byteOffset==null?0:Ze.byteOffset;if(!u(O)){b.push(l("E_BV_BAD_OFFSET",t.ERROR,"bufferView "+Ve+" byteOffset 必须是非负整数","bufferView/"+Ve));continue}if(!f(Ze.byteLength)){b.push(l("E_BV_BAD_LENGTH",t.ERROR,"bufferView "+Ve+" byteLength="+JSON.stringify(Ze.byteLength)+" 必须是正整数","bufferView/"+Ve));continue}var vt=Le[Ze.buffer];if(vt!=null&&O+Ze.byteLength>vt){b.push(l("E_BV_EXCEEDS_BUFFER",t.ERROR,"bufferView "+Ve+" 越过所属 buffer "+Ze.buffer+" 的逻辑长度：byteOffset "+O+" + byteLength "+Ze.byteLength+" > buffer.byteLength "+vt,"bufferView/"+Ve));continue}if(O+Ze.byteLength>C){b.push(l("E_BV_OUT_OF_RANGE",t.ERROR,"bufferView "+Ve+" 越界：byteOffset "+O+" + byteLength "+Ze.byteLength+" > BIN "+C+" 字节","bufferView/"+Ve));continue}var qe=Ze.byteStride;if(qe!=null&&(!f(qe)||qe<4||qe>252||qe%4!==0)){b.push(l("E_BV_BAD_STRIDE",t.ERROR,"bufferView "+Ve+" byteStride="+JSON.stringify(qe)+" 必须是 4 的正整数倍且 ≤252","bufferView/"+Ve));continue}Tt[Ve]={offset:O,length:Ze.byteLength,stride:qe??0}}for(var w=new Array(j.length),_=0;_<j.length;_++){var D=j[_];if(!d(D)){b.push(l("E_ACC_BAD_SHAPE",t.ERROR,"accessor "+_+" 不是对象","accessor/"+_));continue}var W="accessor/"+_;if(D.sparse!=null&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"accessor "+_+" 为稀疏（sparse）格式，首版不支持",W)),!f(D.componentType)||!n[D.componentType]){b.push(l("E_ACC_BAD_CT",t.ERROR,"accessor "+_+" componentType="+JSON.stringify(D.componentType)+" 不在允许枚举内",W));continue}if(typeof D.type!="string"||a.indexOf(D.type)===-1){b.push(l("E_ACC_BAD_TYPE",t.ERROR,"accessor "+_+" type="+JSON.stringify(D.type)+" 不在允许枚举内",W));continue}if(!f(D.count)){b.push(l("E_ACC_BAD_COUNT",t.ERROR,"accessor "+_+" count="+JSON.stringify(D.count)+" 必须是正整数",W));continue}if(D.count>z.vertexCount){b.push(l("E_TOO_MANY",t.ERROR,"accessor "+_+" count="+D.count+" 超过上限 "+z.vertexCount,W));continue}if(D.min!=null&&!Array.isArray(D.min)&&b.push(l("E_ACC_BAD_MIN",t.ERROR,"accessor "+_+" min 必须是数组",W)),Array.isArray(D.min)&&D.min.some(function(On){return!h(On)})&&b.push(l("E_ACC_BAD_MIN",t.ERROR,"accessor "+_+" min 含非有限值",W)),D.max!=null&&!Array.isArray(D.max)&&b.push(l("E_ACC_BAD_MAX",t.ERROR,"accessor "+_+" max 必须是数组",W)),Array.isArray(D.max)&&D.max.some(function(On){return!h(On)})&&b.push(l("E_ACC_BAD_MAX",t.ERROR,"accessor "+_+" max 含非有限值",W)),D.bufferView==null){b.push(l("E_ACC_NO_BUFFERVIEW",t.UNSUPPORTED,"accessor "+_+" 没有 bufferView（纯零数据），首版不支持——无法核验真实数值",W));continue}if(!u(D.bufferView)||D.bufferView>=K.length){b.push(l("E_BAD_REFERENCE",t.ERROR,"accessor "+_+".bufferView="+JSON.stringify(D.bufferView)+" 越界 [0,"+K.length+")",W));continue}var J=Tt[D.bufferView];if(J){var ie=D.byteOffset==null?0:D.byteOffset;if(!u(ie)){b.push(l("E_ACC_BAD_OFFSET",t.ERROR,"accessor "+_+" byteOffset 必须是非负整数",W));continue}var he=c(D.componentType,D.type),Q=J.stride||he;if(J.stride&&J.stride<he){b.push(l("E_BV_BAD_STRIDE",t.ERROR,"bufferView "+D.bufferView+" byteStride "+J.stride+" 小于元素大小 "+he,"bufferView/"+D.bufferView));continue}var te=ie+(D.count-1)*Q+he;if(te>J.length){b.push(l("E_ACC_OUT_OF_RANGE",t.ERROR,"accessor "+_+" 数据越界：需要 "+te+" 字节，bufferView 只有 "+J.length+" 字节（byteOffset "+ie+" + (count-1)×"+Q+" + 元素 "+he+"）",W));continue}w[_]={bufferView:D.bufferView,offset:J.offset+ie,stride:Q,count:D.count,componentType:D.componentType,type:D.type,elementBytes:he,dim:s[D.type]}}}for(var ge=0,Ee=0;Ee<le.length;Ee++){var ue=le[Ee];if(!d(ue)){b.push(l("E_MESH_BAD_SHAPE",t.ERROR,"mesh "+Ee+" 不是对象","mesh/"+Ee));continue}if(!Array.isArray(ue.primitives)||ue.primitives.length===0){b.push(l("E_MESH_NO_PRIMITIVE",t.ERROR,"mesh "+Ee+" 没有 primitives 数组","mesh/"+Ee));continue}if(ge+=ue.primitives.length,ge>z.primitiveCount){b.push(l("E_TOO_MANY",t.ERROR,"primitive 总数超过上限 "+z.primitiveCount,"meshes"));break}for(var fe=0;fe<ue.primitives.length;fe++){var _e=ue.primitives[fe],ce="mesh/"+(ue.name||Ee)+"/prim/"+fe;if(!d(_e)){b.push(l("E_PRIM_BAD_SHAPE",t.ERROR,"primitive "+fe+" 不是对象",ce));continue}Array.isArray(_e.targets)&&_e.targets.length&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"mesh "+Ee+" 含 morphTargets，首版不支持",ce));var He=_e.mode==null?4:_e.mode;if((!u(He)||He>6)&&b.push(l("E_PRIM_BAD_MODE",t.ERROR,"primitive.mode="+JSON.stringify(_e.mode)+" 必须是 0..6",ce)),!d(_e.attributes)){b.push(l("E_PRIM_NO_ATTRIBUTES",t.ERROR,"primitive 缺少 attributes 对象",ce));continue}for(var U=Object.keys(_e.attributes),pe=0;pe<U.length;pe++){var ee=_e.attributes[U[pe]];(!u(ee)||ee>=j.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"primitive 属性 "+U[pe]+" 引用 accessor "+JSON.stringify(ee)+" 越界",ce))}var de=_e.attributes.POSITION;if(de==null){b.push(l("E_PRIM_NO_POSITION",t.ERROR,"primitive 缺少 POSITION 属性，无法统计几何",ce));continue}if(u(de)&&de<w.length&&w[de]){var xe=w[de];(xe.componentType!==5126||xe.type!=="VEC3")&&b.push(l("E_PRIM_POSITION_NOT_FLOAT3",t.UNSUPPORTED,"POSITION 必须是 float32 VEC3，实际 componentType="+xe.componentType+" type="+xe.type+"（量化/整型顶点首版不支持）",ce))}if(_e.indices!=null){if(!u(_e.indices)||_e.indices>=j.length)b.push(l("E_BAD_REFERENCE",t.ERROR,"primitive.indices 引用 accessor "+JSON.stringify(_e.indices)+" 越界",ce));else if(w[_e.indices]){var ne=w[_e.indices];o.indexOf(ne.componentType)===-1&&b.push(l("E_PRIM_INDICES_BAD_CT",t.ERROR,"indices componentType="+ne.componentType+" 必须是 5121/5123/5125",ce)),ne.type!=="SCALAR"&&b.push(l("E_PRIM_INDICES_BAD_TYPE",t.ERROR,"indices type 必须是 SCALAR",ce)),ne.count>z.indexCount&&b.push(l("E_TOO_MANY",t.ERROR,"indices count="+ne.count+" 超过上限 "+z.indexCount,ce))}}_e.material!=null&&(!u(_e.material)||_e.material>=Ce.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"primitive.material="+JSON.stringify(_e.material)+" 越界 [0,"+Ce.length+")",ce))}}for(var ye=0;ye<me.length;ye++){var re=me[ye];if(!d(re)){b.push(l("E_NODE_BAD_SHAPE",t.ERROR,"node "+ye+" 不是对象","node/"+ye));continue}var Ke="node/"+ye;if(re.matrix!=null&&(!Array.isArray(re.matrix)||re.matrix.length!==16?b.push(l("E_NODE_BAD_MATRIX",t.ERROR,"node "+ye+" matrix 必须是 16 个数的数组，实际长度 "+(Array.isArray(re.matrix)?re.matrix.length:typeof re.matrix),Ke)):re.matrix.some(function(On){return!h(On)})&&b.push(l("E_NODE_BAD_MATRIX",t.ERROR,"node "+ye+" matrix 含非有限值",Ke)),(re.translation!=null||re.rotation!=null||re.scale!=null)&&b.push(l("E_NODE_TRS_WITH_MATRIX",t.ERROR,"node "+ye+" 同时给了 matrix 与 TRS，非法",Ke))),re.translation!=null&&!x(re.translation,3)&&b.push(l("E_NODE_BAD_TRS",t.ERROR,"node "+ye+" translation 必须是 3 个有限数，实际 "+JSON.stringify(re.translation),Ke)),re.rotation!=null&&!x(re.rotation,4)&&b.push(l("E_NODE_BAD_TRS",t.ERROR,"node "+ye+" rotation 必须是 4 个有限数，实际 "+JSON.stringify(re.rotation),Ke)),re.scale!=null&&!x(re.scale,3)&&b.push(l("E_NODE_BAD_TRS",t.ERROR,"node "+ye+" scale 必须是 3 个有限数，实际 "+JSON.stringify(re.scale),Ke)),re.children!=null)if(!Array.isArray(re.children))b.push(l("E_NODE_BAD_CHILDREN",t.ERROR,"node "+ye+" children 不是数组",Ke));else for(var Je=0;Je<re.children.length;Je++){var It=re.children[Je];(!u(It)||It>=me.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"node "+ye+".children["+Je+"]="+JSON.stringify(It)+" 越界",Ke))}re.mesh!=null&&(!u(re.mesh)||re.mesh>=le.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"node "+ye+".mesh="+JSON.stringify(re.mesh)+" 越界 [0,"+le.length+")",Ke)),re.skin!=null&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"node "+ye+" 含 skin，首版不支持",Ke)),re.weights!=null&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"node "+ye+" 含 morph weights，首版不支持",Ke))}var wt=null;if(se.length===0)b.push(l("E_NO_SCENE",t.ERROR,"缺少 scenes，无法确定要渲染什么","scenes"));else{M.scene!=null?!u(M.scene)||M.scene>=se.length?b.push(l("E_SCENE_BAD_INDEX",t.ERROR,"gltf.scene="+JSON.stringify(M.scene)+" 越界 [0,"+se.length+")","scene")):wt=M.scene:wt=0;for(var ln=0;ln<se.length;ln++){var ii=se[ln];if(!d(ii)){b.push(l("E_SCENE_BAD_SHAPE",t.ERROR,"scene "+ln+" 不是对象","scene/"+ln));continue}if(ii.nodes!=null&&!Array.isArray(ii.nodes)){b.push(l("E_SCENE_BAD_NODES",t.ERROR,"scene "+ln+" nodes 不是数组","scene/"+ln));continue}for(var Tn=ii.nodes||[],tn=0;tn<Tn.length;tn++)(!u(Tn[tn])||Tn[tn]>=me.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"scene "+ln+".nodes["+tn+"]="+JSON.stringify(Tn[tn])+" 越界","scene/"+ln))}}for(var Rt=0;Rt<De.length;Rt++){var Ut=De[Rt];if(!d(Ut)){b.push(l("E_IMAGE_BAD_SHAPE",t.ERROR,"image "+Rt+" 不是对象","image/"+Rt));continue}typeof Ut.uri=="string"?Ut.uri.slice(0,5)!=="data:"&&b.push(l("E_NOT_SELF_CONTAINED",t.ERROR,"image "+Rt+" 引用外部 URI："+N(Ut.uri,80),"image/"+Rt)):Ut.bufferView!=null?!u(Ut.bufferView)||Ut.bufferView>=K.length?b.push(l("E_BAD_REFERENCE",t.ERROR,"image "+Rt+".bufferView="+JSON.stringify(Ut.bufferView)+" 越界","image/"+Rt)):Tt[Ut.bufferView]&&Tt[Ut.bufferView].length>z.imageBytes&&b.push(l("E_TOO_MANY",t.ERROR,"image "+Rt+" 字节数 "+Tt[Ut.bufferView].length+" 超过上限 "+z.imageBytes,"image/"+Rt)):b.push(l("E_IMAGE_NO_SOURCE",t.ERROR,"image "+Rt+" 既没有 uri 也没有 bufferView","image/"+Rt)),typeof Ut.mimeType=="string"&&["image/png","image/jpeg"].indexOf(Ut.mimeType)===-1&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"image "+Rt+" mimeType="+Ut.mimeType+" 首版仅支持 png/jpeg","image/"+Rt))}for(var St=0;St<Ce.length;St++){var at=Ce[St];if(!d(at)){b.push(l("E_MATERIAL_BAD_SHAPE",t.ERROR,"material "+St+" 不是对象","material/"+St));continue}var Ft="material/"+St;if(at.pbrMetallicRoughness!=null)if(!d(at.pbrMetallicRoughness))b.push(l("E_MATERIAL_BAD_SHAPE",t.ERROR,"material "+St+" pbrMetallicRoughness 必须是对象",Ft));else{var An=at.pbrMetallicRoughness;m(An.baseColorTexture,"baseColorTexture",St,rt.length,b),m(An.metallicRoughnessTexture,"metallicRoughnessTexture",St,rt.length,b),An.baseColorFactor!=null&&!x(An.baseColorFactor,4)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" baseColorFactor 必须是 4 个有限数",Ft)),An.metallicFactor!=null&&!h(An.metallicFactor)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" metallicFactor 必须是有限数",Ft)),An.roughnessFactor!=null&&!h(An.roughnessFactor)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" roughnessFactor 必须是有限数",Ft))}m(at.normalTexture,"normalTexture",St,rt.length,b),m(at.occlusionTexture,"occlusionTexture",St,rt.length,b),m(at.emissiveTexture,"emissiveTexture",St,rt.length,b),at.normalTexture!=null&&d(at.normalTexture)&&at.normalTexture.scale!=null&&!h(at.normalTexture.scale)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" normalTexture.scale 必须是有限数",Ft)),at.occlusionTexture!=null&&d(at.occlusionTexture)&&at.occlusionTexture.strength!=null&&!h(at.occlusionTexture.strength)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" occlusionTexture.strength 必须是有限数",Ft)),at.emissiveFactor!=null&&!x(at.emissiveFactor,3)&&b.push(l("E_MATERIAL_BAD_FACTOR",t.ERROR,"material "+St+" emissiveFactor 必须是 3 个有限数",Ft)),at.alphaMode!=null&&["OPAQUE","MASK","BLEND"].indexOf(at.alphaMode)===-1&&b.push(l("E_MATERIAL_BAD_ALPHA_MODE",t.ERROR,"material "+St+" alphaMode="+JSON.stringify(at.alphaMode)+" 不在 OPAQUE/MASK/BLEND 内",Ft))}for(var mn=0;mn<rt.length;mn++){var Vt=rt[mn];if(!d(Vt)){b.push(l("E_TEXTURE_BAD_SHAPE",t.ERROR,"texture "+mn+" 不是对象","texture/"+mn));continue}Vt.source!=null&&(!u(Vt.source)||Vt.source>=De.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"texture "+mn+".source="+JSON.stringify(Vt.source)+" 越界 [0,"+De.length+")","texture/"+mn)),Vt.sampler!=null&&(!u(Vt.sampler)||Vt.sampler>=ze.length)&&b.push(l("E_BAD_REFERENCE",t.ERROR,"texture "+mn+".sampler="+JSON.stringify(Vt.sampler)+" 越界 [0,"+ze.length+")","texture/"+mn))}X("skins").length&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"含 skins ("+X("skins").length+")，首版不支持","skins")),X("animations").length&&b.push(l("E_UNSUPPORTED_FEATURE",t.UNSUPPORTED,"含 animations ("+X("animations").length+")，首版不支持","animations"));var gn=Array.isArray(M.extensionsUsed)?M.extensionsUsed:[],cn=Array.isArray(M.extensionsRequired)?M.extensionsRequired:[];M.extensionsUsed!=null&&!Array.isArray(M.extensionsUsed)&&b.push(l("E_BAD_SHAPE",t.ERROR,"extensionsUsed 必须是字符串数组","extensionsUsed")),M.extensionsRequired!=null&&!Array.isArray(M.extensionsRequired)&&b.push(l("E_BAD_SHAPE",t.ERROR,"extensionsRequired 必须是字符串数组","extensionsRequired"));for(var _n=0;_n<cn.length;_n++)i.allowedExtensions.indexOf(cn[_n])===-1&&b.push(l("E_UNSUPPORTED_EXTENSION",t.UNSUPPORTED,"必需扩展 "+cn[_n]+" 不在首版支持范围","extensionsRequired"));for(var wn=0;wn<gn.length;wn++)i.allowedExtensions.indexOf(gn[wn])===-1&&(i.rejectedExtensions.indexOf(gn[wn])!==-1?b.push(l("E_UNSUPPORTED_EXTENSION",t.UNSUPPORTED,"使用扩展 "+gn[wn]+"，首版不支持","extensionsUsed")):b.push(l("W_UNKNOWN_EXTENSION",t.WARNING,"使用扩展 "+gn[wn]+"，未做专项处理（若影响几何则结果不可信）","extensionsUsed")));var Ca=S(me,b),Vl=T(me,Ca.parentOf,b),Ia=null;return wt!=null&&se[wt]&&Array.isArray(se[wt].nodes)&&(Ia={parentOf:Ca.parentOf,nodeOrder:E(me,se[wt].nodes),defaultSceneIndex:wt}),L(M,b,{buffers:Te.length,bufferViews:K.length,accessors:j.length,meshes:le.length,primitives:ge,nodes:me.length,scenes:se.length,materials:Ce.length,textures:rt.length,images:De.length,defaultSceneIndex:wt,extensionsUsed:gn,extensionsRequired:cn},Tt,w,Ia,Vl)}function L(M,C,b,z,B,H,Z){for(var X="pass",oe=0;oe<C.length;oe++)if(C[oe].severity===t.ERROR){X="error";break}if(X==="pass"){for(var ae=0;ae<C.length;ae++)if(C[ae].severity===t.UNSUPPORTED){X="unsupported";break}}return{status:X,fatal:X!=="pass",issues:C,summary:b||null,bufferViews:z||null,accessors:B||null,parentOf:H?H.parentOf:null,nodeOrder:H?H.nodeOrder:null,defaultSceneIndex:H?H.defaultSceneIndex:b?b.defaultSceneIndex:null,worldMatrices:Z||null,support:i}}function S(M,C){var b=M.length,z=new Array(b),B;for(B=0;B<b;B++)z[B]=-1;var H=0;for(B=0;B<b;B++){var Z=M[B];if(!(!d(Z)||!Array.isArray(Z.children)))for(var X=0;X<Z.children.length;X++){var oe=Z.children[X];!u(oe)||oe>=b||oe!==B&&(z[oe]===-1?z[oe]=B:z[oe]!==B&&H<3&&(C.push(l("E_NODE_MULTI_PARENT",t.ERROR,"节点 "+oe+" 同时被父节点 "+z[oe]+" 与 "+B+" 引用（glTF 规定每个节点最多一个父）","node/"+oe)),H++))}}var ae=new Array(b);for(B=0;B<b;B++)ae[B]=0;var Ue=[],we=[],Te=0;for(B=0;B<b;B++)if(ae[B]===0){if(!d(M[B])){ae[B]=2;continue}for(ae[B]=1,Ue.push(B),we.push(0);Ue.length;){var K=Ue.length-1,j=Ue[K],le=Array.isArray(M[j].children)?M[j].children:[];if(we[K]>=le.length){ae[j]=2,Ue.pop(),we.pop();continue}var me=le[we[K]++];if(!(!u(me)||me>=b)){if(ae[me]===1){Te<3&&(C.push(l("E_NODE_CYCLE",t.ERROR,"节点 "+me+" 通过父节点 "+j+" 参与循环引用（全图扫描，默认场景之外也算）","node/"+me)),Te++);continue}if(ae[me]!==2){if(!d(M[me])){ae[me]=2;continue}ae[me]=1,Ue.push(me),we.push(0)}}}}var se=new Array(b);for(B=0;B<b;B++)se[B]=-1;var Ce=[];for(B=0;B<b;B++)z[B]===-1&&(se[B]=0,Ce.push(B));for(var rt=0;rt<Ce.length;rt++){var De=Ce[rt],ze=M[De];if(!(!d(ze)||!Array.isArray(ze.children)))for(var Xe=0;Xe<ze.children.length;Xe++){var Le=ze.children[Xe];!u(Le)||Le>=b||se[Le]!==-1||(se[Le]=se[De]+1,Ce.push(Le))}}var ot=0;for(B=0;B<b;B++)se[B]>e.nodeDepth&&ot<3&&(C.push(l("E_NODE_DEPTH",t.ERROR,"节点 "+B+" 层级 "+se[B]+" 超过上限 "+e.nodeDepth,"node/"+B)),ot++);return{parentOf:z,depth:se,cycleFound:Te>0,multiParentFound:H>0}}function E(M,C){for(var b=[],z=Object.create(null),B=[],H=C.length-1;H>=0;H--)B.push(C[H]);for(;B.length;){var Z=B.pop();if(!(!u(Z)||Z>=M.length||z[Z])){var X=M[Z];if(d(X)){z[Z]=1,b.push(Z);for(var oe=Array.isArray(X.children)?X.children:[],ae=oe.length-1;ae>=0;ae--){var Ue=oe[ae];u(Ue)&&Ue<M.length&&!z[Ue]&&B.push(Ue)}}}}return b}function A(M,C,b){var z=C[0],B=C[1],H=C[2],Z=C[3],X=b[0],oe=b[1],ae=b[2],Ue=z*z,we=B*B,Te=H*H,K=z*B,j=z*H,le=B*H,me=Z*z,se=Z*B,Ce=Z*H;return[(1-2*(we+Te))*X,2*(K+Ce)*X,2*(j-se)*X,0,2*(K-Ce)*oe,(1-2*(Ue+Te))*oe,2*(le+me)*oe,0,2*(j+se)*ae,2*(le-me)*ae,(1-2*(Ue+we))*ae,0,M[0],M[1],M[2],1]}function I(M,C){for(var b=new Array(16),z=0;z<4;z++)for(var B=0;B<4;B++){for(var H=0,Z=0;Z<4;Z++)H+=M[Z*4+B]*C[z*4+Z];b[z*4+B]=H}return b}function g(M){return Array.isArray(M.matrix)&&M.matrix.length===16?M.matrix.slice():A(Array.isArray(M.translation)?M.translation:[0,0,0],Array.isArray(M.rotation)?M.rotation:[0,0,0,1],Array.isArray(M.scale)?M.scale:[1,1,1])}function T(M,C,b){for(var z=M.length,B=new Array(z),H=new Array(z),Z=0;Z<z;Z++)B[Z]=null,H[Z]=!1;for(var X=0;X<z;X++)if(!H[X]){for(var oe=[],ae=X,Ue=0;ae!=null&&ae>=0&&!H[ae]&&Ue<=z;){oe.push(ae);var we=C?C[ae]:-1;if(we===ae)break;ae=we??-1,Ue++}for(var Te=oe.length-1;Te>=0;Te--){var K=oe[Te];if(!H[K]){var j=M[K],le=d(j)?g(j):null;if(!le){B[K]=null,H[K]=!0;continue}var me=C?C[K]:-1,se=me!=null&&me>=0&&H[me]&&B[me]?I(B[me],le):le;B[K]=se,H[K]=!0}}}for(var Ce=0,rt=Object.create(null),De=0;De<z;De++){var ze=B[De];if(ze){for(var Xe=-1,Le=0;Le<16;Le++)if(!h(ze[Le])){Xe=Le;break}Xe>=0&&(B[De]=null,Ce<3&&(b.push(l("E_WORLD_MATRIX_NON_FINITE",t.ERROR,"node "+De+" 的世界矩阵第 "+Xe+" 项非有限（父子变换相乘后溢出），包围盒不可信","node/"+De)),Ce++))}}return B}function P(M,C,b,z,B,H,Z){var X=new DataView(b.buffer,b.byteOffset,b.byteLength),oe=Array.isArray(M.meshes)?M.meshes:[],ae=Array.isArray(M.nodes)?M.nodes:[],Ue=Object.create(null),we=new Array(oe.length),Te=new Array(oe.length);function K(Vt){if(Ue[Vt]!==void 0)return Ue[Vt];for(var gn=C[Vt],cn=new Float32Array(gn.count*3),_n=0;_n<gn.count;_n++){var wn=gn.offset+_n*gn.stride;cn[_n*3]=X.getFloat32(wn,!0),cn[_n*3+1]=X.getFloat32(wn+4,!0),cn[_n*3+2]=X.getFloat32(wn+8,!0)}return Ue[Vt]=cn,cn}for(var j=0;j<oe.length;j++){var le=oe[j];if(!d(le)||!Array.isArray(le.primitives)){we[j]=null,Te[j]=[];continue}for(var me=[1/0,1/0,1/0],se=[-1/0,-1/0,-1/0],Ce=!1,rt=[],De=0;De<le.primitives.length;De++){var ze=le.primitives[De];if(!(!d(ze)||!d(ze.attributes)||ze.attributes.POSITION==null)){var Xe=ze.attributes.POSITION,Le=C?C[Xe]:null;if(Le){var ot="mesh/"+(le.name||j)+"/prim/"+De;rt.push(Xe);for(var gt=K(Xe),Tt=0,Ve=0;Ve<gt.length;Ve+=3){var Ze=gt[Ve],O=gt[Ve+1],vt=gt[Ve+2];if(!h(Ze)||!h(O)||!h(vt)){Tt<3&&(Z.push(l("E_POSITION_NON_FINITE",t.ERROR,"POSITION 第 "+Ve/3+" 个顶点含 NaN/Infinity，几何与世界包围盒不可信",ot)),Tt++);continue}Ce=!0,Ze<me[0]&&(me[0]=Ze),Ze>se[0]&&(se[0]=Ze),O<me[1]&&(me[1]=O),O>se[1]&&(se[1]=O),vt<me[2]&&(me[2]=vt),vt>se[2]&&(se[2]=vt)}if(ze.indices!=null){var qe=C?C[ze.indices]:null;if(qe)for(var w=0,_=0;_<qe.count;_++){var D=qe.offset+_*qe.stride,W=qe.componentType===5121?X.getUint8(D):qe.componentType===5123?X.getUint16(D,!0):X.getUint32(D,!0);W>=Le.count&&w<3&&(Z.push(l("E_INDICES_OUT_OF_RANGE",t.ERROR,"索引 "+W+" >= POSITION.count "+Le.count+"（第 "+_+" 个索引）",ot)),w++)}}}}}we[j]=Ce?{min:me,max:se}:null,Te[j]=rt}for(var J={min:[1/0,1/0,1/0],max:[-1/0,-1/0,-1/0]},ie={min:[1/0,1/0,1/0],max:[-1/0,-1/0,-1/0]},he=!1,Q=!1,te=0,ge=Array.isArray(B)?B:[],Ee=0;Ee<ge.length;Ee++){var ue=ge[Ee],fe=ae[ue];if(!(!d(fe)||!u(fe.mesh)||fe.mesh>=oe.length)){var _e=fe.mesh,ce=H?H[ue]:null;if(ce){for(var He=Te[_e]||[],U=0;U<He.length;U++)for(var pe=K(He[U]),ee=0;ee<pe.length;ee+=3){var de=pe[ee],xe=pe[ee+1],ne=pe[ee+2];if(!(!h(de)||!h(xe)||!h(ne))){var ye=ce[0]*de+ce[4]*xe+ce[8]*ne+ce[12],re=ce[1]*de+ce[5]*xe+ce[9]*ne+ce[13],Ke=ce[2]*de+ce[6]*xe+ce[10]*ne+ce[14];if(!h(ye)||!h(re)||!h(Ke)){te<3&&(Z.push(l("E_WORLD_POSITION_NON_FINITE",t.ERROR,"node "+ue+" 的第 "+ee/3+" 个顶点经世界变换后非有限（变换放大后溢出），精确包围盒不可信","node/"+ue)),te++);continue}ye<J.min[0]&&(J.min[0]=ye),ye>J.max[0]&&(J.max[0]=ye),re<J.min[1]&&(J.min[1]=re),re>J.max[1]&&(J.max[1]=re),Ke<J.min[2]&&(J.min[2]=Ke),Ke>J.max[2]&&(J.max[2]=Ke),he=!0}}var Je=we[_e];if(Je)for(var It=0;It<8;It++){var wt=It&1?Je.max[0]:Je.min[0],ln=It&2?Je.max[1]:Je.min[1],ii=It&4?Je.max[2]:Je.min[2],Tn=ce[0]*wt+ce[4]*ln+ce[8]*ii+ce[12],tn=ce[1]*wt+ce[5]*ln+ce[9]*ii+ce[13],Rt=ce[2]*wt+ce[6]*ln+ce[10]*ii+ce[14];!h(Tn)||!h(tn)||!h(Rt)||(Tn<ie.min[0]&&(ie.min[0]=Tn),Tn>ie.max[0]&&(ie.max[0]=Tn),tn<ie.min[1]&&(ie.min[1]=tn),tn>ie.max[1]&&(ie.max[1]=tn),Rt<ie.min[2]&&(ie.min[2]=Rt),Rt>ie.max[2]&&(ie.max[2]=Rt),Q=!0)}}}}for(var Ut=[{name:"computed",value:J,present:he},{name:"conservative",value:ie,present:Q}],St=0;St<Ut.length;St++){var at=Ut[St];if(at.present)for(var Ft=0;Ft<3;Ft++){var An=at.value.max[Ft]-at.value.min[Ft],mn=(at.value.min[Ft]+at.value.max[Ft])/2;if(!h(An)||!h(mn)){Z.push(l("E_WORLD_BOUNDS_NON_FINITE",t.ERROR,at.name+" 包围盒轴 "+Ft+" 的中心或范围计算溢出，无法可靠统计或预览","bounds/"+at.name));break}}}return{computed:he?{min:J.min,max:J.max}:null,conservative:Q?{min:ie.min,max:ie.max}:null,meshLocal:we}}function N(M,C){return M=String(M),M.length<=C?M:M.slice(0,C)+"…"}function V(M){var C=p(M);if(!C.ok)return{status:C.status,fatal:!0,issues:C.issues,json:null,byteLength:M.length,binOffset:0,binLength:0,binPresent:!1,jsonChunkBytes:0,binChunkBytes:0,container:{magicOk:!1,version:null,jsonChunkBytes:0,binChunkBytes:0,binPresent:!1,externalReferences:[]},summary:null,parentOf:null,nodeOrder:null,defaultSceneIndex:null,accessors:null,bufferViews:null,worldBounds:null,support:i};var b=R(C.json,C.binLength),z=C.issues.concat(b.issues),B=b.status;if(B==="pass"){for(var H=0;H<C.issues.length;H++)if(C.issues[H].severity===t.ERROR){B="error";break}}var Z=null;if(B==="pass"&&b.accessors){var X=[];Z=P(C.json,b.accessors,M.subarray(C.binOffset,C.binOffset+C.binLength),b.parentOf,b.nodeOrder,b.worldMatrices,X),X.length&&(z=z.concat(X),B="error")}return{status:B,fatal:B!=="pass",issues:z,json:C.json,byteLength:C.byteLength,binOffset:C.binOffset,binLength:C.binLength,binPresent:C.binPresent,jsonChunkBytes:C.jsonChunkBytes,binChunkBytes:C.binChunkBytes,container:C.container,summary:b.summary,parentOf:b.parentOf,nodeOrder:b.nodeOrder,defaultSceneIndex:b.defaultSceneIndex!=null?b.defaultSceneIndex:b.summary?b.summary.defaultSceneIndex:null,accessors:b.accessors,bufferViews:b.bufferViews,worldBounds:B==="pass"?Z:null,support:i}}function G(M){return M==="pass"?"通过":M==="unsupported"?"不支持":"错误"}return{SUPPORT:i,LIMITS:e,SEV:t,elementBytes:c,parseContainer:p,admit:R,check:V,statusText:G,issue:l}})});var _d=eu((wM,gd)=>{"use strict";var ty=ud(),Dn=Object.freeze({file:8*1024*1024,total:16*1024*1024,count:3,project:24*1024*1024,images:16,dimension:4096,pixels:16*1024*1024}),Gh="city-texture-model-workspace";function ct(i){throw new Error(i)}function Sr(i,e,t){return i===void 0||i===""?e:((typeof i!="string"||i.length>t||/[\u0000-\u001f\u007f]/.test(i))&&ct("建筑资料包含超长或无效文字"),i.trim()||e)}function Wh(i={}){(!i||typeof i!="object"||Array.isArray(i))&&ct("建筑资料格式无效");let e={name:Sr(i.name,"本地建筑",80),place:Sr(i.place,"本地模型",80),author:Sr(i.author,"未声明作者",100),license:Sr(i.license,"未声明许可",100),source:Sr(i.source,"",500),note:Sr(i.note,"本地导入；模型身份、署名与许可由提供者声明，展示缩放不用于测量。",600)};if(e.source){let t;try{t=new URL(e.source)}catch{ct("来源链接必须是完整的 HTTPS 地址")}(t.protocol!=="https:"||t.username||t.password)&&ct("来源链接必须是无账号信息的 HTTPS 地址"),e.source=t.href}return e}function Xh(i,e){let t=[...i];e&&(t.some(n=>n.id===e.id)&&ct("这份模型已经在工作台中"),t.push(e)),t.length>Dn.count&&ct("最多同时加入 3 份本地模型"),t.reduce((n,s)=>n+s.bytes.byteLength,0)>Dn.total&&ct("本地模型总量不能超过 16 MiB")}async function fd(i,e){(!(i instanceof Uint8Array)||i.byteLength===0||i.byteLength>Dn.file)&&ct("请选择不超过 8 MiB 的自包含 GLB 文件");let t=i.slice(),n=ty.check(t);if(n.status!=="pass"){let h=n.issues.find(u=>u.severity==="error"||u.severity==="unsupported");ct(`模型无法加入：${h?.message||n.status}`)}let s=n.json.images||[];s.length>Dn.images&&ct("每份模型最多包含 16 张图片");let r=0;for(let h of s){let u,f=h.mimeType;if(typeof h.uri=="string"){h.bufferView!==void 0&&ct("模型图片不能同时声明两种来源");let x=/^data:(image\/(?:png|jpeg));base64,/i.exec(h.uri);x||ct("模型图片必须是内嵌 PNG/JPEG"),u=pd(h.uri.slice(x[0].length)),f&&f!==x[1].toLowerCase()&&ct("图片类型声明与实际内容不符"),f=x[1].toLowerCase()}else{let x=n.json.bufferViews[h.bufferView],v=n.binOffset+(x.byteOffset||0);u=t.subarray(v,v+x.byteLength)}let d=ny(u);f&&f!==d.mime&&ct("图片类型声明与实际内容不符"),(d.width>Dn.dimension||d.height>Dn.dimension)&&ct("单张贴图不能超过 4096 × 4096"),r+=d.width*d.height,r>Dn.pixels&&ct("单份模型贴图总像素不能超过 16 Mi 像素")}let a=n.worldBounds?.computed;(!a||!a.min.every(Number.isFinite)||!a.max.every(Number.isFinite)||!a.max.some((h,u)=>h>a.min[u]))&&ct("模型没有可观察的有限三维范围");let o=0;for(let h of n.json.meshes||[])for(let u of h.primitives){let f=n.json.accessors[u.indices??u.attributes.POSITION].count;o+=u.mode===5||u.mode===6?Math.max(0,f-2):u.mode===void 0||u.mode===4?Math.floor(f/3):0}let l=await globalThis.crypto.subtle.digest("SHA-256",t),c=Array.from(new Uint8Array(l),h=>h.toString(16).padStart(2,"0")).join("");return{...Wh(e),id:"local-"+c,sha256:c,bytes:t,triangles:o,copyright:typeof n.json.asset.copyright=="string"?n.json.asset.copyright.slice(0,600):"",builtin:!1,warnings:n.issues.filter(h=>h.severity==="warning").length}}function ny(i){let e=new DataView(i.buffer,i.byteOffset,i.byteLength);if(i.length>=24&&[137,80,78,71,13,10,26,10].every((t,n)=>i[n]===t)&&e.getUint32(12)===1229472850){let t=e.getUint32(16),n=e.getUint32(20);if(t&&n)return{width:t,height:n,mime:"image/png"}}else if(i.length>4&&i[0]===255&&i[1]===216){let t=2;for(;t+3<i.length&&i[t++]===255;){for(;i[t]===255;)t++;let n=i[t++];if(n===217||n===218)break;if(n===1||n>=208&&n<=215)continue;if(t+2>i.length)break;let s=e.getUint16(t);if(s<2||t+s>i.length)break;if(n>=192&&n<=207&&![196,200,204].includes(n)&&s>=8){let r=e.getUint16(t+3),a=e.getUint16(t+5);if(a&&r)return{width:a,height:r,mime:"image/jpeg"}}t+=s}}ct("图片头无效，无法核对解码尺寸")}function dd(i){let e="";for(let t=0;t<i.length;t+=32768)e+=String.fromCharCode(...i.subarray(t,t+32768));return btoa(e)}function pd(i){(typeof i!="string"||i.length>Math.ceil(Dn.file/3)*4||i.length%4||/[^A-Za-z0-9+/=]/.test(i))&&ct("工作台内的模型编码无效或超过上限");let e;try{e=atob(i)}catch{ct("工作台内的模型编码无效")}let t=Uint8Array.from(e,n=>n.charCodeAt(0));return dd(t)!==i&&ct("工作台模型编码不规范"),t}function qh(i,e){let t=Object.create(null);t[e.id]=e;for(let n of i)t[n.id]=n;return t}function md(i,e,t,n){(!i||typeof i!="object"||Array.isArray(i)||Object.keys(i).length>Dn.count+1)&&ct("工作台视角列表无效");let s=qh(e,t),r=new Map;for(let[a,o]of Object.entries(i))(!Object.hasOwn(s,a)||o?.modelId!==a)&&ct("工作台视角与对应模型不一致"),n.validateView(o,s),r.set(a,o);return r}function iy(i,e,t,n,s){Xh(i),Object.hasOwn(qh(i,n),t)||ct("当前建筑不在工作台内");let r=Object.fromEntries(e);md(r,i,n,s);let a=i.map(l=>({id:l.id,metadata:Wh(l),data:dd(l.bytes)})),o=JSON.stringify({format:Gh,version:1,activeId:t,models:a,views:r});return new TextEncoder().encode(o).byteLength>Dn.project&&ct("工作台文件超过 24 MiB"),o}async function sy(i,e,t){(typeof i!="string"||new TextEncoder().encode(i).byteLength>Dn.project)&&ct("工作台文件不能超过 24 MiB");let n;try{n=JSON.parse(i.replace(/^\uFEFF/,""))}catch{ct("工作台不是有效 JSON")}(!n||n.format!==Gh||n.version!==1)&&ct("请选择城市纹理建筑工作台文件，不能使用比较项目或单独视角"),Object.keys(n).some(o=>!["format","version","activeId","models","views"].includes(o))&&ct("工作台包含未知字段"),(!Array.isArray(n.models)||n.models.length>Dn.count)&&ct("工作台最多包含 3 份本地模型");let s=[];for(let o of n.models){(!o||typeof o!="object")&&ct("工作台模型结构无效");let l=pd(o.data);Xh(s,{id:o.id,bytes:l});let c=await fd(l,o.metadata);c.id!==o.id&&ct("模型校验值与工作台记录不符"),s.push(c)}let r=qh(s,e);(typeof n.activeId!="string"||!Object.hasOwn(r,n.activeId))&&ct("工作台选中的建筑不存在");let a=md(n.views,s,e,t);return{entries:s,views:a,activeId:n.activeId}}gd.exports={LIMITS:Dn,FORMAT:Gh,metadata:Wh,quota:Xh,inspect:fd,serialize:iy,parse:sy}});/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var ji={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Qi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Bu=0,Ec=1,ku=2;var la=1,Io=2,lr=3,ui=0,Qt=1,zn=2,fi=0,cr=1,Tc=2,Ac=3,wc=4,zu=5;var xs=100,Vu=101,Hu=102,Gu=103,Wu=104,Xu=200,qu=201,Yu=202,Ku=203,Rc=204,Cc=205,Zu=206,Ju=207,$u=208,ju=209,Qu=210,ef=211,tf=212,nf=213,sf=214,ro=0,ao=1,oo=2,Xs=3,lo=4,co=5,ho=6,uo=7,Po=0,rf=1,af=2,jn=0,Ic=1,Pc=2,Lc=3,ca=4,Nc=5,Dc=6,Oc=7,fc="attached",of="detached",Uc=300,es=301,ys=302,Lo=303,No=304,ha=306,qi=1e3,Bn=1001,qs=1002,Nt=1003,Do=1004;var vs=1005;var Dt=1006,hr=1007;var Qn=1008;var Mn=1009,Fc=1010,Bc=1011,ur=1012,Oo=1013,ei=1014,Ln=1015,ti=1016,Uo=1017,Fo=1018,fr=1020,kc=35902,zc=35899,Vc=1021,Hc=1022,Nn=1023,oi=1026,ts=1027,Bo=1028,ko=1029,ns=1030,zo=1031;var Vo=1033,ua=33776,fa=33777,da=33778,pa=33779,Ho=35840,Go=35841,Wo=35842,Xo=35843,qo=36196,Yo=37492,Ko=37496,Zo=37488,Jo=37489,ma=37490,$o=37491,jo=37808,Qo=37809,el=37810,tl=37811,nl=37812,il=37813,sl=37814,rl=37815,al=37816,ol=37817,ll=37818,cl=37819,hl=37820,ul=37821,fl=36492,dl=36494,pl=36495,ml=36283,gl=36284,ga=36285,_l=36286;var hs=2300,us=2301,no=2302,dc=2303,pc=2400,mc=2401,gc=2402,lf=2500;var Gc=0,_a=1,dr=2,cf=3200;var xa=0,hf=1,Ni="",Lt="srgb",fn="srgb-linear",Br="linear",ut="srgb";var io=7680;var uf=519,ff=512,df=513,pf=514,xl=515,mf=516,gf=517,yl=518,_f=519,Wc=35044;var Xc="300 es",Yn=2e3,Ys=2001;function Bd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function kd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ks(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function xf(){let i=Ks("canvas");return i.style.display="block",i}var tu={},Zs=null;function kr(...i){let e="THREE."+i.shift();Zs?Zs("log",e,...i):console.log(e,...i)}function yf(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Oe(...i){i=yf(i);let e="THREE."+i.shift();if(Zs)Zs("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ge(...i){i=yf(i);let e="THREE."+i.shift();if(Zs)Zs("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function cs(...i){let e=i.join(" ");e in tu||(tu[e]=!0,Oe(...i))}function vf(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Sf={[ro]:ao,[oo]:ho,[lo]:uo,[Xs]:co,[ao]:ro,[ho]:oo,[uo]:lo,[co]:Xs},Jn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],nu=1234567,Ur=Math.PI/180,fs=180/Math.PI;function Zn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function qc(i,e){return(i%e+e)%e}function zd(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Vd(i,e,t){return i!==e?(t-i)/(e-i):0}function Fr(i,e,t){return(1-t)*i+t*e}function Hd(i,e,t,n){return Fr(i,e,1-Math.exp(-t*n))}function Gd(i,e=1){return e-Math.abs(qc(i,e*2)-e)}function Wd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Xd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function qd(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Yd(i,e){return i+Math.random()*(e-i)}function Kd(i){return i*(.5-Math.random())}function Zd(i){i!==void 0&&(nu=i);let e=nu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Jd(i){return i*Ur}function $d(i){return i*fs}function jd(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Qd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function ep(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function tp(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),f=a((e-n)/2),d=r((n-e)/2),x=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*f,o*c);break;case"YZY":i.set(l*f,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*f,o*h,o*c);break;case"XZX":i.set(o*h,l*x,l*d,o*c);break;case"YXY":i.set(l*d,o*h,l*x,o*c);break;case"ZYZ":i.set(l*x,l*d,o*h,o*c);break;default:Oe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function qn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ft(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var di={DEG2RAD:Ur,RAD2DEG:fs,generateUUID:Zn,clamp:nt,euclideanModulo:qc,mapLinear:zd,inverseLerp:Vd,lerp:Fr,damp:Hd,pingpong:Gd,smoothstep:Wd,smootherstep:Xd,randInt:qd,randFloat:Yd,randFloatSpread:Kd,seededRandom:Zd,degToRad:Jd,radToDeg:$d,isPowerOfTwo:jd,ceilPowerOfTwo:Qd,floorPowerOfTwo:ep,setQuaternionFromProperEuler:tp,normalize:ft,denormalize:qn},ke=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},an=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],f=r[a+0],d=r[a+1],x=r[a+2],v=r[a+3];if(u!==v||l!==f||c!==d||h!==x){let m=l*f+c*d+h*x+u*v;m<0&&(f=-f,d=-d,x=-x,v=-v,m=-m);let p=1-o;if(m<.9995){let R=Math.acos(m),L=Math.sin(R);p=Math.sin(p*R)/L,o=Math.sin(o*R)/L,l=l*p+f*o,c=c*p+d*o,h=h*p+x*o,u=u*p+v*o}else{l=l*p+f*o,c=c*p+d*o,h=h*p+x*o,u=u*p+v*o;let R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],d=r[a+2],x=r[a+3];return e[t]=o*x+h*u+l*d-c*f,e[t+1]=l*x+h*f+c*u-o*d,e[t+2]=c*x+h*d+o*f-l*u,e[t+3]=h*x-o*u-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),d=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*x,this._y=c*d*u-f*h*x,this._z=c*h*x+f*d*u,this._w=c*h*u-f*d*x;break;case"YXZ":this._x=f*h*u+c*d*x,this._y=c*d*u-f*h*x,this._z=c*h*x-f*d*u,this._w=c*h*u+f*d*x;break;case"ZXY":this._x=f*h*u-c*d*x,this._y=c*d*u+f*h*x,this._z=c*h*x+f*d*u,this._w=c*h*u-f*d*x;break;case"ZYX":this._x=f*h*u-c*d*x,this._y=c*d*u+f*h*x,this._z=c*h*x-f*d*u,this._w=c*h*u+f*d*x;break;case"YZX":this._x=f*h*u+c*d*x,this._y=c*d*u+f*h*x,this._z=c*h*x-f*d*u,this._w=c*h*u-f*d*x;break;case"XZY":this._x=f*h*u-c*d*x,this._y=c*d*u-f*h*x,this._z=c*h*x+f*d*u,this._w=c*h*u+f*d*x;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>u){let d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>u){let d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+u-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},k=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(iu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(iu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Hl.copy(this).projectOnVector(e),this.sub(Hl)}reflect(e){return this.sub(Hl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Hl=new k,iu=new an,Ye=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],x=n[8],v=s[0],m=s[3],p=s[6],R=s[1],L=s[4],S=s[7],E=s[2],A=s[5],I=s[8];return r[0]=a*v+o*R+l*E,r[3]=a*m+o*L+l*A,r[6]=a*p+o*S+l*I,r[1]=c*v+h*R+u*E,r[4]=c*m+h*L+u*A,r[7]=c*p+h*S+u*I,r[2]=f*v+d*R+x*E,r[5]=f*m+d*L+x*A,r[8]=f*p+d*S+x*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,x=t*u+n*f+s*d;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/x;return e[0]=u*v,e[1]=(s*c-h*n)*v,e[2]=(o*n-s*a)*v,e[3]=f*v,e[4]=(h*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=d*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return cs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Gl.makeScale(e,t)),this}rotate(e){return cs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Gl.makeRotation(-e)),this}translate(e,t){return cs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Gl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Gl=new Ye,su=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ru=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function np(){let i={enabled:!0,workingColorSpace:fn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ut&&(s.r=Ei(s.r),s.g=Ei(s.g),s.b=Ei(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(s.r=Ws(s.r),s.g=Ws(s.g),s.b=Ws(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ni?Br:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return cs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return cs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[fn]:{primaries:e,whitePoint:n,transfer:Br,toXYZ:su,fromXYZ:ru,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Lt},outputColorSpaceConfig:{drawingBufferColorSpace:Lt}},[Lt]:{primaries:e,whitePoint:n,transfer:ut,toXYZ:su,fromXYZ:ru,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Lt}}}),i}var tt=np();function Ei(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ws(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Is,fo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Is===void 0&&(Is=Ks("canvas")),Is.width=e.width,Is.height=e.height;let s=Is.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Is}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ks("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ei(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ei(t[n]/255)*255):t[n]=Ei(t[n]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},ip=0,Js=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=Zn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Wl(s[a].image)):r.push(Wl(s[a]))}else r=Wl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Wl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?fo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}var sp=0,Xl=new k,Zt=class i extends Jn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Bn,s=Bn,r=Dt,a=Qn,o=Nn,l=Mn,c=i.DEFAULT_ANISOTROPY,h=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sp++}),this.uuid=Zn(),this.name="",this.source=new Js(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Xl).x}get height(){return this.source.getSize(Xl).y}get depth(){return this.source.getSize(Xl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Uc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case qi:e.x=e.x-Math.floor(e.x);break;case Bn:e.x=e.x<0?0:1;break;case qs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case qi:e.y=e.y-Math.floor(e.y);break;case Bn:e.y=e.y<0?0:1;break;case qs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Zt.DEFAULT_IMAGE=null;Zt.DEFAULT_MAPPING=Uc;Zt.DEFAULT_ANISOTROPY=1;var dt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],x=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(x-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(x+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let L=(c+1)/2,S=(d+1)/2,E=(p+1)/2,A=(h+f)/4,I=(u+v)/4,g=(x+m)/4;return L>S&&L>E?L<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(L),s=A/n,r=I/n):S>E?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=A/s,r=g/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=I/r,s=g/r),this.set(n,s,r,t),this}let R=Math.sqrt((m-x)*(m-x)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(R)<.001&&(R=1),this.x=(m-x)/R,this.y=(u-v)/R,this.z=(f-h)/R,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},po=class extends Jn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Dt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Zt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Dt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Js(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},xn=class extends po{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},zr=class extends Zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var mo=class extends Zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var je=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,h,u,f,d,x,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,f,d,x,v,m)}set(e,t,n,s,r,a,o,l,c,h,u,f,d,x,v,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=x,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ps.setFromMatrixColumn(e,0).length(),r=1/Ps.setFromMatrixColumn(e,1).length(),a=1/Ps.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let f=a*h,d=a*u,x=o*h,v=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=d+x*c,t[5]=f-v*c,t[9]=-o*l,t[2]=v-f*c,t[6]=x+d*c,t[10]=a*l}else if(e.order==="YXZ"){let f=l*h,d=l*u,x=c*h,v=c*u;t[0]=f+v*o,t[4]=x*o-d,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=d*o-x,t[6]=v+f*o,t[10]=a*l}else if(e.order==="ZXY"){let f=l*h,d=l*u,x=c*h,v=c*u;t[0]=f-v*o,t[4]=-a*u,t[8]=x+d*o,t[1]=d+x*o,t[5]=a*h,t[9]=v-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let f=a*h,d=a*u,x=o*h,v=o*u;t[0]=l*h,t[4]=x*c-d,t[8]=f*c+v,t[1]=l*u,t[5]=v*c+f,t[9]=d*c-x,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let f=a*l,d=a*c,x=o*l,v=o*c;t[0]=l*h,t[4]=v-f*u,t[8]=x*u+d,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=d*u+x,t[10]=f-v*u}else if(e.order==="XZY"){let f=a*l,d=a*c,x=o*l,v=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+v,t[5]=a*h,t[9]=d*u-x,t[2]=x*u-d,t[6]=o*h,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(rp,e,ap)}lookAt(e,t,n){let s=this.elements;return Rn.subVectors(e,t),Rn.lengthSq()===0&&(Rn.z=1),Rn.normalize(),ki.crossVectors(n,Rn),ki.lengthSq()===0&&(Math.abs(n.z)===1?Rn.x+=1e-4:Rn.z+=1e-4,Rn.normalize(),ki.crossVectors(n,Rn)),ki.normalize(),Pa.crossVectors(Rn,ki),s[0]=ki.x,s[4]=Pa.x,s[8]=Rn.x,s[1]=ki.y,s[5]=Pa.y,s[9]=Rn.y,s[2]=ki.z,s[6]=Pa.z,s[10]=Rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],x=n[2],v=n[6],m=n[10],p=n[14],R=n[3],L=n[7],S=n[11],E=n[15],A=s[0],I=s[4],g=s[8],T=s[12],P=s[1],N=s[5],V=s[9],G=s[13],M=s[2],C=s[6],b=s[10],z=s[14],B=s[3],H=s[7],Z=s[11],X=s[15];return r[0]=a*A+o*P+l*M+c*B,r[4]=a*I+o*N+l*C+c*H,r[8]=a*g+o*V+l*b+c*Z,r[12]=a*T+o*G+l*z+c*X,r[1]=h*A+u*P+f*M+d*B,r[5]=h*I+u*N+f*C+d*H,r[9]=h*g+u*V+f*b+d*Z,r[13]=h*T+u*G+f*z+d*X,r[2]=x*A+v*P+m*M+p*B,r[6]=x*I+v*N+m*C+p*H,r[10]=x*g+v*V+m*b+p*Z,r[14]=x*T+v*G+m*z+p*X,r[3]=R*A+L*P+S*M+E*B,r[7]=R*I+L*N+S*C+E*H,r[11]=R*g+L*V+S*b+E*Z,r[15]=R*T+L*G+S*z+E*X,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],d=e[14],x=e[3],v=e[7],m=e[11],p=e[15],R=l*d-c*f,L=o*d-c*u,S=o*f-l*u,E=a*d-c*h,A=a*f-l*h,I=a*u-o*h;return t*(v*R-m*L+p*S)-n*(x*R-m*E+p*A)+s*(x*L-v*E+p*I)-r*(x*S-v*A+m*I)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],d=e[11],x=e[12],v=e[13],m=e[14],p=e[15],R=t*o-n*a,L=t*l-s*a,S=t*c-r*a,E=n*l-s*o,A=n*c-r*o,I=s*c-r*l,g=h*v-u*x,T=h*m-f*x,P=h*p-d*x,N=u*m-f*v,V=u*p-d*v,G=f*p-d*m,M=R*G-L*V+S*N+E*P-A*T+I*g;if(M===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/M;return e[0]=(o*G-l*V+c*N)*C,e[1]=(s*V-n*G-r*N)*C,e[2]=(v*I-m*A+p*E)*C,e[3]=(f*A-u*I-d*E)*C,e[4]=(l*P-a*G-c*T)*C,e[5]=(t*G-s*P+r*T)*C,e[6]=(m*S-x*I-p*L)*C,e[7]=(h*I-f*S+d*L)*C,e[8]=(a*V-o*P+c*g)*C,e[9]=(n*P-t*V-r*g)*C,e[10]=(x*A-v*S+p*R)*C,e[11]=(u*S-h*A-d*R)*C,e[12]=(o*T-a*N-l*g)*C,e[13]=(t*N-n*T+s*g)*C,e[14]=(v*L-x*E-m*R)*C,e[15]=(h*E-u*L+f*R)*C,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,x=r*u,v=a*h,m=a*u,p=o*u,R=l*c,L=l*h,S=l*u,E=n.x,A=n.y,I=n.z;return s[0]=(1-(v+p))*E,s[1]=(d+S)*E,s[2]=(x-L)*E,s[3]=0,s[4]=(d-S)*A,s[5]=(1-(f+p))*A,s[6]=(m+R)*A,s[7]=0,s[8]=(x+L)*I,s[9]=(m-R)*I,s[10]=(1-(f+v))*I,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ps.set(s[0],s[1],s[2]).length(),o=Ps.set(s[4],s[5],s[6]).length(),l=Ps.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Gn.copy(this);let c=1/a,h=1/o,u=1/l;return Gn.elements[0]*=c,Gn.elements[1]*=c,Gn.elements[2]*=c,Gn.elements[4]*=h,Gn.elements[5]*=h,Gn.elements[6]*=h,Gn.elements[8]*=u,Gn.elements[9]*=u,Gn.elements[10]*=u,t.setFromRotationMatrix(Gn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Yn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),d=(n+s)/(n-s),x,v;if(l)x=r/(a-r),v=a*r/(a-r);else if(o===Yn)x=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Ys)x=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Yn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),d=-(n+s)/(n-s),x,v;if(l)x=1/(a-r),v=a/(a-r);else if(o===Yn)x=-2/(a-r),v=-(a+r)/(a-r);else if(o===Ys)x=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=x,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ps=new k,Gn=new je,rp=new k(0,0,0),ap=new k(1,1,1),ki=new k,Pa=new k,Rn=new k,au=new je,ou=new an,li=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return au.makeRotationFromQuaternion(e),this.setFromRotationMatrix(au,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ou.setFromEuler(this),this.setFromQuaternion(ou,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};li.DEFAULT_ORDER="XYZ";var Vr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},op=0,lu=new k,Ls=new an,xi=new je,La=new k,Rr=new k,lp=new k,cp=new an,cu=new k(1,0,0),hu=new k(0,1,0),uu=new k(0,0,1),fu={type:"added"},hp={type:"removed"},Ns={type:"childadded",child:null},ql={type:"childremoved",child:null},bt=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:op++}),this.uuid=Zn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new k,t=new li,n=new an,s=new k(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new je},normalMatrix:{value:new Ye}}),this.matrix=new je,this.matrixWorld=new je,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ls.setFromAxisAngle(e,t),this.quaternion.multiply(Ls),this}rotateOnWorldAxis(e,t){return Ls.setFromAxisAngle(e,t),this.quaternion.premultiply(Ls),this}rotateX(e){return this.rotateOnAxis(cu,e)}rotateY(e){return this.rotateOnAxis(hu,e)}rotateZ(e){return this.rotateOnAxis(uu,e)}translateOnAxis(e,t){return lu.copy(e).applyQuaternion(this.quaternion),this.position.add(lu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(cu,e)}translateY(e){return this.translateOnAxis(hu,e)}translateZ(e){return this.translateOnAxis(uu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?La.copy(e):La.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Rr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xi.lookAt(Rr,La,this.up):xi.lookAt(La,Rr,this.up),this.quaternion.setFromRotationMatrix(xi),s&&(xi.extractRotation(s.matrixWorld),Ls.setFromRotationMatrix(xi),this.quaternion.premultiply(Ls.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ge("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(fu),Ns.child=e,this.dispatchEvent(Ns),Ns.child=null):Ge("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(hp),ql.child=e,this.dispatchEvent(ql),ql.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xi.multiply(e.parent.matrixWorld)),e.applyMatrix4(xi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(fu),Ns.child=e,this.dispatchEvent(Ns),Ns.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,e,lp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,cp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),d=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};bt.DEFAULT_UP=new k(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Kn=class extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},up={type:"move"},$s=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Kn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Kn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Kn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let v of e.hand.values()){let m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,x=.005;c.inputState.pinching&&f>d+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(up)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Kn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Mf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},zi={h:0,s:0,l:0},Na={h:0,s:0,l:0};function Yl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Be=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Lt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=tt.workingColorSpace){return this.r=e,this.g=t,this.b=n,tt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=tt.workingColorSpace){if(e=qc(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Yl(a,r,e+1/3),this.g=Yl(a,r,e),this.b=Yl(a,r,e-1/3)}return tt.colorSpaceToWorking(this,s),this}setStyle(e,t=Lt){function n(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Lt){let n=Mf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ei(e.r),this.g=Ei(e.g),this.b=Ei(e.b),this}copyLinearToSRGB(e){return this.r=Ws(e.r),this.g=Ws(e.g),this.b=Ws(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Lt){return tt.workingToColorSpace(rn.copy(this),e),Math.round(nt(rn.r*255,0,255))*65536+Math.round(nt(rn.g*255,0,255))*256+Math.round(nt(rn.b*255,0,255))}getHexString(e=Lt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(rn.copy(this),t);let n=rn.r,s=rn.g,r=rn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Lt){tt.workingToColorSpace(rn.copy(this),e);let t=rn.r,n=rn.g,s=rn.b;return e!==Lt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(zi),this.setHSL(zi.h+e,zi.s+t,zi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(zi),e.getHSL(Na);let n=Fr(zi.h,Na.h,t),s=Fr(zi.s,Na.s,t),r=Fr(zi.l,Na.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new Be;Be.NAMES=Mf;var ds=class extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new li,this.environmentIntensity=1,this.environmentRotation=new li,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Wn=new k,yi=new k,Kl=new k,vi=new k,Ds=new k,Os=new k,du=new k,Zl=new k,Jl=new k,$l=new k,jl=new dt,Ql=new dt,ec=new dt,Xi=class i{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Wn.subVectors(e,t),s.cross(Wn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Wn.subVectors(s,t),yi.subVectors(n,t),Kl.subVectors(e,t);let a=Wn.dot(Wn),o=Wn.dot(yi),l=Wn.dot(Kl),c=yi.dot(yi),h=yi.dot(Kl),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let f=1/u,d=(c*l-o*h)*f,x=(a*h-o*l)*f;return r.set(1-d-x,x,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,vi)===null?!1:vi.x>=0&&vi.y>=0&&vi.x+vi.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,vi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,vi.x),l.addScaledVector(a,vi.y),l.addScaledVector(o,vi.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return jl.setScalar(0),Ql.setScalar(0),ec.setScalar(0),jl.fromBufferAttribute(e,t),Ql.fromBufferAttribute(e,n),ec.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(jl,r.x),a.addScaledVector(Ql,r.y),a.addScaledVector(ec,r.z),a}static isFrontFacing(e,t,n,s){return Wn.subVectors(n,t),yi.subVectors(e,t),Wn.cross(yi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wn.subVectors(this.c,this.b),yi.subVectors(this.a,this.b),Wn.cross(yi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Ds.subVectors(s,n),Os.subVectors(r,n),Zl.subVectors(e,n);let l=Ds.dot(Zl),c=Os.dot(Zl);if(l<=0&&c<=0)return t.copy(n);Jl.subVectors(e,s);let h=Ds.dot(Jl),u=Os.dot(Jl);if(h>=0&&u<=h)return t.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ds,a);$l.subVectors(e,r);let d=Ds.dot($l),x=Os.dot($l);if(x>=0&&d<=x)return t.copy(r);let v=d*c-l*x;if(v<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(Os,o);let m=h*x-d*u;if(m<=0&&u-h>=0&&d-x>=0)return du.subVectors(r,s),o=(u-h)/(u-h+(d-x)),t.copy(s).addScaledVector(du,o);let p=1/(m+v+f);return a=v*p,o=f*p,t.copy(n).addScaledVector(Ds,a).addScaledVector(Os,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},$t=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Xn):Xn.fromBufferAttribute(r,a),Xn.applyMatrix4(e.matrixWorld),this.expandByPoint(Xn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Da.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Da.copy(n.boundingBox)),Da.applyMatrix4(e.matrixWorld),this.union(Da)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xn),Xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Cr),Oa.subVectors(this.max,Cr),Us.subVectors(e.a,Cr),Fs.subVectors(e.b,Cr),Bs.subVectors(e.c,Cr),Vi.subVectors(Fs,Us),Hi.subVectors(Bs,Fs),rs.subVectors(Us,Bs);let t=[0,-Vi.z,Vi.y,0,-Hi.z,Hi.y,0,-rs.z,rs.y,Vi.z,0,-Vi.x,Hi.z,0,-Hi.x,rs.z,0,-rs.x,-Vi.y,Vi.x,0,-Hi.y,Hi.x,0,-rs.y,rs.x,0];return!tc(t,Us,Fs,Bs,Oa)||(t=[1,0,0,0,1,0,0,0,1],!tc(t,Us,Fs,Bs,Oa))?!1:(Ua.crossVectors(Vi,Hi),t=[Ua.x,Ua.y,Ua.z],tc(t,Us,Fs,Bs,Oa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Si),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Si=[new k,new k,new k,new k,new k,new k,new k,new k],Xn=new k,Da=new $t,Us=new k,Fs=new k,Bs=new k,Vi=new k,Hi=new k,rs=new k,Cr=new k,Oa=new k,Ua=new k,as=new k;function tc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){as.fromArray(i,r);let o=s.x*Math.abs(as.x)+s.y*Math.abs(as.y)+s.z*Math.abs(as.z),l=e.dot(as),c=t.dot(as),h=n.dot(as);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var kt=new k,Fa=new ke,fp=0,Ht=class extends Jn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Wc,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Fa.fromBufferAttribute(this,t),Fa.applyMatrix3(e),this.setXY(t,Fa.x,Fa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),s=ft(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),s=ft(s,this.array),r=ft(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Hr=class extends Ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Gr=class extends Ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Kt=class extends Ht{constructor(e,t,n){super(new Float32Array(e),t,n)}},dp=new $t,Ir=new k,nc=new k,yn=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):dp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ir.subVectors(e,this.center);let t=Ir.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ir,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(nc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ir.copy(e.center).add(nc)),this.expandByPoint(Ir.copy(e.center).sub(nc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},pp=0,Fn=new je,ic=new bt,ks=new k,Cn=new $t,Pr=new $t,Yt=new k,jt=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:pp++}),this.uuid=Zn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Bd(e)?Gr:Hr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Fn.makeRotationFromQuaternion(e),this.applyMatrix4(Fn),this}rotateX(e){return Fn.makeRotationX(e),this.applyMatrix4(Fn),this}rotateY(e){return Fn.makeRotationY(e),this.applyMatrix4(Fn),this}rotateZ(e){return Fn.makeRotationZ(e),this.applyMatrix4(Fn),this}translate(e,t,n){return Fn.makeTranslation(e,t,n),this.applyMatrix4(Fn),this}scale(e,t,n){return Fn.makeScale(e,t,n),this.applyMatrix4(Fn),this}lookAt(e){return ic.lookAt(e),ic.updateMatrix(),this.applyMatrix4(ic.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ks).negate(),this.translate(ks.x,ks.y,ks.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Kt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $t);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Cn.setFromBufferAttribute(r),this.morphTargetsRelative?(Yt.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint(Yt),Yt.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint(Yt)):(this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ge('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let n=this.boundingSphere.center;if(Cn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Pr.setFromBufferAttribute(o),this.morphTargetsRelative?(Yt.addVectors(Cn.min,Pr.min),Cn.expandByPoint(Yt),Yt.addVectors(Cn.max,Pr.max),Cn.expandByPoint(Yt)):(Cn.expandByPoint(Pr.min),Cn.expandByPoint(Pr.max))}Cn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Yt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Yt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Yt.fromBufferAttribute(o,c),l&&(ks.fromBufferAttribute(e,c),Yt.add(ks)),s=Math.max(s,n.distanceToSquared(Yt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ge('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ge("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Ht(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let g=0;g<n.count;g++)o[g]=new k,l[g]=new k;let c=new k,h=new k,u=new k,f=new ke,d=new ke,x=new ke,v=new k,m=new k;function p(g,T,P){c.fromBufferAttribute(n,g),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,P),f.fromBufferAttribute(r,g),d.fromBufferAttribute(r,T),x.fromBufferAttribute(r,P),h.sub(c),u.sub(c),d.sub(f),x.sub(f);let N=1/(d.x*x.y-x.x*d.y);isFinite(N)&&(v.copy(h).multiplyScalar(x.y).addScaledVector(u,-d.y).multiplyScalar(N),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-x.x).multiplyScalar(N),o[g].add(v),o[T].add(v),o[P].add(v),l[g].add(m),l[T].add(m),l[P].add(m))}let R=this.groups;R.length===0&&(R=[{start:0,count:e.count}]);for(let g=0,T=R.length;g<T;++g){let P=R[g],N=P.start,V=P.count;for(let G=N,M=N+V;G<M;G+=3)p(e.getX(G+0),e.getX(G+1),e.getX(G+2))}let L=new k,S=new k,E=new k,A=new k;function I(g){E.fromBufferAttribute(s,g),A.copy(E);let T=o[g];L.copy(T),L.sub(E.multiplyScalar(E.dot(T))).normalize(),S.crossVectors(A,T);let N=S.dot(l[g])<0?-1:1;a.setXYZW(g,L.x,L.y,L.z,N)}for(let g=0,T=R.length;g<T;++g){let P=R[g],N=P.start,V=P.count;for(let G=N,M=N+V;G<M;G+=3)I(e.getX(G+0)),I(e.getX(G+1)),I(e.getX(G+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let s=new k,r=new k,a=new k,o=new k,l=new k,c=new k,h=new k,u=new k;if(e)for(let f=0,d=e.count;f<d;f+=3){let x=e.getX(f+0),v=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Yt.fromBufferAttribute(e,t),Yt.normalize(),e.setXYZ(t,Yt.x,Yt.y,Yt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h),d=0,x=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let p=0;p<h;p++)f[x++]=c[d++]}return new Ht(f,h,u)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let f=c[h],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let d=c[u];h.push(d.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},js=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Wc,this.updateRanges=[],this.version=0,this.uuid=Zn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},un=new k,Qs=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ft(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ft(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),s=ft(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ft(t,this.array),n=ft(n,this.array),s=ft(s,this.array),r=ft(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){kr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Ht(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){kr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},sc=new k,mp=new k,gp=new Ye,In=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=sc.subVectors(n,t).cross(mp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(sc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||gp.getNormalMatrix(e),s=this.coplanarPoint(sc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},_p=0,dn=class extends Jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_p++}),this.uuid=Zn(),this.name="",this.type="Material",this.blending=cr,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Rc,this.blendDst=Cc,this.blendEquation=xs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=Xs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=uf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=io,this.stencilZFail=io,this.stencilZPass=io,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new In().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Mi=new k,rc=new k,Ba=new k,ka=new k,Ti=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Mi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Mi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Mi.copy(this.origin).addScaledVector(this.direction,t),Mi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){rc.copy(e).add(t).multiplyScalar(.5),Ba.copy(t).sub(e).normalize(),ka.copy(this.origin).sub(rc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Ba),o=ka.dot(this.direction),l=-ka.dot(Ba),c=ka.lengthSq(),h=Math.abs(1-a*a),u,f,d,x;if(h>0)if(u=a*l-o,f=a*o-l,x=r*h,u>=0)if(f>=-x)if(f<=x){let v=1/h;u*=v,f*=v,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-x?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=x?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(rc).addScaledVector(Ba,f),d}intersectSphere(e,t){if(e.radius<0)return null;Mi.subVectors(e.center,this.origin);let n=Mi.dot(this.direction),s=Mi.dot(Mi)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Mi)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=e.x-a.x,f=e.y-a.y,d=e.z-a.z,x=t.x-a.x,v=t.y-a.y,m=t.z-a.z,p=n.x-a.x,R=n.y-a.y,L=n.z-a.z,S=Math.abs(l),E=Math.abs(c),A=Math.abs(h),I,g,T,P,N,V,G,M,C,b,z,B;if(S>=E&&S>=A?(T=l,V=u,C=x,B=p,l>=0?(I=c,g=h,P=f,N=d,G=v,M=m,b=R,z=L):(I=h,g=c,P=d,N=f,G=m,M=v,b=L,z=R)):E>=A?(T=c,V=f,C=v,B=R,c>=0?(I=h,g=l,P=d,N=u,G=m,M=x,b=L,z=p):(I=l,g=h,P=u,N=d,G=x,M=m,b=p,z=L)):(T=h,V=d,C=m,B=L,h>=0?(I=l,g=c,P=u,N=f,G=x,M=v,b=p,z=R):(I=c,g=l,P=f,N=u,G=v,M=x,b=R,z=p)),T===0)return null;let H=I/T,Z=g/T,X=1/T,oe=P-H*V,ae=N-Z*V,Ue=G-H*C,we=M-Z*C,Te=b-H*B,K=z-Z*B,j=Te*we-K*Ue,le=oe*K-ae*Te,me=Ue*ae-we*oe;if(s){if(j<0||le<0||me<0)return null}else if((j<0||le<0||me<0)&&(j>0||le>0||me>0))return null;let se=j+le+me;if(se===0)return null;let Ce=X*(j*V+le*C+me*B);return(se>0?Ce<0:Ce>0)?null:this.at(Ce/se,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},$n=class extends dn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=Po,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},pu=new je,os=new Ti,za=new yn,mu=new k,Va=new k,Ha=new k,Ga=new k,ac=new k,Wa=new k,gu=new k,Xa=new k,yt=class extends bt{constructor(e=new jt,t=new $n){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Wa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(ac.fromBufferAttribute(u,e),a?Wa.addScaledVector(ac,h):Wa.addScaledVector(ac.sub(t),h))}t.add(Wa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),za.copy(n.boundingSphere),za.applyMatrix4(r),os.copy(e.ray).recast(e.near),!(za.containsPoint(os.origin)===!1&&(os.intersectSphere(za,mu)===null||os.origin.distanceToSquared(mu)>(e.far-e.near)**2))&&(pu.copy(r).invert(),os.copy(e.ray).applyMatrix4(pu),!(n.boundingBox!==null&&os.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,os)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,v=f.length;x<v;x++){let m=f[x],p=a[m.materialIndex],R=Math.max(m.start,d.start),L=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let S=R,E=L;S<E;S+=3){let A=o.getX(S),I=o.getX(S+1),g=o.getX(S+2);s=qa(this,p,e,n,c,h,u,A,I,g),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=x,p=v;m<p;m+=3){let R=o.getX(m),L=o.getX(m+1),S=o.getX(m+2);s=qa(this,a,e,n,c,h,u,R,L,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,v=f.length;x<v;x++){let m=f[x],p=a[m.materialIndex],R=Math.max(m.start,d.start),L=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let S=R,E=L;S<E;S+=3){let A=S,I=S+1,g=S+2;s=qa(this,p,e,n,c,h,u,A,I,g),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=x,p=v;m<p;m+=3){let R=m,L=m+1,S=m+2;s=qa(this,a,e,n,c,h,u,R,L,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function xp(i,e,t,n,s,r,a,o){let l;if(e.side===Qt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===ui,o),l===null)return null;Xa.copy(o),Xa.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Xa);return c<t.near||c>t.far?null:{distance:c,point:Xa.clone(),object:i}}function qa(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Va),i.getVertexPosition(l,Ha),i.getVertexPosition(c,Ga);let h=xp(i,e,t,n,Va,Ha,Ga,gu);if(h){let u=new k;Xi.getBarycoord(gu,Va,Ha,Ga,u),s&&(h.uv=Xi.getInterpolatedAttribute(s,o,l,c,u,new ke)),r&&(h.uv1=Xi.getInterpolatedAttribute(r,o,l,c,u,new ke)),a&&(h.normal=Xi.getInterpolatedAttribute(a,o,l,c,u,new k),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a:o,b:l,c,normal:new k,materialIndex:0};Xi.getNormal(Va,Ha,Ga,f.normal),h.face=f,h.barycoord=u}return h}var Lr=new dt,_u=new dt,xu=new dt,yp=new dt,yu=new je,Ya=new k,oc=new yn,vu=new je,lc=new Ti,Wr=class extends yt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=fc,this.bindMatrix=new je,this.bindMatrixInverse=new je,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new $t),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ya),this.boundingBox.expandByPoint(Ya)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new yn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ya),this.boundingSphere.expandByPoint(Ya)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),oc.copy(this.boundingSphere),oc.applyMatrix4(s),e.ray.intersectsSphere(oc)!==!1&&(vu.copy(s).invert(),lc.copy(e.ray).applyMatrix4(vu),!(this.boundingBox!==null&&lc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,lc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new dt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===fc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===of?this.bindMatrixInverse.copy(this.bindMatrix).invert():Oe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;_u.fromBufferAttribute(s.attributes.skinIndex,e),xu.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(Lr.copy(t),t.set(0,0,0,0)):(Lr.set(...t,1),t.set(0,0,0)),Lr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=xu.getComponent(r);if(a!==0){let o=_u.getComponent(r);yu.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(yp.copy(Lr).applyMatrix4(yu),a)}}return t.isVector4&&(t.w=Lr.w),t.applyMatrix4(this.bindMatrixInverse)}},er=class extends bt{constructor(){super(),this.isBone=!0,this.type="Bone"}},tr=class extends Zt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Nt,h=Nt,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Su=new je,vp=new je,Xr=class i{constructor(e=[],t=[]){this.uuid=Zn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Oe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new je)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new je;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:vp;Su.multiplyMatrices(o,t[r]),Su.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new tr(t,e,e,Nn,Ln);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(Oe("Skeleton: No bone found with UUID:",r),a=new er),this.bones.push(a),this.boneInverses.push(new je().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},Ai=class extends Ht{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},zs=new je,Mu=new je,Ka=[],bu=new $t,Sp=new je,Nr=new yt,Dr=new yn,ps=class extends yt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ai(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Sp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new $t),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zs),bu.copy(e.boundingBox).applyMatrix4(zs),this.boundingBox.union(bu)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new yn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zs),Dr.copy(e.boundingSphere).applyMatrix4(zs),this.boundingSphere.union(Dr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Nr.geometry=this.geometry,Nr.material=this.material,Nr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Dr.copy(this.boundingSphere),Dr.applyMatrix4(n),e.ray.intersectsSphere(Dr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,zs),Mu.multiplyMatrices(n,zs),Nr.matrixWorld=Mu,Nr.raycast(e,Ka);for(let a=0,o=Ka.length;a<o;a++){let l=Ka[a];l.instanceId=r,l.object=this,t.push(l)}Ka.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ai(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new tr(new Float32Array(s*this.count),s,this.count,Bo,Ln));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ls=new yn,Mp=new ke(.5,.5),Za=new k,nr=class{constructor(e=new In,t=new In,n=new In,s=new In,r=new In,a=new In){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Yn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],d=r[7],x=r[8],v=r[9],m=r[10],p=r[11],R=r[12],L=r[13],S=r[14],E=r[15];if(s[0].setComponents(c-a,d-h,p-x,E-R).normalize(),s[1].setComponents(c+a,d+h,p+x,E+R).normalize(),s[2].setComponents(c+o,d+u,p+v,E+L).normalize(),s[3].setComponents(c-o,d-u,p-v,E-L).normalize(),n)s[4].setComponents(l,f,m,S).normalize(),s[5].setComponents(c-l,d-f,p-m,E-S).normalize();else if(s[4].setComponents(c-l,d-f,p-m,E-S).normalize(),t===Yn)s[5].setComponents(c+l,d+f,p+m,E+S).normalize();else if(t===Ys)s[5].setComponents(l,f,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ls)}intersectsSprite(e){ls.center.set(0,0,0);let t=Mp.distanceTo(e.center);return ls.radius=.7071067811865476+t,ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(ls)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Za.x=s.normal.x>0?e.max.x:e.min.x,Za.y=s.normal.y>0?e.max.y:e.min.y,Za.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Za)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ir=class extends dn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},go=new k,_o=new k,Eu=new je,Or=new Ti,Ja=new yn,cc=new k,Tu=new k,ms=class extends bt{constructor(e=new jt,t=new ir){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)go.fromBufferAttribute(t,s-1),_o.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=go.distanceTo(_o);e.setAttribute("lineDistance",new Kt(n,1))}else Oe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ja.copy(n.boundingSphere),Ja.applyMatrix4(s),Ja.radius+=r,e.ray.intersectsSphere(Ja)===!1)return;Eu.copy(s).invert(),Or.copy(e.ray).applyMatrix4(Eu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){let d=Math.max(0,a.start),x=Math.min(h.count,a.start+a.count);for(let v=d,m=x-1;v<m;v+=c){let p=h.getX(v),R=h.getX(v+1),L=$a(this,e,Or,l,p,R,v);L&&t.push(L)}if(this.isLineLoop){let v=h.getX(x-1),m=h.getX(d),p=$a(this,e,Or,l,v,m,x-1);p&&t.push(p)}}else{let d=Math.max(0,a.start),x=Math.min(f.count,a.start+a.count);for(let v=d,m=x-1;v<m;v+=c){let p=$a(this,e,Or,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){let v=$a(this,e,Or,l,x-1,d,x-1);v&&t.push(v)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function $a(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(go.fromBufferAttribute(o,s),_o.fromBufferAttribute(o,r),t.distanceSqToSegment(go,_o,cc,Tu)>n)return;cc.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(cc);if(!(c<e.near||c>e.far))return{distance:c,point:Tu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Au=new k,wu=new k,qr=class extends ms{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Au.fromBufferAttribute(t,s),wu.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Au.distanceTo(wu);e.setAttribute("lineDistance",new Kt(n,1))}else Oe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Yr=class extends ms{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},sr=class extends dn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Be(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ru=new je,_c=new Ti,ja=new yn,Qa=new k,Kr=class extends bt{constructor(e=new jt,t=new sr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ja.copy(n.boundingSphere),ja.applyMatrix4(s),ja.radius+=r,e.ray.intersectsSphere(ja)===!1)return;Ru.copy(s).invert(),_c.copy(e.ray).applyMatrix4(Ru);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){let f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let x=f,v=d;x<v;x++){let m=c.getX(x);Qa.fromBufferAttribute(u,m),Cu(Qa,m,l,s,e,t,this)}}else{let f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let x=f,v=d;x<v;x++)Qa.fromBufferAttribute(u,x),Cu(Qa,x,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Cu(i,e,t,n,s,r,a){let o=_c.distanceSqToPoint(i);if(o<t){let l=new k;_c.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Zr=class extends Zt{constructor(e=[],t=es,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Yi=class extends Zt{constructor(e,t,n=ei,s,r,a,o=Nt,l=Nt,c,h=oi,u=1){if(h!==oi&&h!==ts)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:u};super(f,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Js(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},xo=class extends Yi{constructor(e,t=ei,n=es,s,r,a=Nt,o=Nt,l,c=oi){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Jr=class extends Zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ki=class i extends jt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],f=0,d=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Kt(c,3)),this.setAttribute("normal",new Kt(h,3)),this.setAttribute("uv",new Kt(u,2));function x(v,m,p,R,L,S,E,A,I,g,T){let P=S/I,N=E/g,V=S/2,G=E/2,M=A/2,C=I+1,b=g+1,z=0,B=0,H=new k;for(let Z=0;Z<b;Z++){let X=Z*N-G;for(let oe=0;oe<C;oe++){let ae=oe*P-V;H[v]=ae*R,H[m]=X*L,H[p]=M,c.push(H.x,H.y,H.z),H[v]=0,H[m]=0,H[p]=A>0?1:-1,h.push(H.x,H.y,H.z),u.push(oe/I),u.push(1-Z/g),z+=1}}for(let Z=0;Z<g;Z++)for(let X=0;X<I;X++){let oe=f+X+C*Z,ae=f+X+C*(Z+1),Ue=f+(X+1)+C*(Z+1),we=f+(X+1)+C*Z;l.push(oe,ae,we),l.push(ae,Ue,we),B+=6}o.addGroup(d,B,T),d+=B,f+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var $r=class i extends jt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],f=[],d=[],x=0,v=[],m=n/2,p=0;R(),a===!1&&(e>0&&L(!0),t>0&&L(!1)),this.setIndex(h),this.setAttribute("position",new Kt(u,3)),this.setAttribute("normal",new Kt(f,3)),this.setAttribute("uv",new Kt(d,2));function R(){let S=new k,E=new k,A=0,I=(t-e)/n;for(let g=0;g<=r;g++){let T=[],P=g/r,N=P*(t-e)+e;for(let V=0;V<=s;V++){let G=V/s,M=G*l+o,C=Math.sin(M),b=Math.cos(M);E.x=N*C,E.y=-P*n+m,E.z=N*b,u.push(E.x,E.y,E.z),S.set(C,I,b).normalize(),f.push(S.x,S.y,S.z),d.push(G,1-P),T.push(x++)}v.push(T)}for(let g=0;g<s;g++)for(let T=0;T<r;T++){let P=v[T][g],N=v[T+1][g],V=v[T+1][g+1],G=v[T][g+1];(e>0||T!==0)&&(h.push(P,N,G),A+=3),(t>0||T!==r-1)&&(h.push(N,V,G),A+=3)}c.addGroup(p,A,0),p+=A}function L(S){let E=x,A=new ke,I=new k,g=0,T=S===!0?e:t,P=S===!0?1:-1;for(let V=1;V<=s;V++)u.push(0,m*P,0),f.push(0,P,0),d.push(.5,.5),x++;let N=x;for(let V=0;V<=s;V++){let M=V/s*l+o,C=Math.cos(M),b=Math.sin(M);I.x=T*b,I.y=m*P,I.z=T*C,u.push(I.x,I.y,I.z),f.push(0,P,0),A.x=C*.5+.5,A.y=b*.5*P+.5,d.push(A.x,A.y),x++}for(let V=0;V<s;V++){let G=E+V,M=N+V;S===!0?h.push(M,M+1,G):h.push(M+1,M,G),g+=3}c.addGroup(p,g,S===!0?1:2),p+=g}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var jr=class i extends jt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,f=t/l,d=[],x=[],v=[],m=[];for(let p=0;p<h;p++){let R=p*f-a;for(let L=0;L<c;L++){let S=L*u-r;x.push(S,-R,0),v.push(0,0,1),m.push(L/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let R=0;R<o;R++){let L=R+c*p,S=R+c*(p+1),E=R+1+c*(p+1),A=R+1+c*p;d.push(L,S,A),d.push(S,E,A)}this.setIndex(d),this.setAttribute("position",new Kt(x,3)),this.setAttribute("normal",new Kt(v,3)),this.setAttribute("uv",new Kt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function Ss(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Iu(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Iu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function on(i){let e={};for(let t=0;t<i.length;t++){let n=Ss(i[t]);for(let s in n)e[s]=n[s]}return e}function Iu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function bp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Yc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var bf={clone:Ss,merge:on},Ep=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Tp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Pn=class extends dn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ep,this.fragmentShader=Tp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ss(e.uniforms),this.uniformsGroups=bp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Be().setHex(s.value);break;case"v2":this.uniforms[n].value=new ke().fromArray(s.value);break;case"v3":this.uniforms[n].value=new k().fromArray(s.value);break;case"v4":this.uniforms[n].value=new dt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ye().fromArray(s.value);break;case"m4":this.uniforms[n].value=new je().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},yo=class extends Pn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},kn=class extends dn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xa,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},vn=class extends kn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ke(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return nt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Be(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Be(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Be(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Qr=class extends dn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xa,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=Po,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},vo=class extends dn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=cf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},So=class extends dn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Wi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function so(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Ap(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Pu(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function wp(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var ci=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Mo=class extends ci{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:pc,endingEnd:pc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case mc:r=e,o=2*t-n;break;case gc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case mc:a=e,l=2*n-t;break;case gc:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,x=(n-t)/(s-t),v=x*x,m=v*x,p=-f*m+2*f*v-f*x,R=(1+f)*m+(-1.5-2*f)*v+(-.5+f)*x+1,L=(-1-d)*m+(1.5+d)*v+.5*x,S=d*m-d*v;for(let E=0;E!==o;++E)r[E]=p*a[h+E]+R*a[c+E]+L*a[l+E]+S*a[u+E];return r}},bo=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),u=1-h;for(let f=0;f!==o;++f)r[f]=a[c+f]*u+a[l+f]*h;return r}},Eo=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},To=class extends ci{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let x=(n-t)/(s-t),v=1-x;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*x;return r}let f=o*2,d=e-1;for(let x=0;x!==o;++x){let v=a[c+x],m=a[l+x],p=d*f+x*2,R=u[p],L=u[p+1],S=e*f+x*2,E=h[S],A=h[S+1],I=Cp(n,t,R,E,s);r[x]=Ef(I,v,L,A,m)}return r}};function Ef(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Rp(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Cp(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Ef(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Rp(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Sn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Wi(t,this.TimeBufferType),this.values=Wi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Wi(e.times,Array),values:Wi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),so(e.settings)&&(n.settings={inTangents:Wi(e.settings.inTangents,Array),outTangents:Wi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Eo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new bo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new To(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case hs:t=this.InterpolantFactoryMethodDiscrete;break;case us:t=this.InterpolantFactoryMethodLinear;break;case no:t=this.InterpolantFactoryMethodSmooth;break;case dc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Oe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return hs;case this.InterpolantFactoryMethodLinear:return us;case this.InterpolantFactoryMethodSmooth:return no;case this.InterpolantFactoryMethodBezier:return dc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;so(this.settings)&&(Lu(this.settings.inTangents,e),Lu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ge("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ge("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Ge("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ge("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&kd(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ge("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===no,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*n,f=u-n,d=u+n;for(let x=0;x!==n;++x){let v=t[u+x];if(v!==t[f+x]||v!==t[d+x]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[u+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,so(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Lu(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Sn.prototype.ValueTypeName="";Sn.prototype.TimeBufferType=Float32Array;Sn.prototype.ValueBufferType=Float32Array;Sn.prototype.DefaultInterpolation=us;var wi=class extends Sn{constructor(e,t,n){super(e,t,n)}};wi.prototype.ValueTypeName="bool";wi.prototype.ValueBufferType=Array;wi.prototype.DefaultInterpolation=hs;wi.prototype.InterpolantFactoryMethodLinear=void 0;wi.prototype.InterpolantFactoryMethodSmooth=void 0;var ea=class extends Sn{constructor(e,t,n,s){super(e,t,n,s)}};ea.prototype.ValueTypeName="color";var Ri=class extends Sn{constructor(e,t,n,s){super(e,t,n,s)}};Ri.prototype.ValueTypeName="number";var Ao=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)an.slerpFlat(r,0,a,c-o,a,c,l);return r}},Ci=class extends Sn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ao(this.times,this.values,this.getValueSize(),e)}};Ci.prototype.ValueTypeName="quaternion";Ci.prototype.InterpolantFactoryMethodSmooth=void 0;var Ii=class extends Sn{constructor(e,t,n){super(e,t,n)}};Ii.prototype.ValueTypeName="string";Ii.prototype.ValueBufferType=Array;Ii.prototype.DefaultInterpolation=hs;Ii.prototype.InterpolantFactoryMethodLinear=void 0;Ii.prototype.InterpolantFactoryMethodSmooth=void 0;var Zi=class extends Sn{constructor(e,t,n,s){super(e,t,n,s)}};Zi.prototype.ValueTypeName="vector";var ta=class{constructor(e="",t=-1,n=[],s=lf){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Zn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Pp(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Sn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let h=Ap(l);l=Pu(l,1,h),c=Pu(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new Ri(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],h=c.name.match(r);if(h&&h.length>1){let u=h[1],f=s[u];f||(s[u]=f=[]),f.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Ip(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ri;case"vector":case"vector2":case"vector3":case"vector4":return Zi;case"color":return ea;case"quaternion":return Ci;case"bool":case"boolean":return wi;case"string":return Ii}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Pp(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Ip(i.type);if(i.times===void 0){let n=[],s=[];wp(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),so(i.settings)&&(t.settings={inTangents:Wi(i.settings.inTangents,Float32Array),outTangents:Wi(i.settings.outTangents,Float32Array)}),t}var ai={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Nu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Nu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Nu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var rr=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let d=c[u],x=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Tf=new rr,hi=class{constructor(e){this.manager=e!==void 0?e:Tf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};hi.DEFAULT_MATERIAL_NAME="__DEFAULT";var bi={},xc=class extends Error{constructor(e,t){super(e),this.response=t}},ar=class extends hi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ai.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(bi[e]!==void 0){bi[e].push({onLoad:t,onProgress:n,onError:s});return}bi[e]=[],bi[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Oe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=bi[e],u=c.body.getReader(),f=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=f?parseInt(f):0,x=d!==0,v=0,m=new ReadableStream({start(p){R();function R(){u.read().then(({done:L,value:S})=>{if(L)p.close();else{v+=S.byteLength;let E=new ProgressEvent("progress",{lengthComputable:x,loaded:v,total:d});for(let A=0,I=h.length;A<I;A++){let g=h[A];g.onProgress&&g.onProgress(E)}p.enqueue(S),R()}},L=>{p.error(L)})}}});return new Response(m)}else throw new xc(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(x=>d.decode(x))}}}).then(c=>{ai.add(`file:${e}`,c);let h=bi[e];delete bi[e];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onLoad&&d.onLoad(c)}}).catch(c=>{let h=bi[e];if(h===void 0)throw this.manager.itemError(e),c;delete bi[e];for(let u=0,f=h.length;u<f;u++){let d=h[u];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Vs=new WeakMap,wo=class extends hi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=Vs.get(a);u===void 0&&(u=[],Vs.set(a,u)),u.push({onLoad:t,onError:s})}return a}let o=Ks("img");function l(){h(),t&&t(this);let u=Vs.get(this)||[];for(let f=0;f<u.length;f++){let d=u[f];d.onLoad&&d.onLoad(this)}Vs.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),ai.remove(`image:${e}`);let f=Vs.get(this)||[];for(let d=0;d<f.length;d++){let x=f[d];x.onError&&x.onError(u)}Vs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ai.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var na=class extends hi{constructor(e){super(e)}load(e,t,n,s){let r=new Zt,a=new wo(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},gs=class extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ia=class extends gs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},hc=new je,Du=new k,Ou=new k,or=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.mapType=Mn,this.map=null,this.mapPass=null,this.matrix=new je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nr,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Du.setFromMatrixPosition(e.matrixWorld),t.position.copy(Du),Ou.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ou),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){hc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(hc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Ys||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(hc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},eo=new k,to=new an,ri=new k,sa=class extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new je,this.projectionMatrix=new je,this.projectionMatrixInverse=new je,this.coordinateSystem=Yn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(eo,to,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(eo,to,ri.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(eo,to,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(eo,to,ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Gi=new k,Uu=new ke,Fu=new ke,zt=class extends sa{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=fs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ur*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return fs*2*Math.atan(Math.tan(Ur*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Gi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z),Gi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Gi.x,Gi.y).multiplyScalar(-e/Gi.z)}getViewSize(e,t){return this.getViewBounds(e,Uu,Fu),t.subVectors(Fu,Uu)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ur*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},yc=class extends or{constructor(){super(new zt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=fs*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},ra=class extends gs{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new yc}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},vc=class extends or{constructor(){super(new zt(90,1,.5,500)),this.isPointLightShadow=!0}},_s=class extends gs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new vc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Ji=class extends sa{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Sc=class extends or{constructor(){super(new Ji(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$i=class extends gs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new Sc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Pi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var uc=new WeakMap,aa=class extends hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Oe("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Oe("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=ai.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{uc.has(a)===!0?(s&&s(uc.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ai.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),uc.set(l,c),ai.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ai.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Hs=-90,Gs=1,Ro=class extends bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new zt(Hs,Gs,e,t);s.layers=this.layers,this.add(s);let r=new zt(Hs,Gs,e,t);r.layers=this.layers,this.add(r);let a=new zt(Hs,Gs,e,t);a.layers=this.layers,this.add(a);let o=new zt(Hs,Gs,e,t);o.layers=this.layers,this.add(o);let l=new zt(Hs,Gs,e,t);l.layers=this.layers,this.add(l);let c=new zt(Hs,Gs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Yn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ys)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},Co=class extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Kc="\\[\\]\\.:\\/",Lp=new RegExp("["+Kc+"]","g"),Zc="[^"+Kc+"]",Np="[^"+Kc.replace("\\.","")+"]",Dp=/((?:WC+[\/:])*)/.source.replace("WC",Zc),Op=/(WCOD+)?/.source.replace("WCOD",Np),Up=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Zc),Fp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Zc),Bp=new RegExp("^"+Dp+Op+Up+Fp+"$"),kp=["material","materials","bones","map"],Mc=class{constructor(e,t,n){let s=n||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Lp,"")}static parseTrackName(e){let t=Bp.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);kp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ge("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ge("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ge("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ge("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ge("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Ge("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Mc;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var fy=new Float32Array(1);var Li=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=nt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(nt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var bc=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var oa=class extends Jn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Jc(i,e,t,n){let s=zp(n);switch(t){case Vc:return i*e;case Bo:return i*e/s.components*s.byteLength;case ko:return i*e/s.components*s.byteLength;case ns:return i*e*2/s.components*s.byteLength;case zo:return i*e*2/s.components*s.byteLength;case Hc:return i*e*3/s.components*s.byteLength;case Nn:return i*e*4/s.components*s.byteLength;case Vo:return i*e*4/s.components*s.byteLength;case ua:case fa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case da:case pa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Go:case Xo:return Math.max(i,16)*Math.max(e,8)/4;case Ho:case Wo:return Math.max(i,8)*Math.max(e,8)/2;case qo:case Yo:case Zo:case Jo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ko:case ma:case $o:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case jo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Qo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case el:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case tl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case nl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case il:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case sl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case rl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case al:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ol:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ll:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case cl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case hl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ul:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case fl:case dl:case pl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ml:case gl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ga:case _l:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function zp(i){switch(i){case Mn:case Fc:return{byteLength:1,components:1};case ur:case Bc:case ti:return{byteLength:2,components:1};case Uo:case Fo:return{byteLength:2,components:4};case ei:case Oo:case Ln:return{byteLength:4,components:1};case kc:case zc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Yf(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Hp(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((d,x)=>d.start-x.start);let f=0;for(let d=1;d<u.length;d++){let x=u[f],v=u[d];v.start<=x.start+x.count+1?x.count=Math.max(x.count,v.start+v.count-x.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,x=u.length;d<x;d++){let v=u[d];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Gp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Xp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,qp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Kp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Jp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$p=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,jp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,em=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,tm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,nm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,im=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,sm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,rm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,am=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,om=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,lm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,cm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,hm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,um=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,fm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,dm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,pm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,mm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,_m=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,xm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ym="gl_FragColor = linearToOutputTexel( gl_FragColor );",vm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Sm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Mm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,bm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Em=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Tm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Am=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,wm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Rm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Cm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Im=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Pm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Lm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Nm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Dm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Om=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Um=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Fm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Bm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,km=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,zm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Vm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Hm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Gm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Wm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Xm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,qm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ym=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Km=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Jm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$m=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,jm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Qm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,eg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,tg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ng=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ig=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ag=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,og=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,lg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,cg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ug=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,fg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,dg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,pg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,mg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,gg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_g=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,yg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Eg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Tg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ag=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,wg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Rg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Cg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ig=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Pg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Lg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ng=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Dg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Og=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ug=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Fg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Bg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,kg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,zg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Hg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Gg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Jg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,$g=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,jg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Qg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,e_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,t_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,n_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,i_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,s_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,a_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,o_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,l_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,h_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,u_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,f_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,p_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,m_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,g_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,__=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,x_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,y_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,v_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,S_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,M_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,et={alphahash_fragment:Gp,alphahash_pars_fragment:Wp,alphamap_fragment:Xp,alphamap_pars_fragment:qp,alphatest_fragment:Yp,alphatest_pars_fragment:Kp,aomap_fragment:Zp,aomap_pars_fragment:Jp,batching_pars_vertex:$p,batching_vertex:jp,begin_vertex:Qp,beginnormal_vertex:em,bsdfs:tm,iridescence_fragment:nm,bumpmap_pars_fragment:im,clipping_planes_fragment:sm,clipping_planes_pars_fragment:rm,clipping_planes_pars_vertex:am,clipping_planes_vertex:om,color_fragment:lm,color_pars_fragment:cm,color_pars_vertex:hm,color_vertex:um,common:fm,cube_uv_reflection_fragment:dm,defaultnormal_vertex:pm,displacementmap_pars_vertex:mm,displacementmap_vertex:gm,emissivemap_fragment:_m,emissivemap_pars_fragment:xm,colorspace_fragment:ym,colorspace_pars_fragment:vm,envmap_fragment:Sm,envmap_common_pars_fragment:Mm,envmap_pars_fragment:bm,envmap_pars_vertex:Em,envmap_physical_pars_fragment:Om,envmap_vertex:Tm,fog_vertex:Am,fog_pars_vertex:wm,fog_fragment:Rm,fog_pars_fragment:Cm,gradientmap_pars_fragment:Im,lightmap_pars_fragment:Pm,lights_lambert_fragment:Lm,lights_lambert_pars_fragment:Nm,lights_pars_begin:Dm,lights_toon_fragment:Um,lights_toon_pars_fragment:Fm,lights_phong_fragment:Bm,lights_phong_pars_fragment:km,lights_physical_fragment:zm,lights_physical_pars_fragment:Vm,lights_fragment_begin:Hm,lights_fragment_maps:Gm,lights_fragment_end:Wm,lightprobes_pars_fragment:Xm,logdepthbuf_fragment:qm,logdepthbuf_pars_fragment:Ym,logdepthbuf_pars_vertex:Km,logdepthbuf_vertex:Zm,map_fragment:Jm,map_pars_fragment:$m,map_particle_fragment:jm,map_particle_pars_fragment:Qm,metalnessmap_fragment:eg,metalnessmap_pars_fragment:tg,morphinstance_vertex:ng,morphcolor_vertex:ig,morphnormal_vertex:sg,morphtarget_pars_vertex:rg,morphtarget_vertex:ag,normal_fragment_begin:og,normal_fragment_maps:lg,normal_pars_fragment:cg,normal_pars_vertex:hg,normal_vertex:ug,normalmap_pars_fragment:fg,clearcoat_normal_fragment_begin:dg,clearcoat_normal_fragment_maps:pg,clearcoat_pars_fragment:mg,iridescence_pars_fragment:gg,opaque_fragment:_g,packing:xg,premultiplied_alpha_fragment:yg,project_vertex:vg,dithering_fragment:Sg,dithering_pars_fragment:Mg,roughnessmap_fragment:bg,roughnessmap_pars_fragment:Eg,shadowmap_pars_fragment:Tg,shadowmap_pars_vertex:Ag,shadowmap_vertex:wg,shadowmask_pars_fragment:Rg,skinbase_vertex:Cg,skinning_pars_vertex:Ig,skinning_vertex:Pg,skinnormal_vertex:Lg,specularmap_fragment:Ng,specularmap_pars_fragment:Dg,tonemapping_fragment:Og,tonemapping_pars_fragment:Ug,transmission_fragment:Fg,transmission_pars_fragment:Bg,uv_pars_fragment:kg,uv_pars_vertex:zg,uv_vertex:Vg,worldpos_vertex:Hg,background_vert:Gg,background_frag:Wg,backgroundCube_vert:Xg,backgroundCube_frag:qg,cube_vert:Yg,cube_frag:Kg,depth_vert:Zg,depth_frag:Jg,distance_vert:$g,distance_frag:jg,equirect_vert:Qg,equirect_frag:e_,linedashed_vert:t_,linedashed_frag:n_,meshbasic_vert:i_,meshbasic_frag:s_,meshlambert_vert:r_,meshlambert_frag:a_,meshmatcap_vert:o_,meshmatcap_frag:l_,meshnormal_vert:c_,meshnormal_frag:h_,meshphong_vert:u_,meshphong_frag:f_,meshphysical_vert:d_,meshphysical_frag:p_,meshtoon_vert:m_,meshtoon_frag:g_,points_vert:__,points_frag:x_,shadow_vert:y_,shadow_frag:v_,sprite_vert:S_,sprite_frag:M_},ve={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},mi={basic:{uniforms:on([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:et.meshbasic_vert,fragmentShader:et.meshbasic_frag},lambert:{uniforms:on([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:et.meshlambert_vert,fragmentShader:et.meshlambert_frag},phong:{uniforms:on([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:et.meshphong_vert,fragmentShader:et.meshphong_frag},standard:{uniforms:on([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag},toon:{uniforms:on([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Be(0)}}]),vertexShader:et.meshtoon_vert,fragmentShader:et.meshtoon_frag},matcap:{uniforms:on([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:et.meshmatcap_vert,fragmentShader:et.meshmatcap_frag},points:{uniforms:on([ve.points,ve.fog]),vertexShader:et.points_vert,fragmentShader:et.points_frag},dashed:{uniforms:on([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:et.linedashed_vert,fragmentShader:et.linedashed_frag},depth:{uniforms:on([ve.common,ve.displacementmap]),vertexShader:et.depth_vert,fragmentShader:et.depth_frag},normal:{uniforms:on([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:et.meshnormal_vert,fragmentShader:et.meshnormal_frag},sprite:{uniforms:on([ve.sprite,ve.fog]),vertexShader:et.sprite_vert,fragmentShader:et.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:et.background_vert,fragmentShader:et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:et.backgroundCube_vert,fragmentShader:et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:et.cube_vert,fragmentShader:et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:et.equirect_vert,fragmentShader:et.equirect_frag},distance:{uniforms:on([ve.common,ve.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:et.distance_vert,fragmentShader:et.distance_frag},shadow:{uniforms:on([ve.lights,ve.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:et.shadow_vert,fragmentShader:et.shadow_frag}};mi.physical={uniforms:on([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:et.meshphysical_vert,fragmentShader:et.meshphysical_frag};var vl={r:0,b:0,g:0},b_=new je,Kf=new Ye;Kf.set(-1,0,0,0,1,0,0,0,1);function E_(i,e,t,n,s,r){let a=new Be(0),o=s===!0?0:1,l,c,h=null,u=0,f=null;function d(R){let L=R.isScene===!0?R.background:null;if(L&&L.isTexture){let S=R.backgroundBlurriness>0;L=e.get(L,S)}return L}function x(R){let L=!1,S=d(R);S===null?m(a,o):S&&S.isColor&&(m(S,1),L=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||L)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(R,L){let S=d(L);S&&(S.isCubeTexture||S.mapping===ha)?(c===void 0&&(c=new yt(new Ki(1,1,1),new Pn({name:"BackgroundCubeMaterial",uniforms:Ss(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,A,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=L.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(b_.makeRotationFromEuler(L.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Kf),c.material.toneMapped=tt.getTransfer(S.colorSpace)!==ut,(h!==S||u!==S.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=S,u=S.version,f=i.toneMapping),c.layers.enableAll(),R.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new yt(new jr(2,2),new Pn({name:"BackgroundMaterial",uniforms:Ss(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,l.material.toneMapped=tt.getTransfer(S.colorSpace)!==ut,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||u!==S.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,h=S,u=S.version,f=i.toneMapping),l.layers.enableAll(),R.unshift(l,l.geometry,l.material,0,0,null))}function m(R,L){R.getRGB(vl,Yc(i)),t.buffers.color.setClear(vl.r,vl.g,vl.b,L,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(R,L=1){a.set(R),o=L,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(R){o=R,m(a,o)},render:x,addToRenderList:v,dispose:p}}function T_(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,a=!1;function o(N,V,G,M,C){let b=!1,z=u(N,M,G,V);r!==z&&(r=z,c(r.object)),b=d(N,M,G,C),b&&x(N,M,G,C),C!==null&&e.update(C,i.ELEMENT_ARRAY_BUFFER),(b||a)&&(a=!1,S(N,V,G,M),C!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(C).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function u(N,V,G,M){let C=M.wireframe===!0,b=n[V.id];b===void 0&&(b={},n[V.id]=b);let z=N.isInstancedMesh===!0?N.id:0,B=b[z];B===void 0&&(B={},b[z]=B);let H=B[G.id];H===void 0&&(H={},B[G.id]=H);let Z=H[C];return Z===void 0&&(Z=f(l()),H[C]=Z),Z}function f(N){let V=[],G=[],M=[];for(let C=0;C<t;C++)V[C]=0,G[C]=0,M[C]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:G,attributeDivisors:M,object:N,attributes:{},index:null}}function d(N,V,G,M){let C=r.attributes,b=V.attributes,z=0,B=G.getAttributes();for(let H in B)if(B[H].location>=0){let X=C[H],oe=b[H];if(oe===void 0&&(H==="instanceMatrix"&&N.instanceMatrix&&(oe=N.instanceMatrix),H==="instanceColor"&&N.instanceColor&&(oe=N.instanceColor)),X===void 0||X.attribute!==oe||oe&&X.data!==oe.data)return!0;z++}return r.attributesNum!==z||r.index!==M}function x(N,V,G,M){let C={},b=V.attributes,z=0,B=G.getAttributes();for(let H in B)if(B[H].location>=0){let X=b[H];X===void 0&&(H==="instanceMatrix"&&N.instanceMatrix&&(X=N.instanceMatrix),H==="instanceColor"&&N.instanceColor&&(X=N.instanceColor));let oe={};oe.attribute=X,X&&X.data&&(oe.data=X.data),C[H]=oe,z++}r.attributes=C,r.attributesNum=z,r.index=M}function v(){let N=r.newAttributes;for(let V=0,G=N.length;V<G;V++)N[V]=0}function m(N){p(N,0)}function p(N,V){let G=r.newAttributes,M=r.enabledAttributes,C=r.attributeDivisors;G[N]=1,M[N]===0&&(i.enableVertexAttribArray(N),M[N]=1),C[N]!==V&&(i.vertexAttribDivisor(N,V),C[N]=V)}function R(){let N=r.newAttributes,V=r.enabledAttributes;for(let G=0,M=V.length;G<M;G++)V[G]!==N[G]&&(i.disableVertexAttribArray(G),V[G]=0)}function L(N,V,G,M,C,b,z){z===!0?i.vertexAttribIPointer(N,V,G,C,b):i.vertexAttribPointer(N,V,G,M,C,b)}function S(N,V,G,M){v();let C=M.attributes,b=G.getAttributes(),z=V.defaultAttributeValues;for(let B in b){let H=b[B];if(H.location>=0){let Z=C[B];if(Z===void 0&&(B==="instanceMatrix"&&N.instanceMatrix&&(Z=N.instanceMatrix),B==="instanceColor"&&N.instanceColor&&(Z=N.instanceColor)),Z!==void 0){let X=Z.normalized,oe=Z.itemSize,ae=e.get(Z);if(ae===void 0)continue;let Ue=ae.buffer,we=ae.type,Te=ae.bytesPerElement,K=we===i.INT||we===i.UNSIGNED_INT||Z.gpuType===Oo;if(Z.isInterleavedBufferAttribute){let j=Z.data,le=j.stride,me=Z.offset;if(j.isInstancedInterleavedBuffer){for(let se=0;se<H.locationSize;se++)p(H.location+se,j.meshPerAttribute);N.isInstancedMesh!==!0&&M._maxInstanceCount===void 0&&(M._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let se=0;se<H.locationSize;se++)m(H.location+se);i.bindBuffer(i.ARRAY_BUFFER,Ue);for(let se=0;se<H.locationSize;se++)L(H.location+se,oe/H.locationSize,we,X,le*Te,(me+oe/H.locationSize*se)*Te,K)}else{if(Z.isInstancedBufferAttribute){for(let j=0;j<H.locationSize;j++)p(H.location+j,Z.meshPerAttribute);N.isInstancedMesh!==!0&&M._maxInstanceCount===void 0&&(M._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let j=0;j<H.locationSize;j++)m(H.location+j);i.bindBuffer(i.ARRAY_BUFFER,Ue);for(let j=0;j<H.locationSize;j++)L(H.location+j,oe/H.locationSize,we,X,oe*Te,oe/H.locationSize*j*Te,K)}}else if(z!==void 0){let X=z[B];if(X!==void 0)switch(X.length){case 2:i.vertexAttrib2fv(H.location,X);break;case 3:i.vertexAttrib3fv(H.location,X);break;case 4:i.vertexAttrib4fv(H.location,X);break;default:i.vertexAttrib1fv(H.location,X)}}}}R()}function E(){T();for(let N in n){let V=n[N];for(let G in V){let M=V[G];for(let C in M){let b=M[C];for(let z in b)h(b[z].object),delete b[z];delete M[C]}}delete n[N]}}function A(N){if(n[N.id]===void 0)return;let V=n[N.id];for(let G in V){let M=V[G];for(let C in M){let b=M[C];for(let z in b)h(b[z].object),delete b[z];delete M[C]}}delete n[N.id]}function I(N){for(let V in n){let G=n[V];for(let M in G){let C=G[M];if(C[N.id]===void 0)continue;let b=C[N.id];for(let z in b)h(b[z].object),delete b[z];delete C[N.id]}}}function g(N){for(let V in n){let G=n[V],M=N.isInstancedMesh===!0?N.id:0,C=G[M];if(C!==void 0){for(let b in C){let z=C[b];for(let B in z)h(z[B].object),delete z[B];delete C[b]}delete G[M],Object.keys(G).length===0&&delete n[V]}}}function T(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfObject:g,releaseStatesOfProgram:I,initAttributes:v,enableAttribute:m,disableUnusedAttributes:R}}function A_(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let f=0;for(let d=0;d<h;d++)f+=c[d];t.update(f,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function w_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(I){return!(I!==Nn&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){let g=I===ti&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==Mn&&I!==Ln&&!g&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(I){if(I==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Oe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),R=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),L=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),A=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:x,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:R,maxVaryings:L,maxFragmentUniforms:S,maxSamples:E,samples:A}}function R_(i){let e=this,t=null,n=0,s=!1,r=!1,a=new In,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||n!==0||s;return s=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){let x=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||x===null||x.length===0||r&&!m)r?h(null):c();else{let R=r?0:n,L=R*4,S=p.clippingState||null;l.value=S,S=h(x,f,L,d);for(let E=0;E!==L;++E)S[E]=t[E];p.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=R}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,x){let v=u!==null?u.length:0,m=null;if(v!==0){if(m=l.value,x!==!0||m===null){let p=d+v*4,R=f.matrixWorldInverse;o.getNormalMatrix(R),(m===null||m.length<p)&&(m=new Float32Array(p));for(let L=0,S=d;L!==v;++L,S+=4)a.copy(u[L]).applyMatrix4(R,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}var mr=4,C_=6,I_=20,P_=256,ya=new Ji,Af=new Be,$c=null,jc=0,Qc=0,eh=!1,L_=new k,Ms=new k,_r=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=L_}=r;$c=this._renderer.getRenderTarget(),jc=this._renderer.getActiveCubeFace(),Qc=this._renderer.getActiveMipmapLevel(),eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget($c,jc,Qc),this._renderer.xr.enabled=eh,e.scissorTest=!1,pr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===es||e.mapping===ys?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),$c=this._renderer.getRenderTarget(),jc=this._renderer.getActiveCubeFace(),Qc=this._renderer.getActiveMipmapLevel(),eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Dt,minFilter:Dt,generateMipmaps:!1,type:ti,format:Nn,colorSpace:fn,depthBuffer:!1},s=wf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wf(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=N_(r)),this._blurMaterial=O_(r,e,t),this._ggxMaterial=D_(r,e,t)}return s}_compileMaterial(e){let t=new yt(new jt,e);this._renderer.compile(t,ya)}_sceneToCubeUV(e,t,n,s,r){let l=new zt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(Af),u.toneMapping=jn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new yt(new Ki,new $n({name:"PMREM.Background",side:Qt,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,p=!1,R=e.background;R?R.isColor&&(m.color.copy(R),e.background=null,p=!0):(m.color.copy(Af),p=!0);for(let L=0;L<6;L++){let S=L%3;S===0?(l.up.set(0,c[L],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[L],r.y,r.z)):S===1?(l.up.set(0,0,c[L]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[L],r.z)):(l.up.set(0,c[L],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[L]));let E=this._cubeSize;pr(s,S*E,L>2?E:0,E,E),u.setRenderTarget(s),p&&u.render(v,l),u.render(e,l)}u.toneMapping=d,u.autoClear=f,e.background=R}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===es||e.mapping===ys;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rf());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;pr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,ya)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),f=c*1.25,d=u*f,{_lodMax:x}=this,v=this._sizeLods[n],m=3*v*(n>x-mr?n-x+mr:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=x-t,pr(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(o,ya),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=x-n,pr(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(o,ya)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-mr?s-this._lodMax+mr:0),f=4*(this._cubeSize-h);pr(t,u,f,3*h,2*h),a.setRenderTarget(t),a.render(l,ya)}};function N_(i){let e=[],t=[],n=i,s=i-mr+1+C_;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,f=6,d=3,x=new Float32Array(d*f*u),v=new Float32Array(d*f*u);for(let p=0;p<u;p++){let R=p%3*2/3-1,L=p>2?0:-1,S=[R,L,0,R+2/3,L,0,R+2/3,L+1,0,R,L,0,R+2/3,L+1,0,R,L+1,0];x.set(S,d*f*p);for(let E=0;E<f;E++){let A=h[E*2]*2-1,I=h[E*2+1]*2-1;p===0?Ms.set(1,I,A):p===1?Ms.set(-A,1,-I):p===2?Ms.set(-A,I,1):p===3?Ms.set(-1,I,-A):p===4?Ms.set(-A,-1,I):Ms.set(A,I,-1),Ms.toArray(v,(p*f+E)*d)}}let m=new jt;m.setAttribute("position",new Ht(x,d)),m.setAttribute("outputDirection",new Ht(v,d)),t.push(new yt(m,null)),n>mr&&n--}return{lodMeshes:t,sizeLods:e}}function wf(i,e,t){let n=new xn(i,e,t);return n.texture.mapping=ha,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function pr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function D_(i,e,t){return new Pn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:P_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:El(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function O_(i,e,t){return new Pn({name:"SphericalGaussianBlur",defines:{SAMPLES:I_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:El(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Rf(){return new Pn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:El(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Cf(){return new Pn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:El(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function El(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ml=class extends xn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Zr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ki(5,5,5),r=new Pn({name:"CubemapFromEquirect",uniforms:Ss(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qt,blending:fi});r.uniforms.tEquirect.value=t;let a=new yt(s,r),o=t.minFilter;return t.minFilter===Qn&&(t.minFilter=Dt),new Ro(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function U_(i){let e=new WeakMap,t=new WeakMap,n=null;function s(f,d=!1){return f==null?null:d?a(f):r(f)}function r(f){if(f&&f.isTexture){let d=f.mapping;if(d===Lo||d===No)if(e.has(f)){let x=e.get(f).texture;return o(x,f.mapping)}else{let x=f.image;if(x&&x.height>0){let v=new Ml(x.height);return v.fromEquirectangularTexture(i,f),e.set(f,v),f.addEventListener("dispose",c),o(v.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){let d=f.mapping,x=d===Lo||d===No,v=d===es||d===ys;if(x||v){let m=t.get(f),p=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==p)return n===null&&(n=new _r(i)),m=x?n.fromEquirectangular(f,m):n.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let R=f.image;return x&&R&&R.height>0||v&&R&&l(R)?(n===null&&(n=new _r(i)),m=x?n.fromEquirectangular(f):n.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",h),m.texture):null}}}return f}function o(f,d){return d===Lo?f.mapping=es:d===No&&(f.mapping=ys),f}function l(f){let d=0,x=6;for(let v=0;v<x;v++)f[v]!==void 0&&d++;return d===x}function c(f){let d=f.target;d.removeEventListener("dispose",c);let x=e.get(d);x!==void 0&&(e.delete(d),x.dispose())}function h(f){let d=f.target;d.removeEventListener("dispose",h);let x=t.get(d);x!==void 0&&(t.delete(d),x.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function F_(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&cs("WebGLRenderer: "+n+" extension not supported."),s}}}function B_(i,e,t,n){let s={},r=new WeakMap;function a(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let x in f.attributes)e.remove(f.attributes[x]);f.removeEventListener("dispose",a),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let d in f)e.update(f[d],i.ARRAY_BUFFER)}function c(u){let f=[],d=u.index,x=u.attributes.position,v=0;if(x===void 0)return;if(d!==null){let R=d.array;v=d.version;for(let L=0,S=R.length;L<S;L+=3){let E=R[L+0],A=R[L+1],I=R[L+2];f.push(E,A,A,I,I,E)}}else{let R=x.array;v=x.version;for(let L=0,S=R.length/3-1;L<S;L+=3){let E=L+0,A=L+1,I=L+2;f.push(E,A,A,I,I,E)}}let m=new(x.count>=65535?Gr:Hr)(f,1);m.version=v;let p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){let f=r.get(u);if(f){let d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function k_(i,e,t){let n;function s(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,f){i.drawElements(n,f,r,u*a),t.update(f,n,1)}function c(u,f,d){d!==0&&(i.drawElementsInstanced(n,f,r,u*a,d),t.update(f,n,d))}function h(u,f,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,u,0,d);let v=0;for(let m=0;m<d;m++)v+=f[m];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function z_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ge("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function V_(i,e,t){let n=new WeakMap,s=new dt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,f=n.get(o);if(f===void 0||f.count!==u){let T=function(){I.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();let d=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],R=o.morphAttributes.color||[],L=0;d===!0&&(L=1),x===!0&&(L=2),v===!0&&(L=3);let S=o.attributes.position.count*L,E=1;S>e.maxTextureSize&&(E=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);let A=new Float32Array(S*E*4*u),I=new zr(A,S,E,u);I.type=Ln,I.needsUpdate=!0;let g=L*4;for(let P=0;P<u;P++){let N=m[P],V=p[P],G=R[P],M=S*E*4*P;for(let C=0;C<N.count;C++){let b=C*g;d===!0&&(s.fromBufferAttribute(N,C),A[M+b+0]=s.x,A[M+b+1]=s.y,A[M+b+2]=s.z,A[M+b+3]=0),x===!0&&(s.fromBufferAttribute(V,C),A[M+b+4]=s.x,A[M+b+5]=s.y,A[M+b+6]=s.z,A[M+b+7]=0),v===!0&&(s.fromBufferAttribute(G,C),A[M+b+8]=s.x,A[M+b+9]=s.y,A[M+b+10]=s.z,A[M+b+11]=G.itemSize===4?s.w:1)}}f={count:u,texture:I,size:new ke(S,E)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let d=0;for(let v=0;v<c.length;v++)d+=c[v];let x=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function H_(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,u=c.geometry,f=e.get(c,u);if(r.get(f)!==h&&(e.update(f),r.set(f,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==h&&(d.update(),r.set(d,h))}return f}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var G_={[Ic]:"LINEAR_TONE_MAPPING",[Pc]:"REINHARD_TONE_MAPPING",[Lc]:"CINEON_TONE_MAPPING",[ca]:"ACES_FILMIC_TONE_MAPPING",[Dc]:"AGX_TONE_MAPPING",[Oc]:"NEUTRAL_TONE_MAPPING",[Nc]:"CUSTOM_TONE_MAPPING"};function W_(i,e,t,n,s,r){let a=new xn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new jt;c.setAttribute("position",new Kt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Kt([0,2,0,0,2,0],2));let h=new yo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new yt(c,h),f=new Ji(-1,1,1,-1,0,1),d=null,x=null,v=!1,m,p=null,R=[],L=!1;this.setSize=function(S,E){a.setSize(S,E),o!==null&&o.setSize(S,E),l!==null&&l.setSize(S,E);for(let A=0;A<R.length;A++){let I=R[A];I.setSize&&I.setSize(S,E)}},this.setEffects=function(S){R=S,L=R.length>0&&R[0].isRenderPass===!0;let E=a.width,A=a.height;R.length>0&&o===null&&(o=new xn(E,A,{type:ti,depthBuffer:!1,stencilBuffer:!1}),l=new xn(E,A,{type:ti,depthBuffer:!1,stencilBuffer:!1}));for(let I=0;I<R.length;I++){let g=R[I];g.setSize&&g.setSize(E,A)}},this.begin=function(S,E){if(v||S.toneMapping===jn&&R.length===0)return!1;if(p=E,E!==null){let A=E.width,I=E.height;(a.width!==A||a.height!==I)&&this.setSize(A,I)}return L===!1&&S.setRenderTarget(a),m=S.toneMapping,S.toneMapping=jn,!0},this.hasRenderPass=function(){return L},this.end=function(S,E){S.toneMapping=m,v=!0;let A=a,I=o;for(let g=0;g<R.length;g++){let T=R[g];T.enabled!==!1&&(T.render(S,I,A,E),T.needsSwap!==!1&&(A=I,I=I===o?l:o))}if(d!==S.outputColorSpace||x!==S.toneMapping){d=S.outputColorSpace,x=S.toneMapping,h.defines={},tt.getTransfer(d)===ut&&(h.defines.SRGB_TRANSFER="");let g=G_[x];g&&(h.defines[g]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=A.texture,S.setRenderTarget(p),S.render(u,f),p=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Zf=new Zt,ih=new Yi(1,1),Jf=new zr,$f=new mo,jf=new Zr,If=[],Pf=[],Lf=new Float32Array(16),Nf=new Float32Array(9),Df=new Float32Array(4);function xr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=If[s];if(r===void 0&&(r=new Float32Array(s),If[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Gt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Tl(i,e){let t=Pf[e];t===void 0&&(t=new Int32Array(e),Pf[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function X_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function q_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2fv(this.addr,e),Wt(t,e)}}function Y_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Gt(t,e))return;i.uniform3fv(this.addr,e),Wt(t,e)}}function K_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4fv(this.addr,e),Wt(t,e)}}function Z_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,n))return;Df.set(n),i.uniformMatrix2fv(this.addr,!1,Df),Wt(t,n)}}function J_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,n))return;Nf.set(n),i.uniformMatrix3fv(this.addr,!1,Nf),Wt(t,n)}}function $_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Gt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Wt(t,e)}else{if(Gt(t,n))return;Lf.set(n),i.uniformMatrix4fv(this.addr,!1,Lf),Wt(t,n)}}function j_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Q_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2iv(this.addr,e),Wt(t,e)}}function e0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;i.uniform3iv(this.addr,e),Wt(t,e)}}function t0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4iv(this.addr,e),Wt(t,e)}}function n0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function i0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Gt(t,e))return;i.uniform2uiv(this.addr,e),Wt(t,e)}}function s0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Gt(t,e))return;i.uniform3uiv(this.addr,e),Wt(t,e)}}function r0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Gt(t,e))return;i.uniform4uiv(this.addr,e),Wt(t,e)}}function a0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ih.compareFunction=t.isReversedDepthBuffer()?yl:xl,r=ih):r=Zf,t.setTexture2D(e||r,s)}function o0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||$f,s)}function l0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||jf,s)}function c0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Jf,s)}function h0(i){switch(i){case 5126:return X_;case 35664:return q_;case 35665:return Y_;case 35666:return K_;case 35674:return Z_;case 35675:return J_;case 35676:return $_;case 5124:case 35670:return j_;case 35667:case 35671:return Q_;case 35668:case 35672:return e0;case 35669:case 35673:return t0;case 5125:return n0;case 36294:return i0;case 36295:return s0;case 36296:return r0;case 35678:case 36198:case 36298:case 36306:case 35682:return a0;case 35679:case 36299:case 36307:return o0;case 35680:case 36300:case 36308:case 36293:return l0;case 36289:case 36303:case 36311:case 36292:return c0}}function u0(i,e){i.uniform1fv(this.addr,e)}function f0(i,e){let t=xr(e,this.size,2);i.uniform2fv(this.addr,t)}function d0(i,e){let t=xr(e,this.size,3);i.uniform3fv(this.addr,t)}function p0(i,e){let t=xr(e,this.size,4);i.uniform4fv(this.addr,t)}function m0(i,e){let t=xr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function g0(i,e){let t=xr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function _0(i,e){let t=xr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function x0(i,e){i.uniform1iv(this.addr,e)}function y0(i,e){i.uniform2iv(this.addr,e)}function v0(i,e){i.uniform3iv(this.addr,e)}function S0(i,e){i.uniform4iv(this.addr,e)}function M0(i,e){i.uniform1uiv(this.addr,e)}function b0(i,e){i.uniform2uiv(this.addr,e)}function E0(i,e){i.uniform3uiv(this.addr,e)}function T0(i,e){i.uniform4uiv(this.addr,e)}function A0(i,e,t){let n=this.cache,s=e.length,r=Tl(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Wt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=ih:a=Zf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function w0(i,e,t){let n=this.cache,s=e.length,r=Tl(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Wt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||$f,r[a])}function R0(i,e,t){let n=this.cache,s=e.length,r=Tl(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Wt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||jf,r[a])}function C0(i,e,t){let n=this.cache,s=e.length,r=Tl(t,s);Gt(n,r)||(i.uniform1iv(this.addr,r),Wt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Jf,r[a])}function I0(i){switch(i){case 5126:return u0;case 35664:return f0;case 35665:return d0;case 35666:return p0;case 35674:return m0;case 35675:return g0;case 35676:return _0;case 5124:case 35670:return x0;case 35667:case 35671:return y0;case 35668:case 35672:return v0;case 35669:case 35673:return S0;case 5125:return M0;case 36294:return b0;case 36295:return E0;case 36296:return T0;case 35678:case 36198:case 36298:case 36306:case 35682:return A0;case 35679:case 36299:case 36307:return w0;case 35680:case 36300:case 36308:case 36293:return R0;case 36289:case 36303:case 36311:case 36292:return C0}}var sh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=h0(t.type)}},rh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=I0(t.type)}},ah=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},th=/(\w+)(\])?(\[|\.)?/g;function Of(i,e){i.seq.push(e),i.map[e.id]=e}function P0(i,e,t){let n=i.name,s=n.length;for(th.lastIndex=0;;){let r=th.exec(n),a=th.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Of(t,c===void 0?new sh(o,i,e):new rh(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new ah(o),Of(t,u)),t=u}}}var gr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);P0(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Uf(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var L0=37297,N0=0;function D0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Ff=new Ye;function O0(i){tt._getMatrix(Ff,tt.workingColorSpace,i);let e=`mat3( ${Ff.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(i)){case Br:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Bf(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+D0(i.getShaderSource(e),o)}else return r}function U0(i,e){let t=O0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var F0={[Ic]:"Linear",[Pc]:"Reinhard",[Lc]:"Cineon",[ca]:"ACESFilmic",[Dc]:"AgX",[Oc]:"Neutral",[Nc]:"Custom"};function B0(i,e){let t=F0[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Sl=new k;function k0(){tt.getLuminanceCoefficients(Sl);let i=Sl.x.toFixed(4),e=Sl.y.toFixed(4),t=Sl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function z0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sa).join(`
`)}function V0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function H0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Sa(i){return i!==""}function kf(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zf(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var G0=/^[ \t]*#include +<([\w\d./]+)>/gm;function oh(i){return i.replace(G0,X0)}var W0=new Map;function X0(i,e){let t=et[e];if(t===void 0){let n=W0.get(e);if(n!==void 0)t=et[n],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return oh(t)}var q0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vf(i){return i.replace(q0,Y0)}function Y0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Hf(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var K0={[la]:"SHADOWMAP_TYPE_PCF",[lr]:"SHADOWMAP_TYPE_VSM"};function Z0(i){return K0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var J0={[es]:"ENVMAP_TYPE_CUBE",[ys]:"ENVMAP_TYPE_CUBE",[ha]:"ENVMAP_TYPE_CUBE_UV"};function $0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":J0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var j0={[ys]:"ENVMAP_MODE_REFRACTION"};function Q0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":j0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ex={[Po]:"ENVMAP_BLENDING_MULTIPLY",[rf]:"ENVMAP_BLENDING_MIX",[af]:"ENVMAP_BLENDING_ADD"};function tx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":ex[i.combine]||"ENVMAP_BLENDING_NONE"}function nx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function ix(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=Z0(t),c=$0(t),h=Q0(t),u=tx(t),f=nx(t),d=z0(t),x=V0(r),v=s.createProgram(),m,p,R=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Sa).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Sa).join(`
`),p.length>0&&(p+=`
`)):(m=[Hf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sa).join(`
`),p=[Hf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==jn?"#define TONE_MAPPING":"",t.toneMapping!==jn?et.tonemapping_pars_fragment:"",t.toneMapping!==jn?B0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",et.colorspace_pars_fragment,U0("linearToOutputTexel",t.outputColorSpace),k0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Sa).join(`
`)),a=oh(a),a=kf(a,t),a=zf(a,t),o=oh(o),o=kf(o,t),o=zf(o,t),a=Vf(a),o=Vf(o),t.isRawShaderMaterial!==!0&&(R=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Xc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let L=R+m+a,S=R+p+o,E=Uf(s,s.VERTEX_SHADER,L),A=Uf(s,s.FRAGMENT_SHADER,S);s.attachShader(v,E),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function I(N){if(i.debug.checkShaderErrors){let V=s.getProgramInfoLog(v)||"",G=s.getShaderInfoLog(E)||"",M=s.getShaderInfoLog(A)||"",C=V.trim(),b=G.trim(),z=M.trim(),B=!0,H=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,E,A);else{let Z=Bf(s,E,"vertex"),X=Bf(s,A,"fragment");Ge("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+C+`
`+Z+`
`+X)}else C!==""?Oe("WebGLProgram: Program Info Log:",C):(b===""||z==="")&&(H=!1);H&&(N.diagnostics={runnable:B,programLog:C,vertexShader:{log:b,prefix:m},fragmentShader:{log:z,prefix:p}})}s.deleteShader(E),s.deleteShader(A),g=new gr(s,v),T=H0(s,v)}let g;this.getUniforms=function(){return g===void 0&&I(this),g};let T;this.getAttributes=function(){return T===void 0&&I(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(v,L0)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=N0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=A,this}var sx=0,lh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ch(e),t.set(e,n)),n}},ch=class{constructor(e){this.id=sx++,this.code=e,this.usedTimes=0}};function rx(i){return i===ns||i===ma||i===ga}function ax(i,e,t,n,s,r){let a=new Vr,o=new lh,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,f=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(g){return l.add(g),g===0?"uv":`uv${g}`}function v(g,T,P,N,V,G){let M=N.fog,C=V.geometry,b=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?N.environment:null,z=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,B=e.get(g.envMap||b,z),H=B&&B.mapping===ha?B.image.height:null,Z=d[g.type];g.precision!==null&&(f=n.getMaxPrecision(g.precision),f!==g.precision&&Oe("WebGLProgram.getParameters:",g.precision,"not supported, using",f,"instead."));let X=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,oe=X!==void 0?X.length:0,ae=0;C.morphAttributes.position!==void 0&&(ae=1),C.morphAttributes.normal!==void 0&&(ae=2),C.morphAttributes.color!==void 0&&(ae=3);let Ue,we,Te,K;if(Z){let Ke=mi[Z];Ue=Ke.vertexShader,we=Ke.fragmentShader}else{Ue=g.vertexShader,we=g.fragmentShader;let Ke=o.getVertexShaderStage(g),Je=o.getFragmentShaderStage(g);o.update(g,Ke,Je),Te=Ke.id,K=Je.id}let j=i.getRenderTarget(),le=i.state.buffers.depth.getReversed(),me=V.isInstancedMesh===!0,se=V.isBatchedMesh===!0,Ce=!!g.map,rt=!!g.matcap,De=!!B,ze=!!g.aoMap,Xe=!!g.lightMap,Le=!!g.bumpMap&&g.wireframe===!1,ot=!!g.normalMap,gt=!!g.displacementMap,Tt=!!g.emissiveMap,Ve=!!g.metalnessMap,Ze=!!g.roughnessMap,O=g.anisotropy>0,vt=g.clearcoat>0,qe=g.dispersion>0,w=g.retroreflectivity>0,_=g.iridescence>0,D=g.sheen>0,W=g.transmission>0,J=O&&!!g.anisotropyMap,ie=vt&&!!g.clearcoatMap,he=vt&&!!g.clearcoatNormalMap,Q=vt&&!!g.clearcoatRoughnessMap,te=_&&!!g.iridescenceMap,ge=_&&!!g.iridescenceThicknessMap,Ee=D&&!!g.sheenColorMap,ue=D&&!!g.sheenRoughnessMap,fe=!!g.specularMap,_e=!!g.specularColorMap,ce=!!g.specularIntensityMap,He=W&&!!g.transmissionMap,U=W&&!!g.thicknessMap,pe=!!g.gradientMap,ee=!!g.alphaMap,de=g.alphaTest>0,xe=!!g.alphaHash,ne=!!g.extensions,ye=jn;g.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(ye=i.toneMapping);let re={shaderID:Z,shaderType:g.type,shaderName:g.name,vertexShader:Ue,fragmentShader:we,defines:g.defines,customVertexShaderID:Te,customFragmentShaderID:K,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:f,batching:se,batchingColor:se&&V._colorsTexture!==null,instancing:me,instancingColor:me&&V.instanceColor!==null,instancingMorph:me&&V.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:tt.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Ce,matcap:rt,envMap:De,envMapMode:De&&B.mapping,envMapCubeUVHeight:H,aoMap:ze,lightMap:Xe,bumpMap:Le,normalMap:ot,displacementMap:gt,emissiveMap:Tt,normalMapObjectSpace:ot&&g.normalMapType===hf,normalMapTangentSpace:ot&&g.normalMapType===xa,packedNormalMap:ot&&g.normalMapType===xa&&rx(g.normalMap.format),metalnessMap:Ve,roughnessMap:Ze,anisotropy:O,anisotropyMap:J,clearcoat:vt,clearcoatMap:ie,clearcoatNormalMap:he,clearcoatRoughnessMap:Q,dispersion:qe,retroreflection:w,iridescence:_,iridescenceMap:te,iridescenceThicknessMap:ge,sheen:D,sheenColorMap:Ee,sheenRoughnessMap:ue,specularMap:fe,specularColorMap:_e,specularIntensityMap:ce,transmission:W,transmissionMap:He,thicknessMap:U,gradientMap:pe,opaque:g.transparent===!1&&g.blending===cr&&g.alphaToCoverage===!1,alphaMap:ee,alphaTest:de,alphaHash:xe,combine:g.combine,mapUv:Ce&&x(g.map.channel),aoMapUv:ze&&x(g.aoMap.channel),lightMapUv:Xe&&x(g.lightMap.channel),bumpMapUv:Le&&x(g.bumpMap.channel),normalMapUv:ot&&x(g.normalMap.channel),displacementMapUv:gt&&x(g.displacementMap.channel),emissiveMapUv:Tt&&x(g.emissiveMap.channel),metalnessMapUv:Ve&&x(g.metalnessMap.channel),roughnessMapUv:Ze&&x(g.roughnessMap.channel),anisotropyMapUv:J&&x(g.anisotropyMap.channel),clearcoatMapUv:ie&&x(g.clearcoatMap.channel),clearcoatNormalMapUv:he&&x(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&x(g.clearcoatRoughnessMap.channel),iridescenceMapUv:te&&x(g.iridescenceMap.channel),iridescenceThicknessMapUv:ge&&x(g.iridescenceThicknessMap.channel),sheenColorMapUv:Ee&&x(g.sheenColorMap.channel),sheenRoughnessMapUv:ue&&x(g.sheenRoughnessMap.channel),specularMapUv:fe&&x(g.specularMap.channel),specularColorMapUv:_e&&x(g.specularColorMap.channel),specularIntensityMapUv:ce&&x(g.specularIntensityMap.channel),transmissionMapUv:He&&x(g.transmissionMap.channel),thicknessMapUv:U&&x(g.thicknessMap.channel),alphaMapUv:ee&&x(g.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(ot||O),vertexNormals:!!C.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!C.attributes.uv&&(Ce||ee),fog:!!M,useFog:g.fog===!0,fogExp2:!!M&&M.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||C.attributes.normal===void 0&&ot===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:le,skinning:V.isSkinnedMesh===!0,hasPositionAttribute:C.attributes.position!==void 0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:oe,morphTextureStride:ae,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:G.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ye,decodeVideoTexture:Ce&&g.map.isVideoTexture===!0&&tt.getTransfer(g.map.colorSpace)===ut,decodeVideoTextureEmissive:Tt&&g.emissiveMap.isVideoTexture===!0&&tt.getTransfer(g.emissiveMap.colorSpace)===ut,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===zn,flipSided:g.side===Qt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:ne&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ne&&g.extensions.multiDraw===!0||se)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return re.vertexUv1s=l.has(1),re.vertexUv2s=l.has(2),re.vertexUv3s=l.has(3),l.clear(),re}function m(g){let T=[];if(g.shaderID?T.push(g.shaderID):(T.push(g.customVertexShaderID),T.push(g.customFragmentShaderID)),g.defines!==void 0)for(let P in g.defines)T.push(P),T.push(g.defines[P]);return g.isRawShaderMaterial===!1&&(p(T,g),R(T,g),T.push(i.outputColorSpace)),T.push(g.customProgramCacheKey),T.join()}function p(g,T){g.push(T.precision),g.push(T.outputColorSpace),g.push(T.envMapMode),g.push(T.envMapCubeUVHeight),g.push(T.mapUv),g.push(T.alphaMapUv),g.push(T.lightMapUv),g.push(T.aoMapUv),g.push(T.bumpMapUv),g.push(T.normalMapUv),g.push(T.displacementMapUv),g.push(T.emissiveMapUv),g.push(T.metalnessMapUv),g.push(T.roughnessMapUv),g.push(T.anisotropyMapUv),g.push(T.clearcoatMapUv),g.push(T.clearcoatNormalMapUv),g.push(T.clearcoatRoughnessMapUv),g.push(T.iridescenceMapUv),g.push(T.iridescenceThicknessMapUv),g.push(T.sheenColorMapUv),g.push(T.sheenRoughnessMapUv),g.push(T.specularMapUv),g.push(T.specularColorMapUv),g.push(T.specularIntensityMapUv),g.push(T.transmissionMapUv),g.push(T.thicknessMapUv),g.push(T.combine),g.push(T.fogExp2),g.push(T.sizeAttenuation),g.push(T.morphTargetsCount),g.push(T.morphAttributeCount),g.push(T.numSunLights),g.push(T.numDirLights),g.push(T.numPointLights),g.push(T.numSpotLights),g.push(T.numSpotLightMaps),g.push(T.numHemiLights),g.push(T.numRectAreaLights),g.push(T.numSunLightShadows),g.push(T.numDirLightShadows),g.push(T.numPointLightShadows),g.push(T.numSpotLightShadows),g.push(T.numSpotLightShadowsWithMaps),g.push(T.numLightProbes),g.push(T.shadowMapType),g.push(T.toneMapping),g.push(T.numClippingPlanes),g.push(T.numClipIntersection),g.push(T.depthPacking)}function R(g,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function L(g){let T=d[g.type],P;if(T){let N=mi[T];P=bf.clone(N.uniforms)}else P=g.uniforms;return P}function S(g,T){let P=h.get(T);return P!==void 0?++P.usedTimes:(P=new ix(i,T,g,s),c.push(P),h.set(T,P)),P}function E(g){if(--g.usedTimes===0){let T=c.indexOf(g);c[T]=c[c.length-1],c.pop(),h.delete(g.cacheKey),g.destroy()}}function A(g){o.remove(g)}function I(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:L,acquireProgram:S,releaseProgram:E,releaseShaderCache:A,programs:c,dispose:I}}function ox(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function lx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Gf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Wf(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(f){let d=0;return f.isInstancedMesh&&(d+=2),f.isSkinnedMesh&&(d+=1),d}function o(f,d,x,v,m,p){let R=i[e];return R===void 0?(R={id:f.id,object:f,geometry:d,material:x,materialVariant:a(f),groupOrder:v,renderOrder:f.renderOrder,z:m,group:p},i[e]=R):(R.id=f.id,R.object=f,R.geometry=d,R.material=x,R.materialVariant=a(f),R.groupOrder=v,R.renderOrder=f.renderOrder,R.z=m,R.group=p),e++,R}function l(f,d,x,v,m,p,R){R.reversedDepth===!0&&(m=-m);let L=o(f,d,x,v,m,p);x.transmission>0?n.push(L):x.transparent===!0?s.push(L):t.push(L)}function c(f,d,x,v,m,p){let R=o(f,d,x,v,m,p);x.transmission>0?n.unshift(R):x.transparent===!0?s.unshift(R):t.unshift(R)}function h(f,d){t.length>1&&t.sort(f||lx),n.length>1&&n.sort(d||Gf),s.length>1&&s.sort(d||Gf)}function u(){for(let f=e,d=i.length;f<d;f++){let x=i[f];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function cx(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Wf,i.set(n,[a])):s>=r.length?(a=new Wf,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function hx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new Be};break;case"SpotLight":t={position:new k,direction:new k,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new k,halfWidth:new k,halfHeight:new k};break}return i[e.id]=t,t}}}function ux(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var fx=0;function dx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function px(i){let e=new hx,t=ux(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new k);let s=new k,r=new je,a=new je;function o(c){let h=0,u=0,f=0;for(let V=0;V<9;V++)n.probe[V].set(0,0,0);let d=0,x=0,v=0,m=0,p=0,R=0,L=0,S=0,E=0,A=0,I=0,g=0,T=0,P=0;c.sort(dx);for(let V=0,G=c.length;V<G;V++){let M=c[V],C=M.color,b=M.intensity,z=M.distance,B=null;if(M.shadow&&M.shadow.map&&(M.shadow.map.texture.format===ns?B=M.shadow.map.texture:B=M.shadow.map.depthTexture||M.shadow.map.texture),M.isAmbientLight)h+=C.r*b,u+=C.g*b,f+=C.b*b;else if(M.isLightProbe){for(let H=0;H<9;H++)n.probe[H].addScaledVector(M.sh.coefficients[H],b);P++}else if(M.isSunLight){let H=e.get(M);if(H.color.copy(M.color).multiplyScalar(M.intensity),M.castShadow){let Z=M.shadow,X=t.get(M);X.shadowIntensity=Z.intensity,X.shadowBias=Z.bias,X.shadowNormalBias=Z.normalBias,X.shadowRadius=Z.radius,X.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),n.sunShadow[x]=X,n.sunShadowMap[x]=B;let oe=Z.getViewportCount();for(let ae=0;ae<oe;ae++)n.sunShadowMatrix[v+ae]=Z.getMatrix(ae),n.sunShadowCascade[v+ae]=Z._cascadeData[ae];v+=oe,x++}n.sun[d]=H,d++}else if(M.isDirectionalLight){let H=e.get(M);if(H.color.copy(M.color).multiplyScalar(M.intensity),M.castShadow){let Z=M.shadow,X=t.get(M);X.shadowIntensity=Z.intensity,X.shadowBias=Z.bias,X.shadowNormalBias=Z.normalBias,X.shadowRadius=Z.radius,X.shadowMapSize=Z.mapSize,n.directionalShadow[m]=X,n.directionalShadowMap[m]=B,n.directionalShadowMatrix[m]=M.shadow.matrix,E++}n.directional[m]=H,m++}else if(M.isSpotLight){let H=e.get(M);H.position.setFromMatrixPosition(M.matrixWorld),H.color.copy(C).multiplyScalar(b),H.distance=z,H.coneCos=Math.cos(M.angle),H.penumbraCos=Math.cos(M.angle*(1-M.penumbra)),H.decay=M.decay,n.spot[R]=H;let Z=M.shadow;if(M.map&&(n.spotLightMap[g]=M.map,g++,Z.updateMatrices(M),M.castShadow&&T++),n.spotLightMatrix[R]=Z.matrix,M.castShadow){let X=t.get(M);X.shadowIntensity=Z.intensity,X.shadowBias=Z.bias,X.shadowNormalBias=Z.normalBias,X.shadowRadius=Z.radius,X.shadowMapSize=Z.mapSize,n.spotShadow[R]=X,n.spotShadowMap[R]=B,I++}R++}else if(M.isRectAreaLight){let H=e.get(M);H.color.copy(C).multiplyScalar(b),H.halfWidth.set(M.width*.5,0,0),H.halfHeight.set(0,M.height*.5,0),n.rectArea[L]=H,L++}else if(M.isPointLight){let H=e.get(M);if(H.color.copy(M.color).multiplyScalar(M.intensity),H.distance=M.distance,H.decay=M.decay,M.castShadow){let Z=M.shadow,X=t.get(M);X.shadowIntensity=Z.intensity,X.shadowBias=Z.bias,X.shadowNormalBias=Z.normalBias,X.shadowRadius=Z.radius,X.shadowMapSize=Z.mapSize,X.shadowCameraNear=Z.camera.near,X.shadowCameraFar=Z.camera.far,n.pointShadow[p]=X,n.pointShadowMap[p]=B,n.pointShadowMatrix[p]=M.shadow.matrix,A++}n.point[p]=H,p++}else if(M.isHemisphereLight){let H=e.get(M);H.skyColor.copy(M.color).multiplyScalar(b),H.groundColor.copy(M.groundColor).multiplyScalar(b),n.hemi[S]=H,S++}}L>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;let N=n.hash;(N.sunLength!==d||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==R||N.rectAreaLength!==L||N.hemiLength!==S||N.numSunShadows!==x||N.numDirectionalShadows!==E||N.numPointShadows!==A||N.numSpotShadows!==I||N.numSpotMaps!==g||N.numLightProbes!==P)&&(n.sun.length=d,n.directional.length=m,n.spot.length=R,n.rectArea.length=L,n.point.length=p,n.hemi.length=S,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=I,n.spotShadowMap.length=I,n.spotLightMatrix.length=I+g-T,n.spotLightMap.length=g,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=P,N.sunLength=d,N.directionalLength=m,N.pointLength=p,N.spotLength=R,N.rectAreaLength=L,N.hemiLength=S,N.numSunShadows=x,N.numDirectionalShadows=E,N.numPointShadows=A,N.numSpotShadows=I,N.numSpotMaps=g,N.numLightProbes=P,n.version=fx++)}function l(c,h){let u=0,f=0,d=0,x=0,v=0,m=0,p=h.matrixWorldInverse;for(let R=0,L=c.length;R<L;R++){let S=c[R];if(S.isSunLight){let E=n.sun[u];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(p),u++}else if(S.isDirectionalLight){let E=n.directional[f];E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),f++}else if(S.isSpotLight){let E=n.spot[x];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),x++}else if(S.isRectAreaLight){let E=n.rectArea[v];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(S.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),v++}else if(S.isPointLight){let E=n.point[d];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(p),d++}else if(S.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:n}}function Xf(i){let e=new px(i),t=[],n=[],s=[];function r(f){u.camera=f,t.length=0,n.length=0,s.length=0}function a(f){t.push(f)}function o(f){n.push(f)}function l(f){s.push(f)}function c(){e.setup(t)}function h(f){e.setupView(t,f)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function mx(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Xf(i),e.set(s,[o])):r>=a.length?(o=new Xf(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var gx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,_x=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,xx=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],yx=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],qf=new je,va=new k,nh=new k;function vx(i,e,t){let n=new nr,s=new ke,r=new ke,a=new dt,o=new vo,l=new So,c={},h=t.maxTextureSize,u={[ui]:Qt,[Qt]:ui,[zn]:zn},f=new Pn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:gx,fragmentShader:_x}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let x=new jt;x.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new yt(x,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=la;let p=this.type;this.render=function(A,I,g){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;this.type===Io&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=la);let T=i.getRenderTarget(),P=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),V=i.state;V.setBlending(fi),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let G=p!==this.type;G&&I.traverse(function(M){M.material&&(Array.isArray(M.material)?M.material.forEach(C=>C.needsUpdate=!0):M.material.needsUpdate=!0)});for(let M=0,C=A.length;M<C;M++){let b=A[M],z=b.shadow;if(z===void 0){Oe("WebGLShadowMap:",b,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let B=z.getFrameExtents();s.multiply(B),r.copy(z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/B.x),s.x=r.x*B.x,z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/B.y),s.y=r.y*B.y,z.mapSize.y=r.y));let H=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=H,z.map===null||G===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===lr){if(b.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new xn(s.x,s.y,{format:ns,type:ti,minFilter:Dt,magFilter:Dt,generateMipmaps:!1}),z.map.texture.name=b.name+".shadowMap",z.map.depthTexture=new Yi(s.x,s.y,Ln),z.map.depthTexture.name=b.name+".shadowMapDepth",z.map.depthTexture.format=oi,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Nt,z.map.depthTexture.magFilter=Nt}else b.isPointLight?(z.map=new Ml(s.x),z.map.depthTexture=new xo(s.x,ei)):(z.map=new xn(s.x,s.y),z.map.depthTexture=new Yi(s.x,s.y,ei)),z.map.depthTexture.name=b.name+".shadowMap",z.map.depthTexture.format=oi,this.type===la?(z.map.depthTexture.compareFunction=H?yl:xl,z.map.depthTexture.minFilter=Dt,z.map.depthTexture.magFilter=Dt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Nt,z.map.depthTexture.magFilter=Nt);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);let Z=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();b.isPointLight!==!0&&z.updateMatrices(b,g);for(let X=0;X<Z;X++){let oe=z.getCamera(X);if(b.isPointLight){let ae=z.camera,Ue=z.matrix,we=b.distance||ae.far;we!==ae.far&&(ae.far=we,ae.updateProjectionMatrix()),va.setFromMatrixPosition(b.matrixWorld),ae.position.copy(va),nh.copy(ae.position),nh.add(xx[X]),ae.up.copy(yx[X]),ae.lookAt(nh),ae.updateMatrixWorld(),Ue.makeTranslation(-va.x,-va.y,-va.z),qf.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),z._frustum.setFromProjectionMatrix(qf,ae.coordinateSystem,ae.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,X),i.clear();else{X===0&&(i.setRenderTarget(z.map),i.clear());let ae=z.getViewport(X);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),V.viewport(a)}n=z.getFrustum(X),S(I,g,oe,b,this.type)}z.isPointLightShadow!==!0&&this.type===lr&&R(z,g),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,P,N)};function R(A,I){let g=e.update(v);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null?A.mapPass=new xn(s.x,s.y,{format:ns,type:ti}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),f.uniforms.shadow_pass.value=A.map.depthTexture,f.uniforms.resolution.value.set(A.map.width,A.map.height),f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(I,null,g,f,v,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value.set(A.map.width,A.map.height),d.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(I,null,g,d,v,null)}function L(A,I,g,T){let P=null,N=g.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(N!==void 0)P=N;else if(P=g.isPointLight===!0?l:o,i.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let V=P.uuid,G=I.uuid,M=c[V];M===void 0&&(M={},c[V]=M);let C=M[G];C===void 0&&(C=P.clone(),M[G]=C,I.addEventListener("dispose",E)),P=C}if(P.visible=I.visible,P.wireframe=I.wireframe,T===lr?P.side=I.shadowSide!==null?I.shadowSide:I.side:P.side=I.shadowSide!==null?I.shadowSide:u[I.side],P.alphaMap=I.alphaMap,P.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,P.map=I.map,P.clipShadows=I.clipShadows,P.clippingPlanes=I.clippingPlanes,P.clipIntersection=I.clipIntersection,P.displacementMap=I.displacementMap,P.displacementScale=I.displacementScale,P.displacementBias=I.displacementBias,P.wireframeLinewidth=I.wireframeLinewidth,P.linewidth=I.linewidth,g.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let V=i.properties.get(P);V.light=g}return P}function S(A,I,g,T,P){if(A.visible===!1)return;if(A.layers.test(I.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&P===lr)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(g.matrixWorldInverse,A.matrixWorld);let G=e.update(A),M=A.material;if(Array.isArray(M)){let C=G.groups;for(let b=0,z=C.length;b<z;b++){let B=C[b],H=M[B.materialIndex];if(H&&H.visible){let Z=L(A,H,T,P);A.onBeforeShadow(i,A,I,g,G,Z,B),i.renderBufferDirect(g,null,G,Z,A,B),A.onAfterShadow(i,A,I,g,G,Z,B)}}}else if(M.visible){let C=L(A,M,T,P);A.onBeforeShadow(i,A,I,g,G,C,null),i.renderBufferDirect(g,null,G,C,A,null),A.onAfterShadow(i,A,I,g,G,C,null)}}let V=A.children;for(let G=0,M=V.length;G<M;G++)S(V[G],I,g,T,P)}function E(A){A.target.removeEventListener("dispose",E);for(let g in c){let T=c[g],P=A.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function Sx(i,e){function t(){let U=!1,pe=new dt,ee=null,de=new dt(0,0,0,0);return{setMask:function(xe){ee!==xe&&!U&&(i.colorMask(xe,xe,xe,xe),ee=xe)},setLocked:function(xe){U=xe},setClear:function(xe,ne,ye,re,Ke){Ke===!0&&(xe*=re,ne*=re,ye*=re),pe.set(xe,ne,ye,re),de.equals(pe)===!1&&(i.clearColor(xe,ne,ye,re),de.copy(pe))},reset:function(){U=!1,ee=null,de.set(-1,0,0,0)}}}function n(){let U=!1,pe=!1,ee=null,de=null,xe=null;return{setReversed:function(ne){if(pe!==ne){let ye=e.get("EXT_clip_control");ne?ye.clipControlEXT(ye.LOWER_LEFT_EXT,ye.ZERO_TO_ONE_EXT):ye.clipControlEXT(ye.LOWER_LEFT_EXT,ye.NEGATIVE_ONE_TO_ONE_EXT),pe=ne;let re=xe;xe=null,this.setClear(re)}},getReversed:function(){return pe},setTest:function(ne){ne?j(i.DEPTH_TEST):le(i.DEPTH_TEST)},setMask:function(ne){ee!==ne&&!U&&(i.depthMask(ne),ee=ne)},setFunc:function(ne){if(pe&&(ne=Sf[ne]),de!==ne){switch(ne){case ro:i.depthFunc(i.NEVER);break;case ao:i.depthFunc(i.ALWAYS);break;case oo:i.depthFunc(i.LESS);break;case Xs:i.depthFunc(i.LEQUAL);break;case lo:i.depthFunc(i.EQUAL);break;case co:i.depthFunc(i.GEQUAL);break;case ho:i.depthFunc(i.GREATER);break;case uo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}de=ne}},setLocked:function(ne){U=ne},setClear:function(ne){xe!==ne&&(xe=ne,pe&&(ne=1-ne),i.clearDepth(ne))},reset:function(){U=!1,ee=null,de=null,xe=null,pe=!1}}}function s(){let U=!1,pe=null,ee=null,de=null,xe=null,ne=null,ye=null,re=null,Ke=null;return{setTest:function(Je){U||(Je?j(i.STENCIL_TEST):le(i.STENCIL_TEST))},setMask:function(Je){pe!==Je&&!U&&(i.stencilMask(Je),pe=Je)},setFunc:function(Je,It,wt){(ee!==Je||de!==It||xe!==wt)&&(i.stencilFunc(Je,It,wt),ee=Je,de=It,xe=wt)},setOp:function(Je,It,wt){(ne!==Je||ye!==It||re!==wt)&&(i.stencilOp(Je,It,wt),ne=Je,ye=It,re=wt)},setLocked:function(Je){U=Je},setClear:function(Je){Ke!==Je&&(i.clearStencil(Je),Ke=Je)},reset:function(){U=!1,pe=null,ee=null,de=null,xe=null,ne=null,ye=null,re=null,Ke=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},f={},d=new WeakMap,x=[],v=null,m=!1,p=null,R=null,L=null,S=null,E=null,A=null,I=null,g=new Be(0,0,0),T=0,P=!1,N=null,V=null,G=null,M=null,C=null,b=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,B=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(H)[1]),z=B>=1):H.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),z=B>=2);let Z=null,X={},oe=i.getParameter(i.SCISSOR_BOX),ae=i.getParameter(i.VIEWPORT),Ue=new dt().fromArray(oe),we=new dt().fromArray(ae);function Te(U,pe,ee,de){let xe=new Uint8Array(4),ne=i.createTexture();i.bindTexture(U,ne),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let ye=0;ye<ee;ye++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(pe,0,i.RGBA,1,1,de,0,i.RGBA,i.UNSIGNED_BYTE,xe):i.texImage2D(pe+ye,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xe);return ne}let K={};K[i.TEXTURE_2D]=Te(i.TEXTURE_2D,i.TEXTURE_2D,1),K[i.TEXTURE_CUBE_MAP]=Te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[i.TEXTURE_2D_ARRAY]=Te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),K[i.TEXTURE_3D]=Te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(Xs),Le(!1),ot(Ec),j(i.CULL_FACE),ze(fi);function j(U){h[U]!==!0&&(i.enable(U),h[U]=!0)}function le(U){h[U]!==!1&&(i.disable(U),h[U]=!1)}function me(U,pe){return f[U]!==pe?(i.bindFramebuffer(U,pe),f[U]=pe,U===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=pe),U===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=pe),!0):!1}function se(U,pe){let ee=x,de=!1;if(U){ee=d.get(pe),ee===void 0&&(ee=[],d.set(pe,ee));let xe=U.textures;if(ee.length!==xe.length||ee[0]!==i.COLOR_ATTACHMENT0){for(let ne=0,ye=xe.length;ne<ye;ne++)ee[ne]=i.COLOR_ATTACHMENT0+ne;ee.length=xe.length,de=!0}}else ee[0]!==i.BACK&&(ee[0]=i.BACK,de=!0);de&&i.drawBuffers(ee)}function Ce(U){return v!==U?(i.useProgram(U),v=U,!0):!1}let rt={[xs]:i.FUNC_ADD,[Vu]:i.FUNC_SUBTRACT,[Hu]:i.FUNC_REVERSE_SUBTRACT};rt[Gu]=i.MIN,rt[Wu]=i.MAX;let De={[Xu]:i.ZERO,[qu]:i.ONE,[Yu]:i.SRC_COLOR,[Rc]:i.SRC_ALPHA,[Qu]:i.SRC_ALPHA_SATURATE,[$u]:i.DST_COLOR,[Zu]:i.DST_ALPHA,[Ku]:i.ONE_MINUS_SRC_COLOR,[Cc]:i.ONE_MINUS_SRC_ALPHA,[ju]:i.ONE_MINUS_DST_COLOR,[Ju]:i.ONE_MINUS_DST_ALPHA,[ef]:i.CONSTANT_COLOR,[tf]:i.ONE_MINUS_CONSTANT_COLOR,[nf]:i.CONSTANT_ALPHA,[sf]:i.ONE_MINUS_CONSTANT_ALPHA};function ze(U,pe,ee,de,xe,ne,ye,re,Ke,Je){if(U===fi){m===!0&&(le(i.BLEND),m=!1);return}if(m===!1&&(j(i.BLEND),m=!0),U!==zu){if(U!==p||Je!==P){if((R!==xs||E!==xs)&&(i.blendEquation(i.FUNC_ADD),R=xs,E=xs),Je)switch(U){case cr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Tc:i.blendFunc(i.ONE,i.ONE);break;case Ac:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case wc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ge("WebGLState: Invalid blending: ",U);break}else switch(U){case cr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Tc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ac:Ge("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case wc:Ge("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ge("WebGLState: Invalid blending: ",U);break}L=null,S=null,A=null,I=null,g.set(0,0,0),T=0,p=U,P=Je}return}xe=xe||pe,ne=ne||ee,ye=ye||de,(pe!==R||xe!==E)&&(i.blendEquationSeparate(rt[pe],rt[xe]),R=pe,E=xe),(ee!==L||de!==S||ne!==A||ye!==I)&&(i.blendFuncSeparate(De[ee],De[de],De[ne],De[ye]),L=ee,S=de,A=ne,I=ye),(re.equals(g)===!1||Ke!==T)&&(i.blendColor(re.r,re.g,re.b,Ke),g.copy(re),T=Ke),p=U,P=!1}function Xe(U,pe){U.side===zn?le(i.CULL_FACE):j(i.CULL_FACE);let ee=U.side===Qt;pe&&(ee=!ee),Le(ee),U.blending===cr&&U.transparent===!1?ze(fi):ze(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);let de=U.stencilWrite;o.setTest(de),de&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Tt(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):le(i.SAMPLE_ALPHA_TO_COVERAGE)}function Le(U){N!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),N=U)}function ot(U){U!==Bu?(j(i.CULL_FACE),U!==V&&(U===Ec?i.cullFace(i.BACK):U===ku?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):le(i.CULL_FACE),V=U}function gt(U){U!==G&&(z&&i.lineWidth(U),G=U)}function Tt(U,pe,ee){U?(j(i.POLYGON_OFFSET_FILL),(M!==pe||C!==ee)&&(M=pe,C=ee,a.getReversed()&&(pe=-pe),i.polygonOffset(pe,ee))):le(i.POLYGON_OFFSET_FILL)}function Ve(U){U?j(i.SCISSOR_TEST):le(i.SCISSOR_TEST)}function Ze(U){U===void 0&&(U=i.TEXTURE0+b-1),Z!==U&&(i.activeTexture(U),Z=U)}function O(U,pe,ee){ee===void 0&&(Z===null?ee=i.TEXTURE0+b-1:ee=Z);let de=X[ee];de===void 0&&(de={type:void 0,texture:void 0},X[ee]=de),(de.type!==U||de.texture!==pe)&&(Z!==ee&&(i.activeTexture(ee),Z=ee),i.bindTexture(U,pe||K[U]),de.type=U,de.texture=pe)}function vt(){let U=X[Z];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function qe(){try{i.compressedTexImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function w(){try{i.compressedTexImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function _(){try{i.texSubImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function D(){try{i.texSubImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function J(){try{i.compressedTexSubImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function ie(){try{i.texStorage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function he(){try{i.texStorage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function Q(){try{i.texImage2D(...arguments)}catch(U){Ge("WebGLState:",U)}}function te(){try{i.texImage3D(...arguments)}catch(U){Ge("WebGLState:",U)}}function ge(U){return u[U]!==void 0?u[U]:i.getParameter(U)}function Ee(U,pe){u[U]!==pe&&(i.pixelStorei(U,pe),u[U]=pe)}function ue(U){Ue.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),Ue.copy(U))}function fe(U){we.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),we.copy(U))}function _e(U,pe){let ee=c.get(pe);ee===void 0&&(ee=new WeakMap,c.set(pe,ee));let de=ee.get(U);de===void 0&&(de=i.getUniformBlockIndex(pe,U.name),ee.set(U,de))}function ce(U,pe){let de=c.get(pe).get(U);l.get(pe)!==de&&(i.uniformBlockBinding(pe,de,U.__bindingPointIndex),l.set(pe,de))}function He(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},Z=null,X={},f={},d=new WeakMap,x=[],v=null,m=!1,p=null,R=null,L=null,S=null,E=null,A=null,I=null,g=new Be(0,0,0),T=0,P=!1,N=null,V=null,G=null,M=null,C=null,Ue.set(0,0,i.canvas.width,i.canvas.height),we.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:le,bindFramebuffer:me,drawBuffers:se,useProgram:Ce,setBlending:ze,setMaterial:Xe,setFlipSided:Le,setCullFace:ot,setLineWidth:gt,setPolygonOffset:Tt,setScissorTest:Ve,activeTexture:Ze,bindTexture:O,unbindTexture:vt,compressedTexImage2D:qe,compressedTexImage3D:w,texImage2D:Q,texImage3D:te,pixelStorei:Ee,getParameter:ge,updateUBOMapping:_e,uniformBlockBinding:ce,texStorage2D:ie,texStorage3D:he,texSubImage2D:_,texSubImage3D:D,compressedTexSubImage2D:W,compressedTexSubImage3D:J,scissor:ue,viewport:fe,reset:He}}function Mx(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ke,h=new WeakMap,u=new Set,f,d=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(w,_){return x?new OffscreenCanvas(w,_):Ks("canvas")}function m(w,_,D){let W=1,J=qe(w);if((J.width>D||J.height>D)&&(W=D/Math.max(J.width,J.height)),W<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let ie=Math.floor(W*J.width),he=Math.floor(W*J.height);f===void 0&&(f=v(ie,he));let Q=_?v(ie,he):f;return Q.width=ie,Q.height=he,Q.getContext("2d").drawImage(w,0,0,ie,he),Oe("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+ie+"x"+he+")."),Q}else return"data"in w&&Oe("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),w;return w}function p(w){return w.generateMipmaps}function R(w){i.generateMipmap(w)}function L(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(w,_,D,W,J,ie=!1){if(w!==null){if(i[w]!==void 0)return i[w];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let he;W&&(he=e.get("EXT_texture_norm16"),he||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=_;if(_===i.RED&&(D===i.FLOAT&&(Q=i.R32F),D===i.HALF_FLOAT&&(Q=i.R16F),D===i.UNSIGNED_BYTE&&(Q=i.R8),D===i.UNSIGNED_SHORT&&he&&(Q=he.R16_EXT),D===i.SHORT&&he&&(Q=he.R16_SNORM_EXT)),_===i.RED_INTEGER&&(D===i.UNSIGNED_BYTE&&(Q=i.R8UI),D===i.UNSIGNED_SHORT&&(Q=i.R16UI),D===i.UNSIGNED_INT&&(Q=i.R32UI),D===i.BYTE&&(Q=i.R8I),D===i.SHORT&&(Q=i.R16I),D===i.INT&&(Q=i.R32I)),_===i.RG&&(D===i.FLOAT&&(Q=i.RG32F),D===i.HALF_FLOAT&&(Q=i.RG16F),D===i.UNSIGNED_BYTE&&(Q=i.RG8),D===i.UNSIGNED_SHORT&&he&&(Q=he.RG16_EXT),D===i.SHORT&&he&&(Q=he.RG16_SNORM_EXT)),_===i.RG_INTEGER&&(D===i.UNSIGNED_BYTE&&(Q=i.RG8UI),D===i.UNSIGNED_SHORT&&(Q=i.RG16UI),D===i.UNSIGNED_INT&&(Q=i.RG32UI),D===i.BYTE&&(Q=i.RG8I),D===i.SHORT&&(Q=i.RG16I),D===i.INT&&(Q=i.RG32I)),_===i.RGB_INTEGER&&(D===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),D===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),D===i.UNSIGNED_INT&&(Q=i.RGB32UI),D===i.BYTE&&(Q=i.RGB8I),D===i.SHORT&&(Q=i.RGB16I),D===i.INT&&(Q=i.RGB32I)),_===i.RGBA_INTEGER&&(D===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),D===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),D===i.UNSIGNED_INT&&(Q=i.RGBA32UI),D===i.BYTE&&(Q=i.RGBA8I),D===i.SHORT&&(Q=i.RGBA16I),D===i.INT&&(Q=i.RGBA32I)),_===i.RGB&&(D===i.UNSIGNED_SHORT&&he&&(Q=he.RGB16_EXT),D===i.SHORT&&he&&(Q=he.RGB16_SNORM_EXT),D===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),D===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),_===i.RGBA){let te=ie?Br:tt.getTransfer(J);D===i.FLOAT&&(Q=i.RGBA32F),D===i.HALF_FLOAT&&(Q=i.RGBA16F),D===i.UNSIGNED_BYTE&&(Q=te===ut?i.SRGB8_ALPHA8:i.RGBA8),D===i.UNSIGNED_SHORT&&he&&(Q=he.RGBA16_EXT),D===i.SHORT&&he&&(Q=he.RGBA16_SNORM_EXT),D===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),D===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function E(w,_){let D;return w?_===null||_===ei||_===fr?D=i.DEPTH24_STENCIL8:_===Ln?D=i.DEPTH32F_STENCIL8:_===ur&&(D=i.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===ei||_===fr?D=i.DEPTH_COMPONENT24:_===Ln?D=i.DEPTH_COMPONENT32F:_===ur&&(D=i.DEPTH_COMPONENT16),D}function A(w,_){return p(w)===!0||w.isFramebufferTexture&&w.minFilter!==Nt&&w.minFilter!==Dt?Math.log2(Math.max(_.width,_.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?_.mipmaps.length:1}function I(w){let _=w.target;_.removeEventListener("dispose",I),T(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&u.delete(_)}function g(w){let _=w.target;_.removeEventListener("dispose",g),N(_)}function T(w){let _=n.get(w);if(_.__webglInit===void 0)return;let D=w.source,W=d.get(D);if(W){let J=W[_.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(w),Object.keys(W).length===0&&d.delete(D)}n.remove(w)}function P(w){let _=n.get(w);i.deleteTexture(_.__webglTexture);let D=w.source,W=d.get(D);delete W[_.__cacheKey],a.memory.textures--}function N(w){let _=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let J=0;J<_.__webglFramebuffer[W].length;J++)i.deleteFramebuffer(_.__webglFramebuffer[W][J]);else i.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)i.deleteFramebuffer(_.__webglFramebuffer[W]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let D=w.textures;for(let W=0,J=D.length;W<J;W++){let ie=n.get(D[W]);ie.__webglTexture&&(i.deleteTexture(ie.__webglTexture),a.memory.textures--),n.remove(D[W])}n.remove(w)}let V=0;function G(){V=0}function M(){return V}function C(w){V=w}function b(){let w=V;return w>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+s.maxTextures),V+=1,w}function z(w){let _=[];return _.push(w.wrapS),_.push(w.wrapT),_.push(w.wrapR||0),_.push(w.magFilter),_.push(w.minFilter),_.push(w.anisotropy),_.push(w.internalFormat),_.push(w.format),_.push(w.type),_.push(w.generateMipmaps),_.push(w.premultiplyAlpha),_.push(w.flipY),_.push(w.unpackAlignment),_.push(w.colorSpace),_.join()}function B(w,_){let D=n.get(w);if(w.isVideoTexture&&O(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&D.__version!==w.version){let W=w.image;if(W===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{le(D,w,_);return}}else w.isExternalTexture&&(D.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,D.__webglTexture,i.TEXTURE0+_)}function H(w,_){let D=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&D.__version!==w.version){le(D,w,_);return}else w.isExternalTexture&&(D.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,D.__webglTexture,i.TEXTURE0+_)}function Z(w,_){let D=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&D.__version!==w.version){le(D,w,_);return}t.bindTexture(i.TEXTURE_3D,D.__webglTexture,i.TEXTURE0+_)}function X(w,_){let D=n.get(w);if(w.isCubeDepthTexture!==!0&&w.version>0&&D.__version!==w.version){me(D,w,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+_)}let oe={[qi]:i.REPEAT,[Bn]:i.CLAMP_TO_EDGE,[qs]:i.MIRRORED_REPEAT},ae={[Nt]:i.NEAREST,[Do]:i.NEAREST_MIPMAP_NEAREST,[vs]:i.NEAREST_MIPMAP_LINEAR,[Dt]:i.LINEAR,[hr]:i.LINEAR_MIPMAP_NEAREST,[Qn]:i.LINEAR_MIPMAP_LINEAR},Ue={[ff]:i.NEVER,[_f]:i.ALWAYS,[df]:i.LESS,[xl]:i.LEQUAL,[pf]:i.EQUAL,[yl]:i.GEQUAL,[mf]:i.GREATER,[gf]:i.NOTEQUAL};function we(w,_){if(_.type===Ln&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Dt||_.magFilter===hr||_.magFilter===vs||_.magFilter===Qn||_.minFilter===Dt||_.minFilter===hr||_.minFilter===vs||_.minFilter===Qn)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,oe[_.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,oe[_.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,oe[_.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,ae[_.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,ae[_.minFilter]),_.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Ue[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Nt||_.minFilter!==vs&&_.minFilter!==Qn||_.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let D=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Te(w,_){let D=!1;w.__webglInit===void 0&&(w.__webglInit=!0,_.addEventListener("dispose",I));let W=_.source,J=d.get(W);J===void 0&&(J={},d.set(W,J));let ie=z(_);if(ie!==w.__cacheKey){J[ie]===void 0&&(J[ie]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,D=!0),J[ie].usedTimes++;let he=J[w.__cacheKey];he!==void 0&&(J[w.__cacheKey].usedTimes--,he.usedTimes===0&&P(_)),w.__cacheKey=ie,w.__webglTexture=J[ie].texture}return D}function K(w,_,D){return Math.floor(Math.floor(w/D)/_)}function j(w,_,D,W){let ie=w.updateRanges;if(ie.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,D,W,_.data);else{ie.sort((Ee,ue)=>Ee.start-ue.start);let he=0;for(let Ee=1;Ee<ie.length;Ee++){let ue=ie[he],fe=ie[Ee],_e=ue.start+ue.count,ce=K(fe.start,_.width,4),He=K(ue.start,_.width,4);fe.start<=_e+1&&ce===He&&K(fe.start+fe.count-1,_.width,4)===ce?ue.count=Math.max(ue.count,fe.start+fe.count-ue.start):(++he,ie[he]=fe)}ie.length=he+1;let Q=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),ge=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let Ee=0,ue=ie.length;Ee<ue;Ee++){let fe=ie[Ee],_e=Math.floor(fe.start/4),ce=Math.ceil(fe.count/4),He=_e%_.width,U=Math.floor(_e/_.width),pe=ce,ee=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,He),t.pixelStorei(i.UNPACK_SKIP_ROWS,U),t.texSubImage2D(i.TEXTURE_2D,0,He,U,pe,ee,D,W,_.data)}w.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,ge)}}function le(w,_,D){let W=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=i.TEXTURE_3D);let J=Te(w,_),ie=_.source;t.bindTexture(W,w.__webglTexture,i.TEXTURE0+D);let he=n.get(ie);if(ie.version!==he.__version||J===!0){if(t.activeTexture(i.TEXTURE0+D),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let ee=tt.getPrimaries(tt.workingColorSpace),de=_.colorSpace===Ni?null:tt.getPrimaries(_.colorSpace),xe=_.colorSpace===Ni||ee===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment);let te=m(_.image,!1,s.maxTextureSize);te=vt(_,te);let ge=r.convert(_.format,_.colorSpace),Ee=r.convert(_.type),ue=S(_.internalFormat,ge,Ee,_.normalized,_.colorSpace,_.isVideoTexture);we(W,_);let fe,_e=_.mipmaps,ce=_.isVideoTexture!==!0,He=he.__version===void 0||J===!0,U=ie.dataReady,pe=A(_,te);if(_.isDepthTexture)ue=E(_.format===ts,_.type),He&&(ce?t.texStorage2D(i.TEXTURE_2D,1,ue,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,ue,te.width,te.height,0,ge,Ee,null));else if(_.isDataTexture)if(_e.length>0){ce&&He&&t.texStorage2D(i.TEXTURE_2D,pe,ue,_e[0].width,_e[0].height);for(let ee=0,de=_e.length;ee<de;ee++)fe=_e[ee],ce?U&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,fe.width,fe.height,ge,Ee,fe.data):t.texImage2D(i.TEXTURE_2D,ee,ue,fe.width,fe.height,0,ge,Ee,fe.data);_.generateMipmaps=!1}else ce?(He&&t.texStorage2D(i.TEXTURE_2D,pe,ue,te.width,te.height),U&&j(_,te,ge,Ee)):t.texImage2D(i.TEXTURE_2D,0,ue,te.width,te.height,0,ge,Ee,te.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){ce&&He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,ue,_e[0].width,_e[0].height,te.depth);for(let ee=0,de=_e.length;ee<de;ee++)if(fe=_e[ee],_.format!==Nn)if(ge!==null)if(ce){if(U)if(_.layerUpdates.size>0){let xe=Jc(fe.width,fe.height,_.format,_.type);for(let ne of _.layerUpdates){let ye=fe.data.subarray(ne*xe/fe.data.BYTES_PER_ELEMENT,(ne+1)*xe/fe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,ne,fe.width,fe.height,1,ge,ye)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,0,fe.width,fe.height,te.depth,ge,fe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ee,ue,fe.width,fe.height,te.depth,0,fe.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ce?U&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ee,0,0,0,fe.width,fe.height,te.depth,ge,Ee,fe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ee,ue,fe.width,fe.height,te.depth,0,ge,Ee,fe.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{ce&&He&&t.texStorage2D(i.TEXTURE_2D,pe,ue,_e[0].width,_e[0].height);for(let ee=0,de=_e.length;ee<de;ee++)fe=_e[ee],_.format!==Nn?ge!==null?ce?U&&t.compressedTexSubImage2D(i.TEXTURE_2D,ee,0,0,fe.width,fe.height,ge,fe.data):t.compressedTexImage2D(i.TEXTURE_2D,ee,ue,fe.width,fe.height,0,fe.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ce?U&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,fe.width,fe.height,ge,Ee,fe.data):t.texImage2D(i.TEXTURE_2D,ee,ue,fe.width,fe.height,0,ge,Ee,fe.data)}else if(_.isDataArrayTexture)if(ce){if(He&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,ue,te.width,te.height,te.depth),U)if(_.layerUpdates.size>0){let ee=Jc(te.width,te.height,_.format,_.type);for(let de of _.layerUpdates){let xe=te.data.subarray(de*ee/te.data.BYTES_PER_ELEMENT,(de+1)*ee/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,de,te.width,te.height,1,ge,Ee,xe)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,ge,Ee,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ue,te.width,te.height,te.depth,0,ge,Ee,te.data);else if(_.isData3DTexture)ce?(He&&t.texStorage3D(i.TEXTURE_3D,pe,ue,te.width,te.height,te.depth),U&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,ge,Ee,te.data)):t.texImage3D(i.TEXTURE_3D,0,ue,te.width,te.height,te.depth,0,ge,Ee,te.data);else if(_.isFramebufferTexture){if(He)if(ce)t.texStorage2D(i.TEXTURE_2D,pe,ue,te.width,te.height);else{let ee=te.width,de=te.height;for(let xe=0;xe<pe;xe++)t.texImage2D(i.TEXTURE_2D,xe,ue,ee,de,0,ge,Ee,null),ee>>=1,de>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in i){let ee=i.canvas;if(ee.hasAttribute("layoutsubtree")||ee.setAttribute("layoutsubtree","true"),te.parentNode!==ee){ee.appendChild(te),u.add(_),ee.onpaint=de=>{let xe=de.changedElements;for(let ne of u)xe.includes(ne.image)&&(ne.needsUpdate=!0)},ee.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let xe=i.RGBA,ne=i.RGBA,ye=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,xe,ne,ye,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(_e.length>0){if(ce&&He){let ee=qe(_e[0]);t.texStorage2D(i.TEXTURE_2D,pe,ue,ee.width,ee.height)}for(let ee=0,de=_e.length;ee<de;ee++)fe=_e[ee],ce?U&&t.texSubImage2D(i.TEXTURE_2D,ee,0,0,ge,Ee,fe):t.texImage2D(i.TEXTURE_2D,ee,ue,ge,Ee,fe);_.generateMipmaps=!1}else if(ce){if(He){let ee=qe(te);t.texStorage2D(i.TEXTURE_2D,pe,ue,ee.width,ee.height)}U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ge,Ee,te)}else t.texImage2D(i.TEXTURE_2D,0,ue,ge,Ee,te);p(_)&&R(W),he.__version=ie.version,_.onUpdate&&_.onUpdate(_)}w.__version=_.version}function me(w,_,D){if(_.image.length!==6)return;let W=Te(w,_),J=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+D);let ie=n.get(J);if(J.version!==ie.__version||W===!0){t.activeTexture(i.TEXTURE0+D);let he=tt.getPrimaries(tt.workingColorSpace),Q=_.colorSpace===Ni?null:tt.getPrimaries(_.colorSpace),te=_.colorSpace===Ni||he===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let ge=_.isCompressedTexture||_.image[0].isCompressedTexture,Ee=_.image[0]&&_.image[0].isDataTexture,ue=[];for(let ne=0;ne<6;ne++)!ge&&!Ee?ue[ne]=m(_.image[ne],!0,s.maxCubemapSize):ue[ne]=Ee?_.image[ne].image:_.image[ne],ue[ne]=vt(_,ue[ne]);let fe=ue[0],_e=r.convert(_.format,_.colorSpace),ce=r.convert(_.type),He=S(_.internalFormat,_e,ce,_.normalized,_.colorSpace),U=_.isVideoTexture!==!0,pe=ie.__version===void 0||W===!0,ee=J.dataReady,de=A(_,fe);we(i.TEXTURE_CUBE_MAP,_);let xe;if(ge){U&&pe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,de,He,fe.width,fe.height);for(let ne=0;ne<6;ne++){xe=ue[ne].mipmaps;for(let ye=0;ye<xe.length;ye++){let re=xe[ye];_.format!==Nn?_e!==null?U?ee&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,0,0,re.width,re.height,_e,re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,He,re.width,re.height,0,re.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,0,0,re.width,re.height,_e,ce,re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,He,re.width,re.height,0,_e,ce,re.data)}}}else{if(xe=_.mipmaps,U&&pe){xe.length>0&&de++;let ne=qe(ue[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,de,He,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Ee){U?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,ue[ne].width,ue[ne].height,_e,ce,ue[ne].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,He,ue[ne].width,ue[ne].height,0,_e,ce,ue[ne].data);for(let ye=0;ye<xe.length;ye++){let Ke=xe[ye].image[ne].image;U?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,0,0,Ke.width,Ke.height,_e,ce,Ke.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,He,Ke.width,Ke.height,0,_e,ce,Ke.data)}}else{U?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,_e,ce,ue[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,He,_e,ce,ue[ne]);for(let ye=0;ye<xe.length;ye++){let re=xe[ye];U?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,0,0,_e,ce,re.image[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,He,_e,ce,re.image[ne])}}}p(_)&&R(i.TEXTURE_CUBE_MAP),ie.__version=J.version,_.onUpdate&&_.onUpdate(_)}w.__version=_.version}function se(w,_,D,W,J,ie){let he=r.convert(D.format,D.colorSpace),Q=r.convert(D.type),te=S(D.internalFormat,he,Q,D.normalized,D.colorSpace),ge=n.get(_),Ee=n.get(D);if(Ee.__renderTarget=_,!ge.__hasExternalTextures){let ue=Math.max(1,_.width>>ie),fe=Math.max(1,_.height>>ie);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?t.texImage3D(J,ie,te,ue,fe,_.depth,0,he,Q,null):t.texImage2D(J,ie,te,ue,fe,0,he,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),Ze(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,J,Ee.__webglTexture,0,Ve(_)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,J,Ee.__webglTexture,ie),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ce(w,_,D){if(i.bindRenderbuffer(i.RENDERBUFFER,w),_.depthBuffer){let W=_.depthTexture,J=W&&W.isDepthTexture?W.type:null,ie=E(_.stencilBuffer,J),he=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ze(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(_),ie,_.width,_.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(_),ie,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,ie,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,he,i.RENDERBUFFER,w)}else{let W=_.textures;for(let J=0;J<W.length;J++){let ie=W[J],he=r.convert(ie.format,ie.colorSpace),Q=r.convert(ie.type),te=S(ie.internalFormat,he,Q,ie.normalized,ie.colorSpace);Ze(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(_),te,_.width,_.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(_),te,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,te,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function rt(w,_,D){let W=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=n.get(_.depthTexture);if(J.__renderTarget=_,(!J.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W){if(J.__webglInit===void 0&&(J.__webglInit=!0,_.depthTexture.addEventListener("dispose",I)),J.__webglTexture===void 0){J.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),we(i.TEXTURE_CUBE_MAP,_.depthTexture);let ge=r.convert(_.depthTexture.format),Ee=r.convert(_.depthTexture.type),ue;_.depthTexture.format===oi?ue=i.DEPTH_COMPONENT24:_.depthTexture.format===ts&&(ue=i.DEPTH24_STENCIL8);for(let fe=0;fe<6;fe++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0,ue,_.width,_.height,0,ge,Ee,null)}}else B(_.depthTexture,0);let ie=J.__webglTexture,he=Ve(_),Q=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+D:i.TEXTURE_2D,te=_.depthTexture.format===ts?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(_.depthTexture.format===oi)Ze(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,Q,ie,0,he):i.framebufferTexture2D(i.FRAMEBUFFER,te,Q,ie,0);else if(_.depthTexture.format===ts)Ze(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,Q,ie,0,he):i.framebufferTexture2D(i.FRAMEBUFFER,te,Q,ie,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function De(w){let _=n.get(w),D=w.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==w.depthTexture){let W=w.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){let J=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",J)};W.addEventListener("dispose",J),_.__depthDisposeCallback=J}_.__boundDepthTexture=W}if(w.depthTexture&&!_.__autoAllocateDepthBuffer)if(D)for(let W=0;W<6;W++)rt(_.__webglFramebuffer[W],w,W);else{let W=w.texture.mipmaps;W&&W.length>0?rt(_.__webglFramebuffer[0],w,0):rt(_.__webglFramebuffer,w,0)}else if(D){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=i.createRenderbuffer(),Ce(_.__webglDepthbuffer[W],w,!1);else{let J=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ie=_.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,ie),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ie)}}else{let W=w.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),Ce(_.__webglDepthbuffer,w,!1);else{let J=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ie=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ie),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ie)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ze(w,_,D){let W=n.get(w);_!==void 0&&se(W.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),D!==void 0&&De(w)}function Xe(w){let _=w.texture,D=n.get(w),W=n.get(_);w.addEventListener("dispose",g);let J=w.textures,ie=w.isWebGLCubeRenderTarget===!0,he=J.length>1;if(he||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=_.version,a.memory.textures++),ie){D.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(_.mipmaps&&_.mipmaps.length>0){D.__webglFramebuffer[Q]=[];for(let te=0;te<_.mipmaps.length;te++)D.__webglFramebuffer[Q][te]=i.createFramebuffer()}else D.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){D.__webglFramebuffer=[];for(let Q=0;Q<_.mipmaps.length;Q++)D.__webglFramebuffer[Q]=i.createFramebuffer()}else D.__webglFramebuffer=i.createFramebuffer();if(he)for(let Q=0,te=J.length;Q<te;Q++){let ge=n.get(J[Q]);ge.__webglTexture===void 0&&(ge.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&Ze(w)===!1){D.__webglMultisampledFramebuffer=i.createFramebuffer(),D.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let Q=0;Q<J.length;Q++){let te=J[Q];D.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,D.__webglColorRenderbuffer[Q]);let ge=r.convert(te.format,te.colorSpace),Ee=r.convert(te.type),ue=S(te.internalFormat,ge,Ee,te.normalized,te.colorSpace,w.isXRRenderTarget===!0),fe=Ve(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,fe,ue,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,D.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(D.__webglDepthRenderbuffer=i.createRenderbuffer(),Ce(D.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ie){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),we(i.TEXTURE_CUBE_MAP,_);for(let Q=0;Q<6;Q++)if(_.mipmaps&&_.mipmaps.length>0)for(let te=0;te<_.mipmaps.length;te++)se(D.__webglFramebuffer[Q][te],w,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,te);else se(D.__webglFramebuffer[Q],w,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);p(_)&&R(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){for(let Q=0,te=J.length;Q<te;Q++){let ge=J[Q],Ee=n.get(ge),ue=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ue=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ue,Ee.__webglTexture),we(ue,ge),se(D.__webglFramebuffer,w,ge,i.COLOR_ATTACHMENT0+Q,ue,0),p(ge)&&R(ue)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Q=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,W.__webglTexture),we(Q,_),_.mipmaps&&_.mipmaps.length>0)for(let te=0;te<_.mipmaps.length;te++)se(D.__webglFramebuffer[te],w,_,i.COLOR_ATTACHMENT0,Q,te);else se(D.__webglFramebuffer,w,_,i.COLOR_ATTACHMENT0,Q,0);p(_)&&R(Q),t.unbindTexture()}w.depthBuffer&&De(w)}function Le(w){let _=w.textures;for(let D=0,W=_.length;D<W;D++){let J=_[D];if(p(J)){let ie=L(w),he=n.get(J).__webglTexture;t.bindTexture(ie,he),R(ie),t.unbindTexture()}}}let ot=[],gt=[];function Tt(w){if(w.samples>0){if(Ze(w)===!1){let _=w.textures,D=w.width,W=w.height,J=i.COLOR_BUFFER_BIT,ie=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,he=n.get(w),Q=_.length>1;if(Q)for(let ge=0;ge<_.length;ge++)t.bindFramebuffer(i.FRAMEBUFFER,he.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,he.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer);let te=w.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let ge=0;ge<_.length;ge++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,he.__webglColorRenderbuffer[ge]);let Ee=n.get(_[ge]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ee,0)}i.blitFramebuffer(0,0,D,W,0,0,D,W,J,i.NEAREST),l===!0&&(ot.length=0,gt.length=0,ot.push(i.COLOR_ATTACHMENT0+ge),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&(ot.push(ie),gt.push(ie),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,gt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ot))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let ge=0;ge<_.length;ge++){t.bindFramebuffer(i.FRAMEBUFFER,he.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.RENDERBUFFER,he.__webglColorRenderbuffer[ge]);let Ee=n.get(_[ge]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,he.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ge,i.TEXTURE_2D,Ee,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&l){let _=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function Ve(w){return Math.min(s.maxSamples,w.samples)}function Ze(w){let _=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function O(w){let _=a.render.frame;h.get(w)!==_&&(h.set(w,_),w.update())}function vt(w,_){let D=w.colorSpace,W=w.format,J=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||D!==fn&&D!==Ni&&(tt.getTransfer(D)===ut?(W!==Nn||J!==Mn)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ge("WebGLTextures: Unsupported texture color space:",D)),_}function qe(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=b,this.resetTextureUnits=G,this.getTextureUnits=M,this.setTextureUnits=C,this.setTexture2D=B,this.setTexture2DArray=H,this.setTexture3D=Z,this.setTextureCube=X,this.rebindTextures=ze,this.setupRenderTarget=Xe,this.updateRenderTargetMipmap=Le,this.updateMultisampleRenderTarget=Tt,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=se,this.useMultisampledRTT=Ze,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function bx(i,e){function t(n,s=Ni){let r,a=tt.getTransfer(s);if(n===Mn)return i.UNSIGNED_BYTE;if(n===Uo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Fo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===kc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===zc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Fc)return i.BYTE;if(n===Bc)return i.SHORT;if(n===ur)return i.UNSIGNED_SHORT;if(n===Oo)return i.INT;if(n===ei)return i.UNSIGNED_INT;if(n===Ln)return i.FLOAT;if(n===ti)return i.HALF_FLOAT;if(n===Vc)return i.ALPHA;if(n===Hc)return i.RGB;if(n===Nn)return i.RGBA;if(n===oi)return i.DEPTH_COMPONENT;if(n===ts)return i.DEPTH_STENCIL;if(n===Bo)return i.RED;if(n===ko)return i.RED_INTEGER;if(n===ns)return i.RG;if(n===zo)return i.RG_INTEGER;if(n===Vo)return i.RGBA_INTEGER;if(n===ua||n===fa||n===da||n===pa)if(a===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ua)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===pa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ho||n===Go||n===Wo||n===Xo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ho)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Go)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Wo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Xo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===qo||n===Yo||n===Ko||n===Zo||n===Jo||n===ma||n===$o)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===qo||n===Yo)return a===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ko)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Zo)return r.COMPRESSED_R11_EAC;if(n===Jo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ma)return r.COMPRESSED_RG11_EAC;if(n===$o)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===jo||n===Qo||n===el||n===tl||n===nl||n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl||n===hl||n===ul)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===jo)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Qo)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===el)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===tl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===nl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===il)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===sl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===rl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===al)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ol)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ll)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===cl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===hl)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ul)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===fl||n===dl||n===pl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===fl)return a===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===dl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===pl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ml||n===gl||n===ga||n===_l)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ml)return r.COMPRESSED_RED_RGTC1_EXT;if(n===gl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ga)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===_l)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===fr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Ex=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Tx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,hh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Jr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Pn({vertexShader:Ex,fragmentShader:Tx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new yt(new jr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},uh=class extends Jn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,x=null,v=typeof XRWebGLBinding<"u",m=new hh,p={},R=t.getContextAttributes(),L=null,S=null,E=[],A=[],I=new ke,g=null,T=null,P=new zt;P.viewport=new dt;let N=new zt;N.viewport=new dt;let V=[P,N],G=new Co,M=null,C=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let j=E[K];return j===void 0&&(j=new $s,E[K]=j),j.getTargetRaySpace()},this.getControllerGrip=function(K){let j=E[K];return j===void 0&&(j=new $s,E[K]=j),j.getGripSpace()},this.getHand=function(K){let j=E[K];return j===void 0&&(j=new $s,E[K]=j),j.getHandSpace()};function b(K){let j=A.indexOf(K.inputSource);if(j===-1)return;let le=E[j];le!==void 0&&(le.update(K.inputSource,K.frame,c||a),le.dispatchEvent({type:K.type,data:K.inputSource}))}function z(){s.removeEventListener("select",b),s.removeEventListener("selectstart",b),s.removeEventListener("selectend",b),s.removeEventListener("squeeze",b),s.removeEventListener("squeezestart",b),s.removeEventListener("squeezeend",b),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",B);for(let K=0;K<E.length;K++){let j=A[K];j!==null&&(A[K]=null,E[K].disconnect(j))}M=null,C=null,m.reset();for(let K in p)delete p[K];if(e.setRenderTarget(L),d=null,f=null,u=null,s=null,S=null,Te.stop(),n.isPresenting=!1,e.setPixelRatio(g),e.setSize(I.width,I.height,!1),T!==null){let K=T.camera;K.fov=T.fov,K.zoom=T.zoom,K.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(L=e.getRenderTarget(),s.addEventListener("select",b),s.addEventListener("selectstart",b),s.addEventListener("selectend",b),s.addEventListener("squeeze",b),s.addEventListener("squeezestart",b),s.addEventListener("squeezeend",b),s.addEventListener("end",z),s.addEventListener("inputsourceschange",B),R.xrCompatible!==!0&&await t.makeXRCompatible(),g=e.getPixelRatio(),e.getSize(I),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,me=null,se=null;R.depth&&(se=R.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=R.stencil?ts:oi,me=R.stencil?fr:ei);let Ce={colorFormat:t.RGBA8,depthFormat:se,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Ce),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new xn(f.textureWidth,f.textureHeight,{format:Nn,type:Mn,depthTexture:new Yi(f.textureWidth,f.textureHeight,me,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:R.stencil,colorSpace:e.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let le={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),S=new xn(d.framebufferWidth,d.framebufferHeight,{format:Nn,type:Mn,colorSpace:e.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Te.setContext(s),Te.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function B(K){for(let j=0;j<K.removed.length;j++){let le=K.removed[j],me=A.indexOf(le);me>=0&&(A[me]=null,E[me].disconnect(le))}for(let j=0;j<K.added.length;j++){let le=K.added[j],me=A.indexOf(le);if(me===-1){for(let Ce=0;Ce<E.length;Ce++)if(Ce>=A.length){A.push(le),me=Ce;break}else if(A[Ce]===null){A[Ce]=le,me=Ce;break}if(me===-1)break}let se=E[me];se&&se.connect(le)}}let H=new k,Z=new k;function X(K,j,le){H.setFromMatrixPosition(j.matrixWorld),Z.setFromMatrixPosition(le.matrixWorld);let me=H.distanceTo(Z),se=j.projectionMatrix.elements,Ce=le.projectionMatrix.elements,rt=se[14]/(se[10]-1),De=se[14]/(se[10]+1),ze=(se[9]+1)/se[5],Xe=(se[9]-1)/se[5],Le=(se[8]-1)/se[0],ot=(Ce[8]+1)/Ce[0],gt=rt*Le,Tt=rt*ot,Ve=me/(-Le+ot),Ze=Ve*-Le;if(j.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Ze),K.translateZ(Ve),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),se[10]===-1)K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let O=rt+Ve,vt=De+Ve,qe=gt-Ze,w=Tt+(me-Ze),_=ze*De/vt*O,D=Xe*De/vt*O;K.projectionMatrix.makePerspective(qe,w,_,D,O,vt),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function oe(K,j){j===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(j.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let j=K.near,le=K.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(le=m.depthFar)),G.near=N.near=P.near=j,G.far=N.far=P.far=le,(M!==G.near||C!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),M=G.near,C=G.far),G.layers.mask=K.layers.mask|6,P.layers.mask=G.layers.mask&-5,N.layers.mask=G.layers.mask&-3;let me=K.parent,se=G.cameras;oe(G,me);for(let Ce=0;Ce<se.length;Ce++)oe(se[Ce],me);se.length===2?X(G,P,N):G.projectionMatrix.copy(P.projectionMatrix),T===null&&K.isPerspectiveCamera&&(T={camera:K,fov:K.fov,zoom:K.zoom}),ae(K,G,me)};function ae(K,j,le){le===null?K.matrix.copy(j.matrixWorld):(K.matrix.copy(le.matrixWorld),K.matrix.invert(),K.matrix.multiply(j.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=fs*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(K){l=K,f!==null&&(f.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(G)},this.getCameraTexture=function(K){return p[K]};let Ue=null;function we(K,j){if(h=j.getViewerPose(c||a),x=j,h!==null){let le=h.views;d!==null&&(e.setRenderTargetFramebuffer(S,d.framebuffer),e.setRenderTarget(S));let me=!1;le.length!==G.cameras.length&&(G.cameras.length=0,me=!0);for(let De=0;De<le.length;De++){let ze=le[De],Xe=null;if(d!==null)Xe=d.getViewport(ze);else{let ot=u.getViewSubImage(f,ze);Xe=ot.viewport,De===0&&(e.setRenderTargetTextures(S,ot.colorTexture,ot.depthStencilTexture),e.setRenderTarget(S))}let Le=V[De];Le===void 0&&(Le=new zt,Le.layers.enable(De),Le.viewport=new dt,V[De]=Le),Le.matrix.fromArray(ze.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(ze.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Xe.x,Xe.y,Xe.width,Xe.height),De===0&&(G.matrix.copy(Le.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),me===!0&&G.cameras.push(Le)}let se=s.enabledFeatures;if(se&&se.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let De=u.getDepthInformation(le[0]);De&&De.isValid&&De.texture&&m.init(De,s.renderState)}if(se&&se.includes("camera-access")&&v){e.state.unbindTexture(),u=n.getBinding();for(let De=0;De<le.length;De++){let ze=le[De].camera;if(ze){let Xe=p[ze];Xe||(Xe=new Jr,p[ze]=Xe);let Le=u.getCameraImage(ze);Xe.sourceTexture=Le}}}}for(let le=0;le<E.length;le++){let me=A[le],se=E[le];me!==null&&se!==void 0&&se.update(me,j,c||a)}Ue&&Ue(K,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),x=null}let Te=new Yf;Te.setAnimationLoop(we),this.setAnimationLoop=function(K){Ue=K},this.dispose=function(){}}},Ax=new je,Qf=new Ye;Qf.set(-1,0,0,0,1,0,0,0,1);function wx(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Yc(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,R,L,S){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),x(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,R,L):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Qt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Qt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let R=e.get(p),L=R.envMap,S=R.envMapRotation;L&&(m.envMap.value=L,m.envMapRotation.value.setFromMatrix4(Ax.makeRotationFromEuler(S)).transpose(),L.isCubeTexture&&L.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Qf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,R,L){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*R,m.scale.value=L*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,R){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=R.texture,m.transmissionSamplerSize.value.set(R.width,R.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let R=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(R.matrixWorld),m.nearDistance.value=R.shadow.camera.near,m.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Rx(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,E){let A=E.program;n.uniformBlockBinding(S,A)}function c(S,E){let A=s[S.id];A===void 0&&(m(S),A=h(S),s[S.id]=A,S.addEventListener("dispose",R));let I=E.program;n.updateUBOMapping(S,I);let g=e.render.frame;r[S.id]!==g&&(f(S),r[S.id]=g)}function h(S){let E=u();S.__bindingPointIndex=E;let A=i.createBuffer(),I=S.__size,g=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,I,g),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,A),A}function u(){for(let S=0;S<o;S++)if(a.indexOf(S)===-1)return a.push(S),S;return Ge("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(S){let E=s[S.id],A=S.uniforms,I=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let g=0,T=A.length;g<T;g++){let P=A[g];if(Array.isArray(P))for(let N=0,V=P.length;N<V;N++)d(P[N],g,N,I);else d(P,g,0,I)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(S,E,A,I){if(v(S,E,A,I)===!0){let g=S.__offset,T=S.value;if(Array.isArray(T)){let P=0;for(let N=0;N<T.length;N++){let V=T[N],G=p(V);x(V,S.__data,P),typeof V!="number"&&typeof V!="boolean"&&!V.isMatrix3&&!ArrayBuffer.isView(V)&&(P+=G.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(T,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,g,S.__data)}}function x(S,E,A){typeof S=="number"||typeof S=="boolean"?E[0]=S:S.isMatrix3?(E[0]=S.elements[0],E[1]=S.elements[1],E[2]=S.elements[2],E[3]=0,E[4]=S.elements[3],E[5]=S.elements[4],E[6]=S.elements[5],E[7]=0,E[8]=S.elements[6],E[9]=S.elements[7],E[10]=S.elements[8],E[11]=0):ArrayBuffer.isView(S)?E.set(new S.constructor(S.buffer,S.byteOffset,E.length)):S.toArray(E,A)}function v(S,E,A,I){let g=S.value,T=E+"_"+A;if(I[T]===void 0)return typeof g=="number"||typeof g=="boolean"?I[T]=g:ArrayBuffer.isView(g)?I[T]=g.slice():I[T]=g.clone(),!0;{let P=I[T];if(typeof g=="number"||typeof g=="boolean"){if(P!==g)return I[T]=g,!0}else{if(ArrayBuffer.isView(g))return!0;if(P.equals(g)===!1)return P.copy(g),!0}}return!1}function m(S){let E=S.uniforms,A=0,I=16;for(let T=0,P=E.length;T<P;T++){let N=Array.isArray(E[T])?E[T]:[E[T]];for(let V=0,G=N.length;V<G;V++){let M=N[V],C=Array.isArray(M.value)?M.value:[M.value];for(let b=0,z=C.length;b<z;b++){let B=C[b],H=p(B),Z=A%I,X=Z%H.boundary,oe=Z+X;A+=X,oe!==0&&I-oe<H.storage&&(A+=I-oe),M.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),M.__offset=A,A+=H.storage}}}let g=A%I;return g>0&&(A+=I-g),S.__size=A,S.__cache={},this}function p(S){let E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(E.boundary=16,E.storage=S.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",S),E}function R(S){let E=S.target;E.removeEventListener("dispose",R);let A=a.indexOf(E.__bindingPointIndex);a.splice(A,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function L(){for(let S in s)i.deleteBuffer(s[S]);a=[],s={},r={}}return{bind:l,update:c,dispose:L}}var Cx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),pi=null;function Ix(){return pi===null&&(pi=new tr(Cx,16,16,ns,ti),pi.name="DFG_LUT",pi.minFilter=Dt,pi.magFilter=Dt,pi.wrapS=Bn,pi.wrapT=Bn,pi.generateMipmaps=!1,pi.needsUpdate=!0),pi}var bl=class{constructor(e={}){let{canvas:t=xf(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1,outputBufferType:d=Mn}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let v=d,m=new Set([Vo,zo,ko]),p=new Set([Mn,ei,ur,fr,Uo,Fo]),R=new Uint32Array(4),L=new Int32Array(4),S=new k,E=null,A=null,I=[],g=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=jn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,N=!1,V=null,G=null,M=null,C=null;this._outputColorSpace=Lt;let b=0,z=0,B=null,H=-1,Z=null,X=new dt,oe=new dt,ae=null,Ue=new Be(0),we=0,Te=t.width,K=t.height,j=1,le=null,me=null,se=new dt(0,0,Te,K),Ce=new dt(0,0,Te,K),rt=!1,De=new nr,ze=!1,Xe=!1,Le=new je,ot=new k,gt=new dt,Tt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ve=!1;function Ze(){return B===null?j:1}let O=n;function vt(y,F){return t.getContext(y,F)}let qe,w,_,D,W,J,ie,he,Q,te,ge,Ee,ue,fe,_e,ce,He,U,pe,ee,de,xe,ne;try{let y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Ke,!1),t.addEventListener("webglcontextrestored",Je,!1),t.addEventListener("webglcontextcreationerror",It,!1),O===null){let F="webgl2";if(O=vt(F,y),O===null)throw vt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ye()}catch(y){throw t.removeEventListener("webglcontextlost",Ke,!1),t.removeEventListener("webglcontextrestored",Je,!1),t.removeEventListener("webglcontextcreationerror",It,!1),Ge("WebGLRenderer: "+y.message),y}function ye(){qe=new F_(O),qe.init(),de=new bx(O,qe),w=new w_(O,qe,e,de),_=new Sx(O,qe),w.reversedDepthBuffer&&f&&_.buffers.depth.setReversed(!0),G=O.createFramebuffer(),M=O.createFramebuffer(),C=O.createFramebuffer(),D=new z_(O),W=new ox,J=new Mx(O,qe,_,W,w,de,D),ie=new U_(P),he=new Hp(O),xe=new T_(O,he),Q=new B_(O,he,D,xe),te=new H_(O,Q,he,xe,D),U=new V_(O,w,J),_e=new R_(W),ge=new ax(P,ie,qe,w,xe,_e),Ee=new wx(P,W),ue=new cx,fe=new mx(qe),He=new E_(P,ie,_,te,x,l),ce=new vx(P,te,w),ne=new Rx(O,D,w,_),pe=new A_(O,qe,D),ee=new k_(O,qe,D),D.programs=ge.programs,P.capabilities=w,P.extensions=qe,P.properties=W,P.renderLists=ue,P.shadowMap=ce,P.state=_,P.info=D}v!==Mn&&(T=new W_(v,t.width,t.height,o,s,r));let re=new uh(P,O);this.xr=re,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let y=qe.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=qe.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(y){y!==void 0&&(j=y,this.setSize(Te,K,!1))},this.getSize=function(y){return y.set(Te,K)},this.setSize=function(y,F,$=!0){if(re.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}Te=y,K=F,t.width=Math.floor(y*j),t.height=Math.floor(F*j),$===!0&&(t.style.width=y+"px",t.style.height=F+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,y,F)},this.getDrawingBufferSize=function(y){return y.set(Te*j,K*j).floor()},this.setDrawingBufferSize=function(y,F,$){Te=y,K=F,j=$,t.width=Math.floor(y*$),t.height=Math.floor(F*$),this.setViewport(0,0,y,F)},this.setEffects=function(y){if(v===Mn){Ge("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let F=0;F<y.length;F++)if(y[F].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(X)},this.getViewport=function(y){return y.copy(se)},this.setViewport=function(y,F,$,q){y.isVector4?se.set(y.x,y.y,y.z,y.w):se.set(y,F,$,q),_.viewport(X.copy(se).multiplyScalar(j).round())},this.getScissor=function(y){return y.copy(Ce)},this.setScissor=function(y,F,$,q){y.isVector4?Ce.set(y.x,y.y,y.z,y.w):Ce.set(y,F,$,q),_.scissor(oe.copy(Ce).multiplyScalar(j).round())},this.getScissorTest=function(){return rt},this.setScissorTest=function(y){_.setScissorTest(rt=y)},this.setOpaqueSort=function(y){le=y},this.setTransparentSort=function(y){me=y},this.getClearColor=function(y){return y.copy(He.getClearColor())},this.setClearColor=function(){He.setClearColor(...arguments)},this.getClearAlpha=function(){return He.getClearAlpha()},this.setClearAlpha=function(){He.setClearAlpha(...arguments)},this.clear=function(y=!0,F=!0,$=!0){let q=0;if(y){let Y=!1;if(B!==null){let Me=B.texture.format;Y=m.has(Me)}if(Y){let Me=B.texture.type,Re=p.has(Me),Se=He.getClearColor(),Ie=He.getClearAlpha(),Ne=Se.r,Qe=Se.g,st=Se.b;Re?(R[0]=Ne,R[1]=Qe,R[2]=st,R[3]=Ie,O.clearBufferuiv(O.COLOR,0,R)):(L[0]=Ne,L[1]=Qe,L[2]=st,L[3]=Ie,O.clearBufferiv(O.COLOR,0,L))}else q|=O.COLOR_BUFFER_BIT}F&&(q|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(q|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q!==0&&O.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),V=y},this.dispose=function(){t.removeEventListener("webglcontextlost",Ke,!1),t.removeEventListener("webglcontextrestored",Je,!1),t.removeEventListener("webglcontextcreationerror",It,!1),He.dispose(),ue.dispose(),fe.dispose(),W.dispose(),ie.dispose(),te.dispose(),xe.dispose(),ne.dispose(),ge.dispose(),re.dispose(),re.removeEventListener("sessionstart",Ut),re.removeEventListener("sessionend",St),at.stop()};function Ke(y){y.preventDefault(),kr("WebGLRenderer: Context Lost."),N=!0}function Je(){kr("WebGLRenderer: Context Restored."),N=!1;let y=D.autoReset,F=ce.enabled,$=ce.autoUpdate,q=ce.needsUpdate,Y=ce.type;ye(),D.autoReset=y,ce.enabled=F,ce.autoUpdate=$,ce.needsUpdate=q,ce.type=Y}function It(y){Ge("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function wt(y){let F=y.target;F.removeEventListener("dispose",wt),ln(F)}function ln(y){ii(y),W.remove(y)}function ii(y){let F=W.get(y).programs;F!==void 0&&(F.forEach(function($){ge.releaseProgram($)}),y.isShaderMaterial&&ge.releaseShaderCache(y))}this.renderBufferDirect=function(y,F,$,q,Y,Me){F===null&&(F=Tt);let Re=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,Se=Vl(y,F,$,q,Y);_.setMaterial(q,Re);let Ie=$.index,Ne=1;if(q.wireframe===!0){if(Ie=Q.getWireframeAttribute($),Ie===void 0)return;Ne=2}let Qe=$.drawRange,st=$.attributes.position,Pe=Qe.start*Ne,ht=(Qe.start+Qe.count)*Ne;Me!==null&&(Pe=Math.max(Pe,Me.start*Ne),ht=Math.min(ht,(Me.start+Me.count)*Ne)),Ie!==null?(Pe=Math.max(Pe,0),ht=Math.min(ht,Ie.count)):st!=null&&(Pe=Math.max(Pe,0),ht=Math.min(ht,st.count));let Bt=ht-Pe;if(Bt<0||Bt===1/0)return;xe.setup(Y,q,Se,$,Ie);let Et,_t=pe;if(Ie!==null&&(Et=he.get(Ie),_t=ee,_t.setIndex(Et)),Y.isMesh)q.wireframe===!0?(_.setLineWidth(q.wireframeLinewidth*Ze()),_t.setMode(O.LINES)):_t.setMode(O.TRIANGLES);else if(Y.isLine){let nn=q.linewidth;nn===void 0&&(nn=1),_.setLineWidth(nn*Ze()),Y.isLineSegments?_t.setMode(O.LINES):Y.isLineLoop?_t.setMode(O.LINE_LOOP):_t.setMode(O.LINE_STRIP)}else Y.isPoints?_t.setMode(O.POINTS):Y.isSprite&&_t.setMode(O.TRIANGLES);if(Y.isBatchedMesh)if(qe.get("WEBGL_multi_draw"))_t.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{let nn=Y._multiDrawStarts,Ae=Y._multiDrawCounts,hn=Y._multiDrawCount,lt=Ie?he.get(Ie).bytesPerElement:1,Un=W.get(q).currentProgram.getUniforms();for(let si=0;si<hn;si++)Un.setValue(O,"_gl_DrawID",si),_t.render(nn[si]/lt,Ae[si])}else if(Y.isInstancedMesh)_t.renderInstances(Pe,Bt,Y.count);else if($.isInstancedBufferGeometry){let nn=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Ae=Math.min($.instanceCount,nn);_t.renderInstances(Pe,Bt,Ae)}else _t.render(Pe,Bt)};function Tn(y,F,$,q){V!==null&&y.isNodeMaterial&&V.setObject(q,y),ze===!0&&_e.setState(y,$,!1),y.transparent===!0&&y.side===zn&&y.forceSinglePass===!1?(y.side=Qt,y.needsUpdate=!0,cn(y,F,q),y.side=ui,y.needsUpdate=!0,cn(y,F,q),y.side=zn):cn(y,F,q)}this.compile=function(y,F,$=null){$===null&&($=y),V!==null&&V.renderStart(y,F,$),A=fe.get($),A.init(F),g.push(A),$.traverseVisible(function(Y){Y.isLight&&Y.layers.test(F.layers)&&(A.pushLight(Y),Y.castShadow&&A.pushShadow(Y))}),y!==$&&y.traverseVisible(function(Y){Y.isLight&&Y.layers.test(F.layers)&&(A.pushLight(Y),Y.castShadow&&A.pushShadow(Y))}),A.setupLights(),V!==null&&V.updateLights(A.state.lightsArray),Xe=this.localClippingEnabled,ze=_e.init(this.clippingPlanes,Xe),ze===!0&&_e.setGlobalState(this.clippingPlanes,F),V!==null&&ce.render(A.state.shadowsArray,$,F);let q=new Set;return y.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;let Me=Y.material;if(Me)if(Array.isArray(Me))for(let Re=0;Re<Me.length;Re++){let Se=Me[Re];Tn(Se,$,F,Y),q.add(Se)}else Tn(Me,$,F,Y),q.add(Me)}),A=g.pop(),V!==null&&V.renderEnd(),q},this.compileAsync=function(y,F,$=null){let q=this.compile(y,F,$);return new Promise(Y=>{function Me(){if(q.forEach(function(Re){let Ie=W.get(Re).currentProgram;(Ie===void 0||Ie.isReady())&&q.delete(Re)}),q.size===0){Y(y);return}setTimeout(Me,10)}qe.get("KHR_parallel_shader_compile")!==null?Me():setTimeout(Me,10)})};let tn=null;function Rt(y){tn&&tn(y)}function Ut(){at.stop()}function St(){at.start()}let at=new Yf;at.setAnimationLoop(Rt),typeof self<"u"&&at.setContext(self),this.setAnimationLoop=function(y){tn=y,re.setAnimationLoop(y),y===null?at.stop():at.start()},re.addEventListener("sessionstart",Ut),re.addEventListener("sessionend",St),this.render=function(y,F){if(F!==void 0&&F.isCamera!==!0){Ge("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;V!==null&&V.renderStart(y,F);let $=re.enabled===!0&&re.isPresenting===!0,q=T!==null&&(B===null||$)&&T.begin(P,B);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(re.cameraAutoUpdate===!0&&re.updateCamera(F),F=re.getCamera()),y.isScene===!0&&y.onBeforeRender(P,y,F,B),A=fe.get(y,g.length),A.init(F),A.state.textureUnits=J.getTextureUnits(),g.push(A),Le.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),De.setFromProjectionMatrix(Le,Yn,F.reversedDepth),Xe=this.localClippingEnabled,ze=_e.init(this.clippingPlanes,Xe),E=ue.get(y,I.length),E.init(),I.push(E),re.enabled===!0&&re.isPresenting===!0){let Re=P.xr.getDepthSensingMesh();Re!==null&&Ft(Re,F,-1/0,P.sortObjects)}Ft(y,F,0,P.sortObjects),E.finish(),V!==null&&V.updateLights(A.state.lightsArray),P.sortObjects===!0&&E.sort(le,me),Ve=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Ve&&He.addToRenderList(E,y),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ze===!0&&_e.beginShadows();let Y=A.state.shadowsArray;if(ce.render(Y,y,F),ze===!0&&_e.endShadows(),(q&&T.hasRenderPass())===!1){let Re=E.opaque,Se=E.transmissive;if(A.setupLights(),F.isArrayCamera){let Ie=F.cameras;if(Se.length>0)for(let Ne=0,Qe=Ie.length;Ne<Qe;Ne++){let st=Ie[Ne];mn(Re,Se,y,st)}Ve&&He.render(y);for(let Ne=0,Qe=Ie.length;Ne<Qe;Ne++){let st=Ie[Ne];An(E,y,st,st.viewport)}}else Se.length>0&&mn(Re,Se,y,F),Ve&&He.render(y),An(E,y,F)}B!==null&&z===0&&(J.updateMultisampleRenderTarget(B),J.updateRenderTargetMipmap(B)),q&&T.end(P),y.isScene===!0&&y.onAfterRender(P,y,F),xe.resetDefaultState(),H=-1,Z=null,g.pop(),g.length>0?(A=g[g.length-1],J.setTextureUnits(A.state.textureUnits),ze===!0&&_e.setGlobalState(P.clippingPlanes,A.state.camera)):A=null,I.pop(),I.length>0?E=I[I.length-1]:E=null,V!==null&&V.renderEnd()};function Ft(y,F,$,q){if(y.visible===!1)return;if(y.layers.test(F.layers)){if(y.isGroup)$=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(F);else if(y.isLightProbeGrid)A.pushLightProbeGrid(y);else if(y.isLight)A.pushLight(y),y.castShadow&&A.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||y.intersectsFrustum(De)){q&&gt.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Le);let Re=te.update(y),Se=y.material;Se.visible&&E.push(y,Re,Se,$,gt.z,null,F)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||y.intersectsFrustum(De))){let Re=te.update(y),Se=y.material;if(q&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),gt.copy(y.boundingSphere.center)):(Re.boundingSphere===null&&Re.computeBoundingSphere(),gt.copy(Re.boundingSphere.center)),gt.applyMatrix4(y.matrixWorld).applyMatrix4(Le)),Array.isArray(Se)){let Ie=Re.groups;for(let Ne=0,Qe=Ie.length;Ne<Qe;Ne++){let st=Ie[Ne],Pe=Se[st.materialIndex];Pe&&Pe.visible&&E.push(y,Re,Pe,$,gt.z,st,F)}}else Se.visible&&E.push(y,Re,Se,$,gt.z,null,F)}}let Me=y.children;for(let Re=0,Se=Me.length;Re<Se;Re++)Ft(Me[Re],F,$,q)}function An(y,F,$,q){let{opaque:Y,transmissive:Me,transparent:Re}=y;A.setupLightsView($),ze===!0&&_e.setGlobalState(P.clippingPlanes,$),q&&_.viewport(X.copy(q)),Y.length>0&&Vt(Y,F,$),Me.length>0&&Vt(Me,F,$),Re.length>0&&Vt(Re,F,$),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function mn(y,F,$,q){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[q.id]===void 0){let Pe=qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[q.id]=new xn(1,1,{generateMipmaps:!0,type:Pe?ti:Mn,minFilter:Qn,samples:Math.max(4,w.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tt.workingColorSpace})}let Me=A.state.transmissionRenderTarget[q.id],Re=q.viewport||X;Me.setSize(Re.z*P.transmissionResolutionScale,Re.w*P.transmissionResolutionScale);let Se=P.getRenderTarget(),Ie=P.getActiveCubeFace(),Ne=P.getActiveMipmapLevel();P.setRenderTarget(Me),P.getClearColor(Ue),we=P.getClearAlpha(),we<1&&P.setClearColor(16777215,.5),P.clear(),Ve&&He.render($);let Qe=P.toneMapping;P.toneMapping=jn;let st=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),A.setupLightsView(q),ze===!0&&_e.setGlobalState(P.clippingPlanes,q),Vt(y,$,q),J.updateMultisampleRenderTarget(Me),J.updateRenderTargetMipmap(Me),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let ht=0,Bt=F.length;ht<Bt;ht++){let Et=F[ht],{object:_t,geometry:nn,material:Ae,group:hn}=Et;if(Ae.side===zn&&_t.layers.test(q.layers)){let lt=Ae.side;Ae.side=Qt,Ae.needsUpdate=!0,gn(_t,$,q,nn,Ae,hn),Ae.side=lt,Ae.needsUpdate=!0,Pe=!0}}Pe===!0&&(J.updateMultisampleRenderTarget(Me),J.updateRenderTargetMipmap(Me))}P.setRenderTarget(Se,Ie,Ne),P.setClearColor(Ue,we),st!==void 0&&(q.viewport=st),P.toneMapping=Qe}function Vt(y,F,$){let q=F.isScene===!0?F.overrideMaterial:null;for(let Y=0,Me=y.length;Y<Me;Y++){let Re=y[Y],{object:Se,geometry:Ie,group:Ne}=Re,Qe=Re.material;Qe.allowOverride===!0&&q!==null&&(Qe=q),Se.layers.test($.layers)&&gn(Se,F,$,Ie,Qe,Ne)}}function gn(y,F,$,q,Y,Me){V!==null&&Y.isNodeMaterial&&V.setObject(y,Y),y.onBeforeRender(P,F,$,q,Y,Me),y.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),Y.onBeforeRender(P,F,$,q,y,Me),Y.transparent===!0&&Y.side===zn&&Y.forceSinglePass===!1?(Y.side=Qt,Y.needsUpdate=!0,P.renderBufferDirect($,F,q,Y,y,Me),Y.side=ui,Y.needsUpdate=!0,P.renderBufferDirect($,F,q,Y,y,Me),Y.side=zn):P.renderBufferDirect($,F,q,Y,y,Me),y.onAfterRender(P,F,$,q,Y,Me)}function cn(y,F,$){F.isScene!==!0&&(F=Tt);let q=W.get(y),Y=A.state.lights,Me=A.state.shadowsArray,Re=Y.state.version,Se=ge.getParameters(y,Y.state,Me,F,$,A.state.lightProbeGridArray),Ie=ge.getProgramCacheKey(Se),Ne=q.programs;q.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?F.environment:null,q.fog=F.fog;let Qe=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;q.envMap=ie.get(y.envMap||q.environment,Qe),q.envMapRotation=q.environment!==null&&y.envMap===null?F.environmentRotation:y.envMapRotation,Ne===void 0&&(y.addEventListener("dispose",wt),Ne=new Map,q.programs=Ne);let st=Ne.get(Ie);if(st!==void 0){if(q.currentProgram===st&&q.lightsStateVersion===Re)return wn(y,Se),st}else Se.uniforms=ge.getUniforms(y),V!==null&&y.isNodeMaterial&&V.build(y,$,Se),y.onBeforeCompile(Se,P),st=ge.acquireProgram(Se,Ie),Ne.set(Ie,st),q.uniforms=Se.uniforms;let Pe=q.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Pe.clippingPlanes=_e.uniform),wn(y,Se),q.needsLights=On(y),q.lightsStateVersion=Re,q.needsLights&&(Pe.ambientLightColor.value=Y.state.ambient,Pe.lightProbe.value=Y.state.probe,Pe.sunLights.value=Y.state.sun,Pe.sunLightShadows.value=Y.state.sunShadow,Pe.directionalLights.value=Y.state.directional,Pe.directionalLightShadows.value=Y.state.directionalShadow,Pe.spotLights.value=Y.state.spot,Pe.spotLightShadows.value=Y.state.spotShadow,Pe.rectAreaLights.value=Y.state.rectArea,Pe.ltc_1.value=Y.state.rectAreaLTC1,Pe.ltc_2.value=Y.state.rectAreaLTC2,Pe.pointLights.value=Y.state.point,Pe.pointLightShadows.value=Y.state.pointShadow,Pe.hemisphereLights.value=Y.state.hemi,Pe.sunShadowMatrix.value=Y.state.sunShadowMatrix,Pe.sunShadowCascade.value=Y.state.sunShadowCascade,Pe.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Pe.spotLightMatrix.value=Y.state.spotLightMatrix,Pe.spotLightMap.value=Y.state.spotLightMap,Pe.pointShadowMatrix.value=Y.state.pointShadowMatrix),q.lightProbeGrid=A.state.lightProbeGridArray.length>0,q.currentProgram=st,q.uniformsList=null,st}function _n(y){if(y.uniformsList===null){let F=y.currentProgram.getUniforms();y.uniformsList=gr.seqWithValue(F.seq,y.uniforms)}return y.uniformsList}function wn(y,F){let $=W.get(y);$.outputColorSpace=F.outputColorSpace,$.batching=F.batching,$.batchingColor=F.batchingColor,$.instancing=F.instancing,$.instancingColor=F.instancingColor,$.instancingMorph=F.instancingMorph,$.skinning=F.skinning,$.morphTargets=F.morphTargets,$.morphNormals=F.morphNormals,$.morphColors=F.morphColors,$.morphTargetsCount=F.morphTargetsCount,$.numClippingPlanes=F.numClippingPlanes,$.numIntersection=F.numClipIntersection,$.vertexAlphas=F.vertexAlphas,$.vertexTangents=F.vertexTangents,$.toneMapping=F.toneMapping}function Ca(y,F){if(y.length===0)return null;if(y.length===1)return y[0].texture!==null?y[0]:null;S.setFromMatrixPosition(F.matrixWorld);for(let $=0,q=y.length;$<q;$++){let Y=y[$];if(Y.texture!==null&&Y.boundingBox.containsPoint(S))return Y}return null}function Vl(y,F,$,q,Y){F.isScene!==!0&&(F=Tt),J.resetTextureUnits();let Me=F.fog,Re=q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial?F.environment:null,Se=B===null?P.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:tt.workingColorSpace,Ie=q.isMeshStandardMaterial||q.isMeshLambertMaterial&&!q.envMap||q.isMeshPhongMaterial&&!q.envMap,Ne=ie.get(q.envMap||Re,Ie),Qe=q.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,st=!!$.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Pe=!!$.morphAttributes.position,ht=!!$.morphAttributes.normal,Bt=!!$.morphAttributes.color,Et=jn;q.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(Et=P.toneMapping);let _t=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,nn=_t!==void 0?_t.length:0,Ae=W.get(q),hn=A.state.lights;if(ze===!0&&(Xe===!0||y!==Z)){let Mt=y===Z&&q.id===H;_e.setState(q,y,Mt)}let lt=!1;q.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==hn.state.version||Ae.outputColorSpace!==Se||Y.isBatchedMesh&&Ae.batching===!1||!Y.isBatchedMesh&&Ae.batching===!0||Y.isBatchedMesh&&Ae.batchingColor===!0&&Y._colorsTexture===null||Y.isBatchedMesh&&Ae.batchingColor===!1&&Y._colorsTexture!==null||Y.isInstancedMesh&&Ae.instancing===!1||!Y.isInstancedMesh&&Ae.instancing===!0||Y.isSkinnedMesh&&Ae.skinning===!1||!Y.isSkinnedMesh&&Ae.skinning===!0||Y.isInstancedMesh&&Ae.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Ae.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&Ae.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&Ae.instancingMorph===!1&&Y.morphTexture!==null||Ae.envMap!==Ne||q.fog===!0&&Ae.fog!==Me||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==_e.numPlanes||Ae.numIntersection!==_e.numIntersection)||Ae.vertexAlphas!==Qe||Ae.vertexTangents!==st||Ae.morphTargets!==Pe||Ae.morphNormals!==ht||Ae.morphColors!==Bt||Ae.toneMapping!==Et||Ae.morphTargetsCount!==nn||!!Ae.lightProbeGrid!=A.state.lightProbeGridArray.length>0)&&(lt=!0):(lt=!0,Ae.__version=q.version);let Un=Ae.currentProgram;lt===!0&&(Un=cn(q,F,Y),V&&q.isNodeMaterial&&V.onUpdateProgram(q,Un,Ae));let si=!1,Ui=!1,Rs=!1,mt=Un.getUniforms(),Pt=Ae.uniforms;if(_.useProgram(Un.program)&&(si=!0,Ui=!0,Rs=!0),q.id!==H&&(H=q.id,Ui=!0),Ae.needsLights){let Mt=Ca(A.state.lightProbeGridArray,Y);Ae.lightProbeGrid!==Mt&&(Ae.lightProbeGrid=Mt,Ui=!0)}if(si||Z!==y){_.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),mt.setValue(O,"projectionMatrix",y.projectionMatrix),mt.setValue(O,"viewMatrix",y.matrixWorldInverse);let Bi=mt.map.cameraPosition;Bi!==void 0&&Bi.setValue(O,ot.setFromMatrixPosition(y.matrixWorld)),w.logarithmicDepthBuffer&&mt.setValue(O,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&mt.setValue(O,"isOrthographic",y.isOrthographicCamera===!0),Z!==y&&(Z=y,Ui=!0,Rs=!0)}if(Ae.needsLights&&(hn.state.sunShadowMap.length>0&&mt.setValue(O,"sunShadowMap",hn.state.sunShadowMap,J),hn.state.directionalShadowMap.length>0&&mt.setValue(O,"directionalShadowMap",hn.state.directionalShadowMap,J),hn.state.spotShadowMap.length>0&&mt.setValue(O,"spotShadowMap",hn.state.spotShadowMap,J),hn.state.pointShadowMap.length>0&&mt.setValue(O,"pointShadowMap",hn.state.pointShadowMap,J)),Y.isSkinnedMesh){mt.setOptional(O,Y,"bindMatrix"),mt.setOptional(O,Y,"bindMatrixInverse");let Mt=Y.skeleton;Mt&&(Mt.boneTexture===null&&Mt.computeBoneTexture(),mt.setValue(O,"boneTexture",Mt.boneTexture,J))}Y.isBatchedMesh&&(mt.setOptional(O,Y,"batchingTexture"),mt.setValue(O,"batchingTexture",Y._matricesTexture,J),mt.setOptional(O,Y,"batchingIdTexture"),mt.setValue(O,"batchingIdTexture",Y._indirectTexture,J),mt.setOptional(O,Y,"batchingColorTexture"),Y._colorsTexture!==null&&mt.setValue(O,"batchingColorTexture",Y._colorsTexture,J));let Fi=$.morphAttributes;if((Fi.position!==void 0||Fi.normal!==void 0||Fi.color!==void 0)&&U.update(Y,$,Un),(Ui||Ae.receiveShadow!==Y.receiveShadow)&&(Ae.receiveShadow=Y.receiveShadow,mt.setValue(O,"receiveShadow",Y.receiveShadow)),(q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial)&&q.envMap===null&&F.environment!==null&&(Pt.envMapIntensity.value=F.environmentIntensity),Pt.dfgLUT!==void 0&&(Pt.dfgLUT.value=Ix()),Ui){if(mt.setValue(O,"toneMappingExposure",P.toneMappingExposure),Ae.needsLights&&Ia(Pt,Rs),Me&&q.fog===!0&&Ee.refreshFogUniforms(Pt,Me),Ee.refreshMaterialUniforms(Pt,q,j,K,A.state.transmissionRenderTarget[y.id]),Ae.needsLights&&Ae.lightProbeGrid){let Mt=Ae.lightProbeGrid;Pt.probesSH.value=Mt.texture,Pt.probesMin.value.copy(Mt.boundingBox.min),Pt.probesMax.value.copy(Mt.boundingBox.max),Pt.probesResolution.value.copy(Mt.resolution)}gr.upload(O,_n(Ae),Pt,J)}if(q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(gr.upload(O,_n(Ae),Pt,J),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&mt.setValue(O,"center",Y.center),mt.setValue(O,"modelViewMatrix",Y.modelViewMatrix),mt.setValue(O,"normalMatrix",Y.normalMatrix),mt.setValue(O,"modelMatrix",Y.matrixWorld),q.uniformsGroups!==void 0){let Mt=q.uniformsGroups;for(let Bi=0,Cs=Mt.length;Bi<Cs;Bi++){let jh=Mt[Bi];ne.update(jh,Un),ne.bind(jh,Un)}}return Un}function Ia(y,F){y.ambientLightColor.needsUpdate=F,y.lightProbe.needsUpdate=F,y.sunLights.needsUpdate=F,y.sunLightShadows.needsUpdate=F,y.directionalLights.needsUpdate=F,y.directionalLightShadows.needsUpdate=F,y.pointLights.needsUpdate=F,y.pointLightShadows.needsUpdate=F,y.spotLights.needsUpdate=F,y.spotLightShadows.needsUpdate=F,y.rectAreaLights.needsUpdate=F,y.hemisphereLights.needsUpdate=F}function On(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return b},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return B},this.setRenderTargetTextures=function(y,F,$){let q=W.get(y);q.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),W.get(y.texture).__webglTexture=F,W.get(y.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:$,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,F){let $=W.get(y);$.__webglFramebuffer=F,$.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(y,F=0,$=0){B=y,b=F,z=$;let q=null,Y=!1,Me=!1;if(y){let Se=W.get(y);if(Se.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(O.FRAMEBUFFER,Se.__webglFramebuffer),X.copy(y.viewport),oe.copy(y.scissor),ae=y.scissorTest,_.viewport(X),_.scissor(oe),_.setScissorTest(ae),H=-1;return}else if(Se.__webglFramebuffer===void 0)J.setupRenderTarget(y);else if(Se.__hasExternalTextures)J.rebindTextures(y,W.get(y.texture).__webglTexture,W.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Qe=y.depthTexture;if(Se.__boundDepthTexture!==Qe){if(Qe!==null&&W.has(Qe)&&(y.width!==Qe.image.width||y.height!==Qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(y)}}let Ie=y.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(Me=!0);let Ne=W.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Ne[F])?q=Ne[F][$]:q=Ne[F],Y=!0):y.samples>0&&J.useMultisampledRTT(y)===!1?q=W.get(y).__webglMultisampledFramebuffer:Array.isArray(Ne)?q=Ne[$]:q=Ne,X.copy(y.viewport),oe.copy(y.scissor),ae=y.scissorTest}else X.copy(se).multiplyScalar(j).floor(),oe.copy(Ce).multiplyScalar(j).floor(),ae=rt;if($!==0&&(q=G),_.bindFramebuffer(O.FRAMEBUFFER,q)&&_.drawBuffers(y,q),_.viewport(X),_.scissor(oe),_.setScissorTest(ae),Y){let Se=W.get(y.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+F,Se.__webglTexture,$)}else if(Me){let Se=F;for(let Ie=0;Ie<y.textures.length;Ie++){let Ne=W.get(y.textures[Ie]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Ie,Ne.__webglTexture,$,Se)}}else if(y!==null&&$!==0){let Se=W.get(y.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Se.__webglTexture,$)}H=-1};function $h(y){let F=W.get(y);return(F.__readFormat!==y.format||F.__readType!==y.type)&&(F.__readFormat=y.format,F.__readType=y.type,F.__formatReadable=w.textureFormatReadable(y.format),F.__typeReadable=w.textureTypeReadable(y.type)),F}this.readRenderTargetPixels=function(y,F,$,q,Y,Me,Re,Se=0){if(!(y&&y.isWebGLRenderTarget)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=W.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Re!==void 0&&(Ie=Ie[Re]),Ie){_.bindFramebuffer(O.FRAMEBUFFER,Ie);try{let Ne=y.textures[Se],Qe=Ne.format,st=Ne.type;y.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Se);let Pe=$h(Ne);if(Pe.__formatReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=y.width-q&&$>=0&&$<=y.height-Y&&O.readPixels(F,$,q,Y,de.convert(Qe),de.convert(st),Me)}finally{let Ne=B!==null?W.get(B).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,Ne)}}},this.readRenderTargetPixelsAsync=async function(y,F,$,q,Y,Me,Re,Se=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ie=W.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&Re!==void 0&&(Ie=Ie[Re]),Ie)if(F>=0&&F<=y.width-q&&$>=0&&$<=y.height-Y){_.bindFramebuffer(O.FRAMEBUFFER,Ie);let Ne=y.textures[Se],Qe=Ne.format,st=Ne.type;y.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Se);let Pe=$h(Ne);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ht=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,ht),O.bufferData(O.PIXEL_PACK_BUFFER,Me.byteLength,O.STREAM_READ),O.readPixels(F,$,q,Y,de.convert(Qe),de.convert(st),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let Bt=B!==null?W.get(B).__webglFramebuffer:null;_.bindFramebuffer(O.FRAMEBUFFER,Bt);let Et=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await vf(O,Et,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,ht),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,Me),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(ht),O.deleteSync(Et),Me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,F=null,$=0){let q=Math.pow(2,-$),Y=Math.floor(y.image.width*q),Me=Math.floor(y.image.height*q),Re=F!==null?F.x:0,Se=F!==null?F.y:0;J.setTexture2D(y,0),O.copyTexSubImage2D(O.TEXTURE_2D,$,0,0,Re,Se,Y,Me),_.unbindTexture()},this.copyTextureToTexture=function(y,F,$=null,q=null,Y=0,Me=0){let Re,Se,Ie,Ne,Qe,st,Pe,ht,Bt,Et=y.isCompressedTexture?y.mipmaps[Me]:y.image;if($!==null)Re=$.max.x-$.min.x,Se=$.max.y-$.min.y,Ie=$.isBox3?$.max.z-$.min.z:1,Ne=$.min.x,Qe=$.min.y,st=$.isBox3?$.min.z:0;else{let Pt=Math.pow(2,-Y);Re=Math.floor(Et.width*Pt),Se=Math.floor(Et.height*Pt),y.isDataArrayTexture?Ie=Et.depth:y.isData3DTexture?Ie=Math.floor(Et.depth*Pt):Ie=1,Ne=0,Qe=0,st=0}q!==null?(Pe=q.x,ht=q.y,Bt=q.z):(Pe=0,ht=0,Bt=0);let _t=de.convert(F.format),nn=de.convert(F.type),Ae;F.isData3DTexture?(J.setTexture3D(F,0),Ae=O.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(J.setTexture2DArray(F,0),Ae=O.TEXTURE_2D_ARRAY):(J.setTexture2D(F,0),Ae=O.TEXTURE_2D),_.activeTexture(O.TEXTURE0),_.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,F.flipY),_.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),_.pixelStorei(O.UNPACK_ALIGNMENT,F.unpackAlignment);let hn=_.getParameter(O.UNPACK_ROW_LENGTH),lt=_.getParameter(O.UNPACK_IMAGE_HEIGHT),Un=_.getParameter(O.UNPACK_SKIP_PIXELS),si=_.getParameter(O.UNPACK_SKIP_ROWS),Ui=_.getParameter(O.UNPACK_SKIP_IMAGES);_.pixelStorei(O.UNPACK_ROW_LENGTH,Et.width),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Et.height),_.pixelStorei(O.UNPACK_SKIP_PIXELS,Ne),_.pixelStorei(O.UNPACK_SKIP_ROWS,Qe),_.pixelStorei(O.UNPACK_SKIP_IMAGES,st);let Rs=y.isDataArrayTexture||y.isData3DTexture,mt=F.isDataArrayTexture||F.isData3DTexture;if(y.isDepthTexture){let Pt=W.get(y),Fi=W.get(F),Mt=W.get(Pt.__renderTarget),Bi=W.get(Fi.__renderTarget);_.bindFramebuffer(O.READ_FRAMEBUFFER,Mt.__webglFramebuffer),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,Bi.__webglFramebuffer);for(let Cs=0;Cs<Ie;Cs++)Rs&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,W.get(y).__webglTexture,Y,st+Cs),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,W.get(F).__webglTexture,Me,Bt+Cs)),O.blitFramebuffer(Ne,Qe,Re,Se,Pe,ht,Re,Se,O.DEPTH_BUFFER_BIT,O.NEAREST);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(Y!==0||y.isRenderTargetTexture||W.has(y)){let Pt=W.get(y),Fi=W.get(F);_.bindFramebuffer(O.READ_FRAMEBUFFER,M),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,C);for(let Mt=0;Mt<Ie;Mt++)Rs?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Pt.__webglTexture,Y,st+Mt):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Pt.__webglTexture,Y),mt?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Fi.__webglTexture,Me,Bt+Mt):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Fi.__webglTexture,Me),Y!==0?O.blitFramebuffer(Ne,Qe,Re,Se,Pe,ht,Re,Se,O.COLOR_BUFFER_BIT,O.NEAREST):mt?O.copyTexSubImage3D(Ae,Me,Pe,ht,Bt+Mt,Ne,Qe,Re,Se):O.copyTexSubImage2D(Ae,Me,Pe,ht,Ne,Qe,Re,Se);_.bindFramebuffer(O.READ_FRAMEBUFFER,null),_.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else mt?y.isDataTexture||y.isData3DTexture?O.texSubImage3D(Ae,Me,Pe,ht,Bt,Re,Se,Ie,_t,nn,Et.data):F.isCompressedArrayTexture?O.compressedTexSubImage3D(Ae,Me,Pe,ht,Bt,Re,Se,Ie,_t,Et.data):O.texSubImage3D(Ae,Me,Pe,ht,Bt,Re,Se,Ie,_t,nn,Et):y.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,Me,Pe,ht,Re,Se,_t,nn,Et.data):y.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,Me,Pe,ht,Et.width,Et.height,_t,Et.data):O.texSubImage2D(O.TEXTURE_2D,Me,Pe,ht,Re,Se,_t,nn,Et);_.pixelStorei(O.UNPACK_ROW_LENGTH,hn),_.pixelStorei(O.UNPACK_IMAGE_HEIGHT,lt),_.pixelStorei(O.UNPACK_SKIP_PIXELS,Un),_.pixelStorei(O.UNPACK_SKIP_ROWS,si),_.pixelStorei(O.UNPACK_SKIP_IMAGES,Ui),Me===0&&F.generateMipmaps&&O.generateMipmap(Ae),_.unbindTexture()},this.initRenderTarget=function(y){W.get(y).__webglFramebuffer===void 0&&J.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?J.setTextureCube(y,0):y.isData3DTexture?J.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?J.setTexture2DArray(y,0):J.setTexture2D(y,0),_.unbindTexture()},this.resetState=function(){b=0,z=0,B=null,_.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};var ed={type:"change"},dh={type:"start"},nd={type:"end"},Al=new Ti,td=new In,Lx=Math.cos(70*di.DEG2RAD),Xt=new k,bn=2*Math.PI,pt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},fh=1e-6,wl=class extends oa{constructor(e,t=null){super(e,t),this.state=pt.NONE,this.target=new k,this.cursor=new k,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ji.ROTATE,MIDDLE:ji.DOLLY,RIGHT:ji.PAN},this.touches={ONE:Qi.ROTATE,TWO:Qi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new k,this._lastQuaternion=new an,this._lastTargetPosition=new k,this._quat=new an().setFromUnitVectors(e.up,new k(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Li,this._sphericalDelta=new Li,this._scale=1,this._panOffset=new k,this._rotateStart=new ke,this._rotateEnd=new ke,this._rotateDelta=new ke,this._panStart=new ke,this._panEnd=new ke,this._panDelta=new ke,this._dollyStart=new ke,this._dollyEnd=new ke,this._dollyDelta=new ke,this._dollyDirection=new k,this._mouse=new ke,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Dx.bind(this),this._onPointerDown=Nx.bind(this),this._onPointerUp=Ox.bind(this),this._onContextMenu=Hx.bind(this),this._onMouseWheel=Bx.bind(this),this._onKeyDown=kx.bind(this),this._onTouchStart=zx.bind(this),this._onTouchMove=Vx.bind(this),this._onMouseDown=Ux.bind(this),this._onMouseMove=Fx.bind(this),this._interceptControlDown=Gx.bind(this),this._interceptControlUp=Wx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=pt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(ed),this.update(),this.state=pt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Xt.copy(t).sub(this.target),Xt.applyQuaternion(this._quat),this._spherical.setFromVector3(Xt),this.autoRotate&&this.state===pt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=bn:n>Math.PI&&(n-=bn),s<-Math.PI?s+=bn:s>Math.PI&&(s-=bn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Xt.setFromSpherical(this._spherical),Xt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Xt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Xt.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new k(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new k(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Xt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Al.origin.copy(this.object.position),Al.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Al.direction))<Lx?this.object.lookAt(this.target):(td.setFromNormalAndCoplanarPoint(this.object.up,this.target),Al.intersectPlane(td,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>fh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>fh||this._lastTargetPosition.distanceToSquared(this.target)>fh?(this.dispatchEvent(ed),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?bn/60*this.autoRotateSpeed*e:bn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Xt.setFromMatrixColumn(t,0),Xt.multiplyScalar(-e),this._panOffset.add(Xt)}_panUp(e,t){this.screenSpacePanning===!0?Xt.setFromMatrixColumn(t,1):(Xt.setFromMatrixColumn(t,0),Xt.crossVectors(this.object.up,Xt)),Xt.multiplyScalar(e),this._panOffset.add(Xt)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Xt.copy(s).sub(this.target);let r=Xt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/t.clientHeight),this._rotateUp(bn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/t.clientHeight),this._rotateUp(bn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ke,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Nx(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Dx(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Ox(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(nd),this.state=pt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Ux(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case ji.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=pt.DOLLY;break;case ji.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=pt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=pt.ROTATE}break;case ji.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=pt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=pt.PAN}break;default:this.state=pt.NONE}this.state!==pt.NONE&&this.dispatchEvent(dh)}function Fx(i){switch(this.state){case pt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case pt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case pt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Bx(i){this.enabled===!1||this.enableZoom===!1||this.state!==pt.NONE||(i.preventDefault(),this.dispatchEvent(dh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(nd))}function kx(i){this.enabled!==!1&&this._handleKeyDown(i)}function zx(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Qi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=pt.TOUCH_ROTATE;break;case Qi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=pt.TOUCH_PAN;break;default:this.state=pt.NONE}break;case 2:switch(this.touches.TWO){case Qi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=pt.TOUCH_DOLLY_PAN;break;case Qi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=pt.TOUCH_DOLLY_ROTATE;break;default:this.state=pt.NONE}break;default:this.state=pt.NONE}this.state!==pt.NONE&&this.dispatchEvent(dh)}function Vx(i){switch(this._trackPointer(i),this.state){case pt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case pt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case pt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case pt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=pt.NONE}}function Hx(i){this.enabled!==!1&&i.preventDefault()}function Gx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Wx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function ph(i,e){if(e===Gc)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===dr||e===_a){let t=i.getIndex();if(t===null){let r=[],a=i.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===dr)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function id(i){let e=new Map,t=new Map,n=i.clone();return sd(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function sd(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)sd(i.children[n],e.children[n],t)}var Rl=class extends hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Sh(t)}),this.register(function(t){return new Mh(t)}),this.register(function(t){return new Ph(t)}),this.register(function(t){return new Lh(t)}),this.register(function(t){return new Nh(t)}),this.register(function(t){return new Eh(t)}),this.register(function(t){return new Th(t)}),this.register(function(t){return new Ah(t)}),this.register(function(t){return new wh(t)}),this.register(function(t){return new vh(t)}),this.register(function(t){return new Rh(t)}),this.register(function(t){return new bh(t)}),this.register(function(t){return new Ih(t)}),this.register(function(t){return new Ch(t)}),this.register(function(t){return new xh(t)}),this.register(function(t){return new Cl(t,it.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Cl(t,it.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new Dh(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=Pi.extractUrlBase(e);a=Pi.resolveURL(c,this.path)}else a=Pi.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new ar(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===cd){try{a[it.KHR_BINARY_GLTF]=new Oh(e)}catch(u){s&&s(u);return}r=JSON.parse(a[it.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Hh(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],f=r.extensionsRequired||[];switch(u){case it.KHR_MATERIALS_UNLIT:a[u]=new yh;break;case it.KHR_DRACO_MESH_COMPRESSION:a[u]=new Uh(r,this.dracoLoader);break;case it.KHR_TEXTURE_TRANSFORM:a[u]=new Fh;break;case it.KHR_MESH_QUANTIZATION:a[u]=new Bh;break;default:f.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function Xx(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Ot(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var it={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},xh=class{constructor(e){this.parser=e,this.name=it.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new Be(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],fn);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new $i(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new _s(h),c.distance=u;break;case"spot":c=new ra(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),gi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},yh=class{constructor(){this.name=it.KHR_MATERIALS_UNLIT}getMaterialType(){return $n}extendParams(e,t,n){let s=[];e.color=new Be(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],fn),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Lt))}return Promise.all(s)}},vh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Sh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ke(r,r)}return Promise.all(s)}},Mh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},bh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},Eh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_SHEEN}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new Be(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],fn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Lt)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},Th=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Ah=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_VOLUME}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Be().setRGB(r[0],r[1],r[2],fn),Promise.all(s)}},wh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_IOR}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Rh=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new Be().setRGB(r[0],r[1],r[2],fn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Lt)),Promise.all(s)}},Ch=class{constructor(e){this.parser=e,this.name=it.EXT_MATERIALS_BUMP}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},Ih=class{constructor(e){this.parser=e,this.name=it.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Ot(this.parser,e,this.name)!==null?vn:null}extendMaterialParams(e,t){let n=Ot(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},Ph=class{constructor(e){this.parser=e,this.name=it.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},Lh=class{constructor(e){this.parser=e,this.name=it.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},Nh=class{constructor(e){this.parser=e,this.name=it.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},Cl=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,f=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,f,s.mode,s.filter).then(function(d){return d.buffer}):a.ready.then(function(){let d=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(d),h,u,f,s.mode,s.filter),d})})}else return null}},Dh=class{constructor(e){this.name=it.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==Vn.TRIANGLES&&c.mode!==Vn.TRIANGLE_STRIP&&c.mode!==Vn.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],f=c[0].count,d=[];for(let x of u){let v=new je,m=new k,p=new an,R=new k(1,1,1),L=new ps(x.geometry,x.material,f);for(let E=0;E<f;E++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,E),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,E),l.SCALE&&R.fromBufferAttribute(l.SCALE,E),L.setMatrixAt(E,v.compose(m,p,R));let S=null;for(let E in l)if(E==="_COLOR_0"){let A=l[E];L.instanceColor=new Ai(A.array,A.itemSize,A.normalized)}else if(E!=="TRANSLATION"&&E!=="ROTATION"&&E!=="SCALE"){if(S===null){let I=L.geometry;S=new jt,S.name=I.name;for(let g in I.attributes)S.setAttribute(g,I.attributes[g]);for(let g in I.morphAttributes)S.morphAttributes[g]=I.morphAttributes[g];I.index!==null&&S.setIndex(I.index),S.morphTargetsRelative=I.morphTargetsRelative;for(let g of I.groups)S.addGroup(g.start,g.count,g.materialIndex);I.boundingBox!==null&&(S.boundingBox=I.boundingBox.clone()),I.boundingSphere!==null&&(S.boundingSphere=I.boundingSphere.clone()),S.drawRange.start=I.drawRange.start,S.drawRange.count=I.drawRange.count,S.userData=Object.assign({},I.userData),L.geometry=S}let A=l[E];S.setAttribute(E,new Ai(A.array,A.itemSize,A.normalized))}bt.prototype.copy.call(L,x),this.parser.assignFinalMaterial(L),d.push(L)}return h.isGroup?(h.clear(),h.add(...d),h):d[0]}))}},cd="glTF",Ma=12,rd={JSON:1313821514,BIN:5130562},Oh=class{constructor(e){this.name=it.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Ma),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==cd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-Ma,r=new DataView(e,Ma),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===rd.JSON){let c=new Uint8Array(e,Ma+a,o);this.content=n.decode(c)}else if(l===rd.BIN){let c=Ma+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Uh=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=it.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let h in a){let u=zh[h]||h.toLowerCase();o[u]=a[h]}for(let h in e.attributes){let u=zh[h]||h.toLowerCase();if(a[h]!==void 0){let f=n.accessors[e.attributes[h]],d=yr[f.componentType];c[u]=d.name,l[u]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,f){s.decodeDracoFile(h,function(d){for(let x in d.attributes){let v=d.attributes[x],m=l[x];m!==void 0&&(v.normalized=m)}u(d)},o,c,fn,f)})})}},Fh=class{constructor(){this.name=it.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},Bh=class{constructor(){this.name=it.KHR_MESH_QUANTIZATION}},Il=class extends ci{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=s-t,u=(n-t)/h,f=u*u,d=f*u,x=e*c,v=x-c,m=-2*d+3*f,p=d-f,R=1-m,L=p-f+u;for(let S=0;S!==o;S++){let E=a[v+S+o],A=a[v+S+l]*h,I=a[x+S+o],g=a[x+S]*h;r[S]=R*E+L*A+m*I+p*g}return r}},qx=new an,kh=class extends Il{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return qx.fromArray(r).normalize().toArray(r),r}},Vn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},yr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ad={9728:Nt,9729:Dt,9984:Do,9985:hr,9986:vs,9987:Qn},od={33071:Bn,33648:qs,10497:qi},mh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},zh={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},is={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Yx={CUBICSPLINE:void 0,LINEAR:us,STEP:hs},gh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Kx(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new kn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ui})),i.DefaultMaterial}function bs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function gi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Zx(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;a.push(f)}if(s){let f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;o.push(f)}if(r){let f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],f=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=f),i.morphTargetsRelative=!0,i})}function Jx(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function $x(i){let e,t=i.extensions&&i.extensions[it.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+_h(t.attributes):e=i.indices+":"+_h(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+_h(i.targets[n]);return e}function _h(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Vh(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function jx(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var Qx=new je,Hh=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Xx,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?this.textureLoader=new na(this.options.manager):this.textureLoader=new aa(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ar(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return bs(r,o,s),gi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,h]of a.children.entries())r(h,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[it.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(Pi.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=mh[s.type],o=yr[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new Ht(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=mh[s.type],c=yr[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,f=s.byteOffset||0,d=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,x=s.normalized===!0,v,m;if(d&&d!==u){let p=Math.floor(f/d),R="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,L=t.cache.get(R);L||(v=new c(o,p*d,s.count*d/h),L=new js(v,d/h),t.cache.add(R,L)),m=new Qs(L,l,f%d/h,x)}else o===null?v=new c(s.count*l):v=new c(o,f,s.count*l),m=new Ht(v,l,x);if(s.sparse!==void 0){let p=mh.SCALAR,R=yr[s.sparse.indices.componentType],L=s.sparse.indices.byteOffset||0,S=s.sparse.values.byteOffset||0,E=new R(a[1],L,s.sparse.count*p),A=new c(a[2],S,s.sparse.count*l);o!==null&&(m=new Ht(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let I=0,g=E.length;I<g;I++){let T=E[I];if(m.setX(T,A[I*l]),l>=2&&m.setY(T,A[I*l+1]),l>=3&&m.setZ(T,A[I*l+2]),l>=4&&m.setW(T,A[I*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=x}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);let f=(r.samplers||{})[a.sampler]||{};return h.magFilter=ad[f.magFilter]||Dt,h.minFilter=ad[f.minFilter]||Qn,h.wrapS=od[f.wrapS]||qi,h.wrapT=od[f.wrapT]||qi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Nt&&h.minFilter!==Dt,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;let f=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(f),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(l).then(function(u){return new Promise(function(f,d){let x=f;t.isImageBitmapLoader===!0&&(x=function(v){let m=new Zt(v);m.needsUpdate=!0,f(m)}),t.load(Pi.resolveURL(u,r.path),x,void 0,d)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),gi(u,a),u.userData.mimeType=a.mimeType||jx(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[it.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[it.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[it.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new sr,dn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new ir,dn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return kn}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[it.KHR_MATERIALS_UNLIT]){let u=s[it.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{let u=r.pbrMetallicRoughness||{};if(o.color=new Be(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){let f=u.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],fn),o.opacity=f[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,Lt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=zn);let h=r.alphaMode||gh.OPAQUE;if(h===gh.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===gh.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==$n&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new ke(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==$n&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==$n){let u=r.emissiveFactor;o.emissive=new Be().setRGB(u[0],u[1],u[2],fn)}return r.emissiveTexture!==void 0&&a!==$n&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Lt)),Promise.all(c).then(function(){let u=new a(o);return r.name&&(u.name=r.name),gi(u,r),t.associations.set(u,{materials:e}),r.extensions&&bs(s,u,r),u})}createUniqueName(e){let t=xt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[it.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return ld(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],h=$x(c),u=s[h];if(u)a.push(u.promise);else{let f;c.extensions&&c.extensions[it.KHR_DRACO_MESH_COMPRESSION]?f=r(c):f=ld(new jt,c,t),c.mode===Vn.TRIANGLE_STRIP?f=f.then(d=>ph(d,_a)):c.mode===Vn.TRIANGLE_FAN&&(f=f.then(d=>ph(d,dr))),s[h]={primitive:c,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let h=a[l].material===void 0?Kx(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let d=0,x=h.length;d<x;d++){let v=h[d],m=a[d],p,R=c[d];if(m.mode===Vn.TRIANGLES||m.mode===Vn.TRIANGLE_STRIP||m.mode===Vn.TRIANGLE_FAN||m.mode===void 0){let L=r.isSkinnedMesh===!0,S=v.hasAttribute("skinIndex")&&v.hasAttribute("skinWeight");L&&S===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),p=L&&S?new Wr(v,R):new yt(v,R),p.isSkinnedMesh===!0&&p.normalizeSkinWeights()}else if(m.mode===Vn.LINES)p=new qr(v,R);else if(m.mode===Vn.LINE_STRIP)p=new ms(v,R);else if(m.mode===Vn.LINE_LOOP)p=new Yr(v,R);else if(m.mode===Vn.POINTS)p=new Kr(v,R);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&Jx(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),gi(p,r),m.extensions&&bs(s,p,m),t.assignFinalMaterial(p),u.push(p)}for(let d=0,x=u.length;d<x;d++)t.associations.set(u[d],{meshes:e,primitives:d});if(u.length===1)return r.extensions&&bs(s,u[0],r),u[0];let f=new Kn;r.extensions&&bs(s,f,r),t.associations.set(f,{meshes:e});for(let d=0,x=u.length;d<x;d++)f.add(u[d]);return f})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new zt(di.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Ji(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),gi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,h=a.length;c<h;c++){let u=a[c];if(u){o.push(u);let f=new je;r!==null&&f.fromArray(r.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Xr(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,f=s.channels.length;u<f;u++){let d=s.channels[u],x=s.samplers[d.sampler],v=d.target,m=v.node,p=s.parameters!==void 0?s.parameters[x.input]:x.input,R=s.parameters!==void 0?s.parameters[x.output]:x.output;v.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",R)),c.push(x),h.push(v))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let f=u[0],d=u[1],x=u[2],v=u[3],m=u[4],p=[];for(let L=0,S=f.length;L<S;L++){let E=f[L],A=d[L],I=x[L],g=v[L],T=m[L];if(E===void 0)continue;E.updateMatrix&&E.updateMatrix();let P=n._createAnimationTracks(E,A,I,g,T);if(P)for(let N=0;N<P.length;N++)p.push(P[N])}let R=new ta(r,void 0,p);return gi(R,s),R})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let h=c[0],u=c[1],f=c[2];f!==null&&h.traverse(function(d){d.isSkinnedMesh&&d.bind(f,Qx)});for(let d=0,x=u.length;d<x;d++)h.add(u[d]);if(h.userData.pivot!==void 0&&u.length>0){let d=h.userData.pivot,x=u[0];h.pivot=new k().fromArray(d),h.position.x-=d[0],h.position.y-=d[1],h.position.z-=d[2],x.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(r.isBone===!0?h=new er:c.length>1?h=new Kn:c.length===1?h=c[0]:h=new bt,h!==c[0])for(let u=0,f=c.length;u<f;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=a),gi(h,r),r.extensions&&bs(n,h,r),r.matrix!==void 0){let u=new je;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Kn;n.name&&(r.name=s.createUniqueName(n.name)),gi(r,n),n.extensions&&bs(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++){let f=l[h];f.parent!==null?r.add(id(f)):r.add(f)}let c=h=>{let u=new Map;for(let[f,d]of s.associations)(f instanceof dn||f instanceof Zt)&&u.set(f,d);return h.traverse(f=>{let d=s.associations.get(f);d!=null&&u.set(f,d)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];function c(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}is[r.path]===is.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(o);let h;switch(is[r.path]){case is.weights:h=Ri;break;case is.rotation:h=Ci;break;case is.translation:case is.scale:h=Zi;break;default:n.itemSize===1?h=Ri:h=Zi;break}let u=s.interpolation!==void 0?Yx[s.interpolation]:us,f=this._getArrayFromAccessor(n);for(let d=0,x=l.length;d<x;d++){let v=new h(l[d]+"."+is[r.path],t.array,f,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(v),a.push(v)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Vh(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Ci?kh:Il;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function ey(i,e,t){let n=e.attributes,s=new $t;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new k(l[0],l[1],l[2]),new k(c[0],c[1],c[2])),o.normalized){let h=Vh(yr[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new k,l=new k;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let f=t.json.accessors[u.POSITION],d=f.min,x=f.max;if(d!==void 0&&x!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(x[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(x[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(x[2]))),f.normalized){let v=Vh(yr[f.componentType]);l.multiplyScalar(v)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new yn;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function ld(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=zh[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return tt.workingColorSpace!==fn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${tt.workingColorSpace}" not supported.`),gi(i,e),ey(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?Zx(i,e.targets,t):i})}var Pl=class extends ds{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Ki;e.deleteAttribute("uv");let t=new kn({side:Qt}),n=new kn,s=new _s(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new yt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new ps(e,n,6),o=new bt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new yt(e,vr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new yt(e,vr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new yt(e,vr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new yt(e,vr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new yt(e,vr(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let d=new yt(e,vr(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function vr(i){return new Qr({color:0,emissive:16777215,emissiveIntensity:i})}var Di=Fd(_d()),Fe=i=>document.getElementById(i);function xd({builtin:i,V:e,getState:t,capture:n,install:s,download:r}){let a=new Map,o=new Map,l=0,c=0,h=0,u=null,f=null,d=Fe("model-import-dialog"),x=Fe("workspace-dialog"),v=()=>[i,...a.values()],m=()=>v().find(g=>g.id===t().modelId)||i,p=g=>{Fe("workbench-message").textContent=g};function R(){t().loaded&&!t().failed&&o.set(t().modelId,JSON.parse(n()))}function L(g){e.registerModel(g.id,{label:g.name,author:g.author,license:g.license})}function S(){let g=m(),T=Fe("model-select");T.replaceChildren(...v().map(N=>{let V=document.createElement("option");return V.value=N.id,V.textContent=`${N.name} · ${N.builtin?"内置":N.place}`,V})),T.value=g.id,Fe("model-name").textContent=g.name,Fe("model-place").textContent=g.builtin?"EIFFEL TOWER · "+g.place:g.place,Fe("model-description").textContent=g.builtin?"从四座塔脚向上，看钢架、平台与塔身如何连成一体。拖动建筑，找一个你喜欢的角度。":"转动、拉近，再从正面和俯视观察。切换建筑会保留各自的构图；保存工作台后可下次继续。",Fe("model-badge").textContent=g.builtin?"完整三维模型 · 钢架结构细节":"本地导入 · 来源由提供者声明";let P=Fe("model-credit");if(P.textContent=`模型作者：${g.author}。许可：${g.license}。`,g.builtin)for(let[N,V]of[[g.authorUrl,"作者主页"],[g.licenseUrl,"许可全文"]]){let G=document.createElement("a");G.href=N,G.target="_blank",G.rel="noreferrer",G.textContent=V,P.append(" ",G)}if(g.source){let N=document.createElement("a");N.href=g.source,N.target="_blank",N.rel="noreferrer",N.textContent="查看原始来源 ↗",P.append(" ",N)}if(g.copyright){let N=document.createElement("p");N.textContent="文件内声明："+g.copyright,P.append(N)}Fe("model-scope").textContent=g.note,Fe("model-stage-label").textContent="3D / "+(g.builtin?"EIFFEL TOWER":g.name),Fe("landmark-canvas").setAttribute("aria-label",`可旋转和缩放的${g.name}三维模型`),Fe("model-caption").textContent=`${g.name} · ${g.author} · ${g.license}
${g.builtin?"模型随程序保存，断网可用。":"本地文件仅在当前页面保留；请保存工作台。身份与许可尚未经程序核实。"}`,Fe("model-remove").hidden=g.builtin}async function E(g,{valid:T=()=>!0,saved:P=o.get(g.id),commit:N=()=>{},keep:V=!0}={}){let G=++l;V&&R(),p("正在准备 "+g.name+"…");try{return await s(g,{saved:P,valid:()=>G===l&&T(),commit:N})?(S(),p(`正在观察 ${g.name} · 本地收藏 ${a.size}/3；各建筑视角独立保留。`),!0):!1}catch(M){throw G===l&&T()&&(S(),p("模型未切换："+M.message)),M}}Fe("model-select").addEventListener("change",()=>{let g=v().find(T=>T.id===Fe("model-select").value);g&&E(g).catch(()=>{})}),Fe("model-remove").addEventListener("click",async()=>{let g=m();if(!g.builtin)try{if(!await E(i))return;a.delete(g.id),o.delete(g.id),e.unregisterModel(g.id),S(),p("已移除 "+g.name+"；原始本地文件不受影响。")}catch{}});function A(){u=null,Fe("model-import-apply").disabled=!0,Fe("model-import-preview").textContent=""}Fe("model-import").addEventListener("click",()=>{c++,A(),Fe("model-import-error").textContent="",Fe("model-import-form").reset(),d.showModal()}),Fe("model-import-close").addEventListener("click",()=>d.close()),d.addEventListener("close",()=>{d.open||(c++,l++,A())}),Fe("model-file").addEventListener("change",async()=>{let g=++c,T=Fe("model-file").files[0];if(A(),Fe("model-import-error").textContent="",!!T){Fe("model-import-preview").textContent="正在检查模型结构与范围…";try{if(T.size>Di.default.LIMITS.file)throw new Error("每份模型不能超过 8 MiB");let P=new Uint8Array(await T.arrayBuffer());if(g!==c)return;let N=await Di.default.inspect(P,{name:T.name.replace(/\.glb$/i,"")});if(g!==c)return;Di.default.quota(a.values(),N),u=N,Fe("model-input-name").value=N.name,Fe("model-import-preview").textContent=`${N.triangles.toLocaleString("zh-CN")} 个网格三角面 · ${(N.bytes.length/1048576).toFixed(2)} MiB · SHA-256 ${N.sha256.slice(0,12)}…${N.warnings?` · ${N.warnings} 项提示`:""}`,Fe("model-import-apply").disabled=!1}catch(P){g===c&&(A(),Fe("model-import-error").textContent=P.message)}}}),Fe("model-import-form").addEventListener("submit",async g=>{if(g.preventDefault(),!u)return;let T=c;Fe("model-import-apply").disabled=!0,Fe("model-import-error").textContent="";try{let P={...u,...Di.default.metadata(Object.fromEntries(["name","place","author","license","source"].map(V=>[V,Fe("model-input-"+V).value])))};Di.default.quota(a.values(),P),await E(P,{valid:()=>d.open&&T===c,commit:()=>{L(P),a.set(P.id,P)}})&&d.close()}catch(P){T===c&&(Fe("model-import-error").textContent=P.message)}finally{T===c&&(Fe("model-import-apply").disabled=!u)}}),Fe("workspace-save").addEventListener("click",()=>{try{R();let g=Di.default.serialize([...a.values()],o,m().id,i,e);r(new Blob([g],{type:"application/json"}),"城市纹理-建筑工作台.json"),p("工作台已下载，包含本地模型、来源声明与各建筑视角；可换设备后重新打开。")}catch(g){p("工作台未保存："+g.message)}});function I(){f=null,Fe("workspace-apply").disabled=!0,Fe("workspace-preview").textContent=""}return Fe("workspace-open").addEventListener("click",()=>{h++,I(),Fe("workspace-error").textContent="",Fe("workspace-file").value="",x.showModal()}),Fe("workspace-close").addEventListener("click",()=>x.close()),x.addEventListener("close",()=>{x.open||(h++,l++,I())}),Fe("workspace-file").addEventListener("change",async()=>{let g=++h,T=Fe("workspace-file").files[0];if(I(),Fe("workspace-error").textContent="",!!T){Fe("workspace-preview").textContent="正在核对工作台、模型校验值与视角…";try{if(T.size>Di.default.LIMITS.project)throw new Error("工作台文件不能超过 24 MiB");let P=await T.text();if(g!==h)return;let N=await Di.default.parse(P,i,e);if(g!==h)return;f=N;let V=[i,...N.entries].find(G=>G.id===N.activeId);Fe("workspace-preview").textContent=`内置铁塔 + ${N.entries.length} 份本地模型：${N.entries.map(G=>G.name).join("、")||"无"}。打开后观察 ${V.name}，替换现有收藏与保存视角。`,Fe("workspace-apply").disabled=!1}catch(P){g===h&&(I(),Fe("workspace-error").textContent=P.message)}}}),Fe("workspace-form").addEventListener("submit",async g=>{if(g.preventDefault(),!f)return;let T=f,P=h,N=[i,...T.entries].find(V=>V.id===T.activeId);Fe("workspace-apply").disabled=!0;try{await E(N,{keep:!1,saved:T.views.get(N.id),valid:()=>x.open&&P===h,commit:()=>{for(let G of a.keys())e.unregisterModel(G);for(let G of T.entries)L(G);a=new Map(T.entries.map(G=>[G.id,G])),o=new Map(T.views)}})&&x.close()}catch(V){P===h&&(Fe("workspace-error").textContent=V.message)}finally{P===h&&(Fe("workspace-apply").disabled=!f)}}),{render:S,ready(){for(let g of["model-import","workspace-save","workspace-open"])Fe(g).disabled=!1;S()},state:()=>({models:v().map(g=>({id:g.id,name:g.name,builtin:g.builtin,bytes:g.bytes?.length||i.glbBytes})),localCount:a.size}),remember:R}}var $e=i=>document.getElementById(i),Dl={...window.CityLandmarkData,builtin:!0},At=Dl,Mr=window.CityView,ry={iso:"立体视角",front:"正面",top:"俯视",custom:"自定义视角"},Ta=!1,Yh=null,Jt=!1,en=!1,Ar=!1,br=0,vd=0,qt,En,We,be,ss,Ol,Hn,Es=24,pn="iso",Bl=!1,Ct=0,Ul=[],ba=0,Aa=!1,Sd=null,Md=new k(0,5.6,0),As=!1,Ts=0,Er=!1,wa=1e4;function ay(i){if(!Jt||!We||!be||en||!Ct)return;let t=(Number.isFinite(i)?i:We.position.distanceTo(be.target))+Ct+1;We.far<t&&(We.far=Math.min(wa,Math.max(We.far,t)),We.updateProjectionMatrix());let n=Math.max(be.minDistance+.5,Math.min(We.far-Ct,wa-Ct));be.maxDistance>n&&(be.maxDistance=n)}var Nl;async function bd(i=At){if(!i.builtin)return i.bytes.slice().buffer;if(!Nl){if(typeof DecompressionStream!="function")throw new Error("请使用支持离线解压的新版 Chrome 或 Edge");let e=Uint8Array.from(atob(Dl.data),t=>t.charCodeAt(0));if(Nl=await new Response(new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(),Nl.byteLength!==Dl.glbBytes)throw new Error("内置模型长度不一致")}return Nl}function Oi(i){$e("landmark-status").textContent=i}function ni(){br||!Ta||!Jt||document.hidden||en||(br=requestAnimationFrame(()=>{br=0,!(!Ta||!Jt||document.hidden||en)&&(be.update(),qt.render(En,We),Sd=At.id,vd++,Ar&&ni())}))}function wr(){cancelAnimationFrame(br),br=0}function Kh(){if(!qt||!Ta||en)return;let i=$e("landmark-stage").getBoundingClientRect();if(!i.width||!i.height)return;qt.setSize(Math.round(i.width),Math.round(i.height),!1),We.aspect=i.width/i.height,We.updateProjectionMatrix();let e=Math.min(di.degToRad(We.fov/2),Math.atan(Math.tan(di.degToRad(We.fov/2))*We.aspect)),t=Es;if(Es=(At.builtin?7:Ct||7)/Math.sin(e)*1.13,Jt&&t&&!As){let n=We.position.clone().sub(be.target).multiplyScalar(Es/t);We.position.copy(be.target).add(n)}As=!1,be.minDistance=Math.min(3,be.minDistance);{let n=Math.max(be.minDistance+.5,Math.min(We.far-Ct,wa-Ct));be.maxDistance=Math.max(Es*3,Math.min(n,Ts*1.01))}ni()}function Ed(i,e,t=We.position.distanceTo(be.target)){let n=be.enableDamping;be.enableDamping=!1,be.update(),be.enableDamping=n;let s=new Li(t,i,e).makeSafe();We.position.copy(be.target).add(new k().setFromSpherical(s)),be.update(),ni()}function kl(i){if(!(!Jt||en)){pn=i,be.target.copy(Md),As=!1,be.minPolarAngle=0,be.maxPolarAngle=Math.PI/2-.015,Ed(i==="top"?.035:i==="front"?Math.PI/2:1.08,i==="front"?0:Math.PI/4,Es),Er=!0;try{be.minDistance=3;let e=Math.max(be.minDistance+.5,Math.min(We.far-Ct,wa-Ct));be.maxDistance=Math.max(Es*3,Math.min(e,Ts*1.01))}finally{Er=!1}document.querySelectorAll("[data-camera]").forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.camera===i)))}}function _i(i){Ar=i,be&&(be.autoRotate=i),$e("landmark-spin").setAttribute("aria-pressed",String(i)),$e("landmark-spin").textContent=i?"暂停旋转":"自动旋转",ni()}function Zh(i){Bl=i,ss?.traverse(e=>{if(e.isMesh)for(let t of Array.isArray(e.material)?e.material:[e.material])t.wireframe=i,t.needsUpdate=!0}),ni()}function Jh(i){if(!Jt||en)return;let e=We.position.clone().sub(be.target);e.setLength(di.clamp(e.length()*i,be.minDistance,be.maxDistance)),We.position.copy(be.target).add(e),be.update(),ni()}function zl(i,e){let t=URL.createObjectURL(i),n=document.createElement("a");n.href=t,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(t),3e4)}function yd(i){ba++,Aa=!1,en=!0,Jt=!1,wr(),_i(!1),$e("landmark-stage").dataset.state="error",$e("landmark-retry").hidden=!1,$e("landmark-controls").querySelectorAll("button,input").forEach(e=>{e.disabled=!0}),Oi("三维展台暂时无法显示："+i+"。可以重试，或回到城区比较继续使用。")}function oy(){ba++,Aa=!1,wr(),Jt=!1,be?.dispose(),ss&&En?.remove(ss),Ea(Ul),Ul=[],En?.traverse(i=>{if(i.isMesh){i.geometry.dispose();for(let e of Array.isArray(i.material)?i.material:[i.material])e.dispose()}}),Ol?.dispose(),qt?.dispose(),qt?.forceContextLoss(),qt=be=En=We=ss=Ol=null}function Ea(i){let e=new Set,t=new Set,n=new Set,s=new Set;for(let r of i)r.traverse(a=>{a.geometry&&e.add(a.geometry);for(let o of a.material?Array.isArray(a.material)?a.material:[a.material]:[]){t.add(o);for(let[l,c]of Object.entries(o))l!=="envMap"&&c?.isTexture&&n.add(c)}});for(let r of e)r.dispose();for(let r of t)r.dispose();for(let r of n)r.source?.data?.close&&s.add(r.source.data),r.dispose();for(let r of s)r.close()}async function ly(i){let e=new rr,t=[],n=new Set;e.setURLModifier(r=>{if(!r.startsWith("blob:")&&!/^data:image\/(png|jpeg);base64,/i.test(r))throw new Error("模型包含非内嵌资源，不能离线加入");return r.startsWith("blob:")&&n.add(r),r}),e.onError=r=>t.push(r);let s;try{s=await new Rl(e).parseAsync(await bd(i),"")}finally{for(let r of n)URL.revokeObjectURL(r)}try{if(t.length)throw new Error("模型贴图未能解码，原有建筑已保留");let r=s.scene,a=new $t().setFromObject(r),o=a.getSize(new k),l=Math.max(o.x,o.y,o.z);if(!Number.isFinite(l)||l<1e-9||l>1e12)throw new Error("模型数值尺度过小或过大，无法可靠展示");r.scale.multiplyScalar(12/l);let c=new $t().setFromObject(r),h=c.getCenter(new k);r.position.sub(new k(h.x,c.min.y,h.z));let u=new $t().setFromObject(r),f=u.getSize(new k),d=f.length()/2;if(!Number.isFinite(d)||d<=0)throw new Error("模型展示范围无效");return r.traverse(x=>{x.isMesh&&(x.castShadow=!0,x.receiveShadow=!0)}),{root:r,scenes:s.scenes,extent:d,targetY:i.builtin?5.6:f.y/2}}catch(r){throw Ea(s.scenes),r}}async function Td(i,{saved:e,valid:t=()=>!0,commit:n=()=>{}}={}){if(!qt||en)throw new Error("请先重试三维展台，再加入模型");let s=++ba;Aa=!0;let r,a=!1;try{if(r=await ly(i),s!==ba||!t())return Ea(r.scenes),!1;let o=e?Mr.validateView(e,{[i.id]:i}):null;if(o&&o.view.far<o.view.distance+r.extent)throw new Error("保存视角的远裁剪面不足以显示这份模型");n(),wr(),_i(!1),Tr++,Ra(),ws.open&&ws.close();let l=Ul;return ss&&En.remove(ss),At=i,ss=r.root,Ul=r.scenes,Ct=r.extent,Md.set(0,r.targetY,0),En.add(ss),As=!1,Ts=0,Bl=!1,We.fov=40,We.near=.1,We.far=180,We.updateProjectionMatrix(),be.minDistance=3,be.maxDistance=180-Ct,be.minPolarAngle=0,be.maxPolarAngle=Math.PI/2-.015,Jt=!0,$e("landmark-stage").dataset.state="ready",$e("landmark-wireframe").checked=!1,Kh(),kl("iso"),o&&Rd(o),a=!0,Ea(l),$e("landmark-controls").querySelectorAll("button,input").forEach(c=>{c.disabled=!1}),Oi(`${At.triangles.toLocaleString("zh-CN")} 个网格三角面 · ${At.name}已加载，可拖动旋转`),Id.ready(),ni(),!0}catch(o){throw r&&!a&&Ea(r.scenes),o}finally{s===ba&&(Aa=!1)}}async function Ad(){en=!1,$e("landmark-retry").hidden=!0,$e("landmark-stage").dataset.state="loading",Oi("正在准备三维模型…");let i=$e("landmark-canvas");Hn=i.cloneNode(!1),i.replaceWith(Hn);try{qt=new bl({canvas:Hn,antialias:!0,preserveDrawingBuffer:!0}),qt.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),qt.outputColorSpace=Lt,qt.toneMapping=ca,qt.toneMappingExposure=1.5,qt.shadowMap.enabled=!0,qt.shadowMap.type=Io,En=new ds,En.background=new Be("#ecefe7"),We=new zt(40,1,.1,180),be=new wl(We,Hn),be.enableDamping=!0,be.dampingFactor=.12,be.maxPolarAngle=Math.PI/2-.015,be.autoRotateSpeed=.7,be.autoRotate=Ar,be.addEventListener("change",()=>{Er||ay(),ni()}),be.addEventListener("start",()=>{_i(!1)}),be.addEventListener("end",()=>{As&&(As=!1),pn="custom",document.querySelectorAll("[data-camera]").forEach(a=>a.setAttribute("aria-pressed",String(a.dataset.camera===pn)))});let e=new _r(qt),t=new Pl;Ol=e.fromScene(t,.04).texture,En.environment=Ol,t.dispose(),e.dispose(),En.add(new ia(14477567,11905678,2.3));let n=new $i(16772559,4.5);n.position.set(10,22,14),n.castShadow=!0,n.shadow.mapSize.set(1024,1024),n.shadow.camera.left=n.shadow.camera.bottom=-11,n.shadow.camera.right=n.shadow.camera.top=11,n.shadow.camera.far=60,n.shadow.bias=-5e-4,En.add(n);let s=new $i(14872063,2);s.position.set(-13,10,-9),En.add(s);let r=new yt(new $r(7.4,7.4,.16,80),new kn({color:"#e3e8db",roughness:.95}));r.position.y=-.09,r.receiveShadow=!0,En.add(r),await Td(At),Hn.addEventListener("webglcontextlost",a=>{a.target===Hn&&(a.preventDefault(),yd("图形上下文已中断"))}),Hn.addEventListener("keydown",a=>{if(!Jt||en||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Home"," "].includes(a.key))return;a.preventDefault();let l=Ar;_i(!1);let c=new Li().setFromVector3(We.position.clone().sub(be.target));if(a.key.startsWith("Arrow")){let h=di.clamp(c.phi+(a.key==="ArrowUp"?-.12:a.key==="ArrowDown"?.12:0),.03,Math.PI/2-.02);Ed(h,c.theta+(a.key==="ArrowLeft"?-.16:a.key==="ArrowRight"?.16:0)),pn="custom",document.querySelectorAll("[data-camera]").forEach(u=>u.setAttribute("aria-pressed",String(u.dataset.camera===pn)))}else a.key==="Home"?kl("iso"):a.key===" "?_i(!l):(Jh(a.key==="-"?1.18:1/1.18),pn="custom",document.querySelectorAll("[data-camera]").forEach(h=>h.setAttribute("aria-pressed",String(h.dataset.camera===pn))))})}catch(e){yd(e.message||"浏览器未启用 WebGL 2")}}function cy(i){if(Ta=i,!i){wr();return}Yh?Jt&&(Kh(),ni()):Yh=Ad()}function wd(){if(!Jt||!We||!be||en)throw new Error("模型未就绪，无法保存视角");let i=We.position.distanceTo(be.target);if(Ct>0&&We.far<i+Ct)throw new Error(`当前远裁剪面（${We.far}）小于相机距离与模型包围球半径之和 ${(i+Ct).toFixed(2)}，请调整视角或等待投影保护同步后再保存`);let e=Mr.createView(At.id,{view:pn,camera:We.position.toArray(),target:be.target.toArray(),fov:We.fov,near:We.near,far:We.far},Bl);return JSON.stringify(e,null,2)}function hy(i){let e=ry[i.view.view]||"自定义视角",t=i.view.distance.toFixed(2);return`${e} · 距离 ${t} · FOV ${i.view.fov.toFixed(1)}° · ${i.wireframe?"线框模式":"实体模式"}`}function Rd(i){if(!Jt||en)throw new Error("模型未就绪，无法打开视角");if(i.modelId!==At.id)throw new Error("视角对应的模型与当前展台不一致");let e=i.view.distance;if(i.view.far<e+Ct)throw new Error(`视角远裁剪面（${i.view.far}）过小，需要至少 ${(e+Ct).toFixed(2)} 才能看到完整模型`);let t=Er;Er=!0;try{_i(!1);let n=be.enableDamping;be.enableDamping=!1,be.update(),be.enableDamping=n;let s=be.minDistance,r=be.minPolarAngle,a=be.maxPolarAngle;be.minDistance=0,be.maxDistance=Math.max(Ts,e)*1.01,be.minPolarAngle=0,be.maxPolarAngle=Math.PI,We.position.set(i.view.camera[0],i.view.camera[1],i.view.camera[2]),be.target.set(i.view.target[0],i.view.target[1],i.view.target[2]),We.fov=i.view.fov,We.near=i.view.near,We.far=i.view.far,We.updateProjectionMatrix(),be.update(),be.minDistance=e<s?Math.max(1,e*.999):s,Ts=Math.max(Ts,e);let o=Math.max(be.minDistance+.5,Math.min(We.far-Ct,wa-Ct));be.maxDistance=Math.max(Es*3,Math.min(o,Ts*1.01)),be.minPolarAngle=0,be.maxPolarAngle=Math.PI}finally{Er=t}As=!0,pn=i.view.view,document.querySelectorAll("[data-camera]").forEach(n=>n.setAttribute("aria-pressed",String(n.dataset.camera===pn))),Zh(i.wireframe),$e("landmark-wireframe").checked=i.wireframe,ni()}var ws=$e("landmark-view-dialog"),Tr=0,Fl=null;function Ra(){Fl=null,$e("apply-view-file").disabled=!0,$e("view-file-preview").textContent=""}$e("save-view").addEventListener("click",()=>{if(!Jt||en){Oi("模型未就绪，无法保存视角");return}try{let i=wd();zl(new Blob([i],{type:"application/json"}),"城市纹理-三维视角.json"),Oi("视角已下载为 城市纹理-三维视角.json。请在同版本预览中点“打开三维视角”恢复。")}catch(i){Oi("保存视角失败："+i.message)}});$e("open-view").addEventListener("click",()=>{if(!Jt||en){Oi("请先准备好模型，再打开视角文件");return}Tr++,Ra(),$e("view-file-error").textContent="",$e("view-file").value="",ws.showModal()});$e("close-view-dialog").addEventListener("click",()=>ws.close());ws.addEventListener("close",()=>{ws.open||(Tr++,Ra())});$e("view-file").addEventListener("change",async()=>{let i=++Tr,e=$e("view-file").files[0];if(Ra(),$e("view-file-error").textContent="",!!e){$e("view-file-preview").textContent="正在检查视角文件…";try{if(e.size>Mr.MAX_BYTES)throw new Error(`视角文件不能超过 ${Mr.MAX_BYTES} 字节`);let t=await e.text();if(i!==Tr)return;let n=Mr.parseView(t);if(n.modelId!==At.id)throw new Error("视角对应的模型与当前展台不一致");if(Ct>0&&n.view.far<n.view.distance+Ct)throw new Error(`视角远裁剪面（${n.view.far}）过小，需要至少 ${(n.view.distance+Ct).toFixed(2)} 才能显示完整模型`);Fl=n,$e("view-file-preview").textContent=hy(n),$e("apply-view-file").disabled=!1}catch(t){i===Tr&&(Ra(),$e("view-file-error").textContent=t.message)}}});$e("view-file-form").addEventListener("submit",i=>{if(i.preventDefault(),!!Fl)try{Rd(Fl),ws.close(),Oi("已打开三维视角，恢复预设、距离、缩放和线框。")}catch(e){$e("view-file-error").textContent=e.message}});document.querySelectorAll("[data-observation]").forEach(i=>i.addEventListener("click",()=>{let e=i.dataset.observation==="landmark";$e("landmark-showcase").hidden=!e,$e("map-workspace").hidden=e,document.querySelector(".notes").hidden=e,document.querySelectorAll("[data-observation]").forEach(t=>t.setAttribute("aria-pressed",String(t===i))),cy(e)}));document.querySelectorAll("[data-camera]").forEach(i=>i.addEventListener("click",()=>{_i(!1),kl(i.dataset.camera)}));$e("landmark-spin").addEventListener("click",()=>_i(!Ar));$e("landmark-in").addEventListener("click",()=>{Jh(1/1.18),pn="custom",document.querySelectorAll("[data-camera]").forEach(i=>i.setAttribute("aria-pressed",String(i.dataset.camera===pn)))});$e("landmark-out").addEventListener("click",()=>{Jh(1.18),pn="custom",document.querySelectorAll("[data-camera]").forEach(i=>i.setAttribute("aria-pressed",String(i.dataset.camera===pn)))});$e("landmark-reset").addEventListener("click",()=>{_i(!1),$e("landmark-wireframe").checked=!1,Zh(!1),kl("iso")});$e("landmark-wireframe").addEventListener("change",i=>Zh(i.target.checked));$e("landmark-retry").addEventListener("click",()=>{oy(),Yh=Ad()});$e("landmark-download").addEventListener("click",async()=>{try{let i=At;zl(new Blob([await bd(i)],{type:"model/gltf-binary"}),i.builtin?"eiffel-tower-SDC-CC-BY-4.0.glb":`城市纹理-${Cd(i.name)}.glb`)}catch(i){Oi("模型下载失败："+i.message)}});$e("landmark-export").addEventListener("click",()=>{if(!Jt||en)return;_i(!1),qt.render(En,We);let i=document.createElement("canvas");i.width=1600,i.height=1200;let e=i.getContext("2d");e.fillStyle="#f6f5ef",e.fillRect(0,0,1600,1200),e.fillStyle="#253b34",e.font="34px sans-serif",e.fillText("城市纹理 / 经典建筑 3D",60,65),e.font="21px sans-serif",e.fillText(`${At.name} · ${At.place}`,60,104,1480);let t=Math.min(1480/Hn.width,900/Hn.height),n=Hn.width*t,s=Hn.height*t;e.drawImage(Hn,(1600-n)/2,125+(900-s)/2,n,s),e.font="16px sans-serif",e.fillStyle="#67766c",e.fillText(`模型：${At.author} · ${At.license} · 已统一展示缩放，不用于测量。`,60,1062,1480),e.fillText(At.source||"本地模型 · 原始来源链接未声明",60,1096,1480),e.fillText(At.builtin?"https://sketchfab.com/3Duae · https://creativecommons.org/licenses/by/4.0/":"本地导入；作者、来源与许可为提供者声明。"+(At.copyright?" 文件内声明："+At.copyright:""),60,1130,1480),e.fillText("城市纹理 v0.9 · https://github.com/LouHC0814/city-texture",60,1164);let r=Cd(At.name);i.toBlob(a=>{a&&zl(a,`城市纹理-${r}3D.png`)},"image/png")});function Cd(i){return i.replace(/[<>:"/\\|?*\u0000-\u001f]/g,"_").slice(0,80)}var Id=xd({builtin:Dl,V:Mr,getState:()=>({modelId:At.id,loaded:Jt,failed:en}),capture:wd,install:Td,download:zl});new ResizeObserver(()=>{Kh()}).observe($e("landmark-stage"));document.addEventListener("visibilitychange",()=>{document.hidden?wr():ni()});window.addEventListener("pagehide",wr);window.CityLandmarks={getState:()=>({active:Ta,loaded:Jt,failed:en,spinning:Ar,wireframe:Bl,view:pn,renders:vd,visible:!document.hidden,controlState:be?.state,pendingFrame:!!br,camera:We?.position.toArray(),target:be?.target.toArray(),triangles:At.triangles,fov:We?.fov,near:We?.near,far:We?.far,modelExtent:Ct,minDistance:be?.minDistance,maxDistance:be?.maxDistance,modelId:At.id,modelName:At.name,renderedModelId:Sd,switching:Aa,library:Id.state(),memory:qt?{...qt.info.memory}:null,contextLost:qt?.getContext().isContextLost()??!0})};})();

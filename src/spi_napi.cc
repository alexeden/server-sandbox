#define NAPI_VERSION 3
#include <node_api.h>
#include <assert.h>

#define DECLARE_METHOD(name, func) { name, NULL, func, NULL, NULL, NULL, napi_enumerable, NULL }

napi_value Hello(napi_env env, napi_callback_info info) {
  napi_status status;
  napi_value world;
  status = napi_create_string_utf8(env, "world", 5, &world);
  assert(status == napi_ok);
  return world;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_property_descriptor hello = DECLARE_METHOD("hello", Hello);
  status = napi_define_properties(env, exports, 1, &hello);
  assert(status == napi_ok);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init);

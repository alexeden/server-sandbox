{
  "targets": [
    {
      "target_name": "spi_napi",
      "sources": [
        "src/spi_napi.cc"
      ],
      "cflags": [ '-Wall' ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7',
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      },
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      # 'defines': [ 'NAPI_CPP_EXCEPTIONS' ],
    },
    # {
    #   "target_name": "spi_napi",
    #   "sources": [
    #     "src/spi_napi.cc"
    #   ],
    #   "cflags": [ '-Wall' ],
    #   'cflags!': [ '-fno-exceptions' ],
    #   'cflags_cc!': [ '-fno-exceptions' ],
    #   "include_dirs": [
    #     "<!@(node -p \"require('node-addon-api').include\")"
    #   ],
    #   'dependencies': [
    #     "<!(node -p \"require('node-addon-api').gyp\")"
    #   ],
    #   'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    # },
    {
      "target_name": "spi_binding",
      "sources": [
        "src/spi_binding.cc"
      ],
      "include_dirs" : [
        '<!(node -e "require(\'nan\')")'
      ]
    }
  ]
}

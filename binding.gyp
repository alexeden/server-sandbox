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
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    },
    # {
    #   "target_name": "spi_binding",
    #   "sources": [
    #     "src/spi_binding.cc"
    #   ],
    #   "include_dirs" : [
    #     '<!(node -e "require(\'nan\')")'
    #   ]
    # }
  ]
}

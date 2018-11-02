{
  "targets": [
    {
      "target_name": "spi_binding",
      "sources": [
        "src/spi_binding.cc"
      ],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ]
    },
  ]
}

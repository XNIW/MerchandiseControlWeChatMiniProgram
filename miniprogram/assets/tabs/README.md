# Native tab icons

Original icons for Home, Sales, Database, Recent activity and Account. Each has
an inactive and selected PNG using the app's existing tab colors. Selected
icons also use a heavier stroke. Labels remain visible in all supported locales.

The committed files are transparent 81 × 81 PNGs, each below 40 KB. The normal
Node build copies them into `dist/assets/tabs`; no remote asset or runtime
dependency is required.

To regenerate, run `python3 scripts/generate-tab-icons.py` with Pillow available.
Pillow is optional asset tooling only (available in the local bundled runtime);
it is not needed for building or using the Mini Program. The generator and the
committed raster files are the source for these simple geometric icons.

Native tab configuration reference:
https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html

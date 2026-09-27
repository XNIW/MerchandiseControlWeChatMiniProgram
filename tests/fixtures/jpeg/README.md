# JPEG regression data

The 24x18 baseline/progressive JPEGs are generated local RGB gradients (Pillow,
quality82). They contain no user image or metadata. The ICC fixture is the
456-byte Google/Skia sRGB profile measured from the authorized DevTools encoder;
its entire content was independently reconstructed from the pinned public Skia
serializer and sRGB constants. See docs/testing/WECHAT-010-JPEG.md for provenance.

Tests insert APP2 explicitly and require byte-for-byte equality with the original
JPEG after normalization. They do not claim live upload acceptance.

---
project: super-image-border
locale: en
---
## From image editing to reliable export

Photo Frame Studio 2.0 is a native Android application built with Kotlin and Jetpack Compose. Seven tool groups cover templates, canvas proportions, borders, text, EXIF metadata, watermarks, and colour. Editing happens locally, without an account.

Eight template families contain thirty-two original designs. EXIF fields can be read automatically, overridden, or hidden. Text, logos, and watermarks are independent layers. These features share a scene description rather than maintaining separate copies of an image.

## One scene, two rendering contexts

A mobile preview needs to stay lightweight; export needs to preserve full resolution. A shared scene model describes the canvas, layers, and metadata. Preview uses reduced working images, while SDR export combines region decoding and strip encoding to manage memory.

The export pipeline provides JPEG, PNG, and ICC profiles matched to the actual output. Ultra HDR on Android 14 and later has explicit constraints: colour adjustments, image slicing, and memory limits affect availability. HDR preservation is not claimed for every editing combination.

## Local state and export tasks

Room manages drafts, presets, and export tasks, with DataStore for settings. Editing supports undo and redo. Serial batch tasks can be paused, resumed, and retried. Original files are read-only; GPS and device serial numbers are removed from output by default.

The image on this page is a Compose UI snapshot from the public repository, using a sample image. The native 2.0 source is available for inspection. A retained legacy web tool is a separate version and is not a demo of the native editor. Test and device acceptance details are documented in the repository.

# Robot-RB-3

A 3D model of the RB-3 industrial robot, originally built as a school project in C++ (MFC + legacy OpenGL / glaux), now remade as an interactive web app with [three.js](https://threejs.org/).

**▶ Live demo: [rb-3.netlify.app](https://rb-3.netlify.app/)**

![Robot RB-3 running the pick & place routine](screenshot.png)

## Live web version (three.js)

Built with [three.js](https://threejs.org/) and bundled with [Parcel](https://parceljs.org/):

```bash
npm install
npm start        # dev server at http://localhost:1234
npm run build    # production build to dist/
```

To deploy (e.g. Netlify): build command `npm run build`, publish directory `dist`.

### Features

- **Fully articulated arm** — 5 controllable joints (base yaw, shoulder, elbow, wrist, tool roll) instead of the original's fixed pose
- **Pick & place mode** — a closed-form inverse-kinematics solver drives the arm to ferry a crate between two pallets, gripping and releasing it in a continuous loop
- **Free motion cycle** — a smooth demo routine, with a glowing trail tracing the tool center point
- **Bloom post-processing** — the tool tip, trail and highlights glow (toggleable, in case your GPU disagrees)
- **Live TCP readout** — joint angles and tool tip coordinates update in real time
- **PBR materials, soft shadows and environment lighting** — industrial-orange finish with a proper studio look
- **Orbit camera** — drag to rotate, scroll to zoom (the original only rotated via window scrollbars)
- **Wireframe "1998 mode"** — a toggle that renders the model as wireframe, as a homage to the original glaux version

## Original project (C++ / OpenGL)

The task was to create a program to render a 3D model of an industrial robot of choice — in my case the Robot RB-3.
The source model:

![image](https://user-images.githubusercontent.com/82973470/217369016-e6552942-d8ad-47e3-a41d-0a66c6a6ad04.png)

And the result:

![image](https://user-images.githubusercontent.com/82973470/217368798-0eb06cc5-2272-417e-8684-541dd45e7b7e.png)

The original allowed simple rotation of the view along the x- and y-axis via scrollbars. Source lives in `App.cpp` / `App.h`.

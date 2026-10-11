/* ════════════════════════════════════════════════
   SHARED STATE
   Values other modules change. ES module imports are read-only,
   so they live as properties on this one object.
════════════════════════════════════════════════ */
export const state = {
  objects: [],         // in-memory copy of objects.json
  stream: null,        // camera MediaStream while the camera is open
  mirrored: false,     // true for a camera facing the user, so preview and photo read like a mirror
  pendingPhoto: null,  // { base64, mime } of the cut-out waiting to be saved
  justSaved: null,     // id of the object just saved; the grid drops it in once
};

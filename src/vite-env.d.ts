/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ATTENDANCE_CLEARANCE_URL?: string;
  readonly VITE_ATTENDANCE_CLEARANCE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

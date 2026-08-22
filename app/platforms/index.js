import { isTauri } from "@tauri-apps/api/core"

import * as web from "./web"
import * as desktop from "./desktop"
// export * from "./desktop/database"
export * as lesson from "./desktop/lesson"
// export * from "./desktop/examHistory";

// import * as mobile from "./mobile"

const isDesktop = isTauri()

const isMobile = false

const platform = isDesktop
  ? desktop
  : web

export default platform
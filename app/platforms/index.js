import { isTauri } from "@tauri-apps/api/core"
import { isMobileTauri } from "~/utils/isMobileTauri"

import * as web from "./web"
import * as desktop from "./desktop"
import * as mobile from "./mobile"
// export * from "./desktop/database"
export * as lesson from "./desktop/lesson"
// export * from "./desktop/examHistory";

const isMobile = isMobileTauri()
const isDesktop = isTauri() && !isMobile

const platform = isDesktop
  ? desktop
  : isMobile
    ? mobile
    : web

export default platform
import {
  exists,
  mkdir,
  readFile,
  writeFile
} from "@tauri-apps/plugin-fs"

import {
  appConfigDir,
  join,
  resolveResource
} from "@tauri-apps/api/path"


const databases = [
  "lessons.db",
  "questions.db"
]


export async function initializeBundledDatabases() {

  const appConfig = await appConfigDir()

  console.log("📁 AppConfig:", appConfig)


  // Ensure the SQLite plugin's AppConfig directory exists.
  if (!(await exists(appConfig))) {
    await mkdir(appConfig, {
      recursive: true
    })
  }


  for (const database of databases) {

    const destination = await join(
      appConfig,
      database
    )

    const source = await resolveResource(
      `resources/${database}`
    )


    const alreadyExists =
      await exists(destination)


    if (alreadyExists) {

      console.log(
        `✅ ${database} already exists`
      )

      continue
    }


    console.log(
      `📦 Copying ${database}`
    )

    const data =
      await readFile(source)


    await writeFile(
      destination,
      data
    )


    console.log(
      `✅ ${database} copied successfully`
    )
  }
}
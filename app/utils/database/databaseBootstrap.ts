import {
  exists,
  mkdir,
  readFile,
  writeFile
} from "@tauri-apps/plugin-fs"

import {
  appDataDir,
  resourceDir
} from "@tauri-apps/api/path"


const databases = [
  "cbt.db",
  "lessons.db",
  "questions.db",
  "dictionary.db"
]


export async function initializeBundledDatabases() {

  const appData = await appDataDir()
  const resources = await resourceDir()

  console.log("📁 AppData:", appData)
  console.log("📦 Resources:", resources)


  // Make sure AppData directory exists
  if (!(await exists(appData))) {
    await mkdir(appData, {
      recursive: true
    })
  }


  for (const database of databases) {

    const destination =
      `${appData}${database}`

    const source =
      `${resources}${database}`


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
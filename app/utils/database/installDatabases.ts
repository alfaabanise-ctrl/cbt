import {
  copyFile,
  exists,
  mkdir,
  BaseDirectory
} from '@tauri-apps/plugin-fs'

const DATABASE_DIR = 'databases'

const databases = [
  'questions.db',
  'lessons.db',
  'dictionary.db'
]

export async function installBundledDatabases() {
  console.log('📦 Checking bundled databases...')

  const directoryExists = await exists(DATABASE_DIR, {
    baseDir: BaseDirectory.AppLocalData
  })

  if (!directoryExists) {
    await mkdir(DATABASE_DIR, {
      baseDir: BaseDirectory.AppLocalData,
      recursive: true
    })

    console.log('📁 Created database directory')
  }

  for (const database of databases) {
    const destination = `${DATABASE_DIR}/${database}`

    const alreadyExists = await exists(destination, {
      baseDir: BaseDirectory.AppLocalData
    })

    if (alreadyExists) {
      console.log(`✅ ${database} already exists`)
      continue
    }

    console.log(`📥 Installing ${database}...`)

    await copyFile(
      `resources/${database}`,
      destination,
      {
        fromPathBaseDir: BaseDirectory.Resource,
        toPathBaseDir: BaseDirectory.AppLocalData
      }
    )

    console.log(`✅ ${database} installed`)
  }

  console.log('🎉 All bundled databases ready')
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod commands;
mod device;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Filesystem plugin
        .plugin(tauri_plugin_fs::init())

        // Logging plugin
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )

        // Store plugin
        .plugin(tauri_plugin_store::Builder::default().build())
        
        

        // SQLite plugin
        .plugin(tauri_plugin_sql::Builder::default().build())

        // Tauri commands
        .invoke_handler(tauri::generate_handler![
            commands::get_device_id
        ])

        // Run application
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod commands;

mod device;

use tauri::Manager;

// ==========================================
// SPLASH SCREEN COMMAND
// ==========================================

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    // Close splash screen
    if let Some(splash) = app.get_webview_window("splashscreen") {
        splash.close().map_err(|e| e.to_string())?;
    }

    // Show and focus main window
    if let Some(main) = app.get_webview_window("main") {
        main.show().map_err(|e| e.to_string())?;
        main.set_focus().map_err(|e| e.to_string())?;
    }

    Ok(())
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // ==========================================
        // GLOBAL SINGLE INSTANCE
        // ==========================================
        //
        // Prevents multiple copies of the entire
        // ExamTips desktop application from running.
        //
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            println!("ExamTips is already running.");

            // Focus the existing application window
            if let Some(main) = app.get_webview_window("main") {
                let _ = main.show();
                let _ = main.set_focus();
            }
        }))
        // ==========================================
        // FILESYSTEM PLUGIN
        // ==========================================
        .plugin(tauri_plugin_fs::init())
        // ==========================================
        // LOGGING PLUGIN
        // ==========================================
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        // ==========================================
        // STORE PLUGIN
        // ==========================================
        .plugin(tauri_plugin_store::Builder::default().build())
        // ==========================================
        // SQLITE PLUGIN
        // ==========================================
        .plugin(tauri_plugin_sql::Builder::default().build())
        // ==========================================
        // opener
        // ==========================================
        .plugin(tauri_plugin_opener::init())
         // ==========================================
        // COMMANDS
        // ==========================================
        .invoke_handler(tauri::generate_handler![
            commands::get_device_id,
            show_main_window
        ])
        // ==========================================
        // RUN APPLICATION
        // ==========================================
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}

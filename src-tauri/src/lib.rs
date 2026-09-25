#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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

        // ==========================================
        // STRONGHOLD
        // ==========================================
        //
        // Used for securely storing sensitive
        // software credentials such as the
        // Ed25519 private key.
        //
        .setup(|app| {
            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect(
                    "Could not resolve app local data directory",
                )
                .join("stronghold-salt.txt");

            app.handle()
                .plugin(
                    tauri_plugin_stronghold::Builder::with_argon2(
                        &salt_path,
                    )
                    .build(),
                )?;

            Ok(())
        })

        // ==========================================
        // OPENER
        // ==========================================
        .plugin(tauri_plugin_opener::init())

        // ==========================================
        // SINGLE INSTANCE
        // ==========================================
        //
        // Prevents multiple copies of Abanise CBT
        // from running at the same time.
        //
        .plugin(
            tauri_plugin_single_instance::init(
                |app, _args, _cwd| {
                    println!(
                        "Abanise CBT is already running."
                    );

                    // Focus existing main window
                    if let Some(main) =
                        app.get_webview_window("main")
                    {
                        let _ = main.show();
                        let _ = main.set_focus();
                    }
                },
            ),
        )

        // ==========================================
        // FILESYSTEM
        // ==========================================
        .plugin(tauri_plugin_fs::init())

        // ==========================================
        // LOGGING
        // ==========================================
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )

        // ==========================================
        // STORE
        // ==========================================
        .plugin(
            tauri_plugin_store::Builder::default()
                .build(),
        )

        // ==========================================
        // SQLITE
        // ==========================================
        .plugin(
            tauri_plugin_sql::Builder::default()
                .build(),
        )

        // ==========================================
        // COMMANDS
        // ==========================================
        .invoke_handler(
            tauri::generate_handler![
                commands::get_device_id,
                show_main_window,
            ],
        )

        // ==========================================
        // RUN
        // ==========================================
        .run(tauri::generate_context!())
        .expect(
            "error while running Tauri application",
        );
}
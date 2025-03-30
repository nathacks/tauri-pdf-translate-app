// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::commands::{exit_app, translate_multiple_pdfs};
use tauri::ActivationPolicy;

mod commands;
mod translate_pdf;
mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                tray::init_macos_menu_extra(app.handle())?;
                // Make the Dock icon invisible
                app.set_activation_policy(ActivationPolicy::Accessory)
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![translate_multiple_pdfs, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run()
}

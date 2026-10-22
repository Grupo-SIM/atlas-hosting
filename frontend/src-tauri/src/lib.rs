#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::Manager;
use tauri::{WebviewUrl, WebviewWindowBuilder};

/// Production URL of the Next.js app; the desktop/mobile shell is a webview onto it.
const APP_URL: &str = match option_env!("ATLAS_APP_URL") {
    Some(url) => url,
    None => "https://atlashosting.com.br",
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init());
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _, _| {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }));
    builder
        .setup(|app| {
            // Debug builds load `build.devUrl` (next dev); release builds load the deployed app.
            let url = if cfg!(debug_assertions) {
                WebviewUrl::App("index.html".into())
            } else {
                WebviewUrl::External(APP_URL.parse().expect("invalid ATLAS_APP_URL"))
            };
            let mut window = WebviewWindowBuilder::new(app, "main", url).title("Atlas Hosting");
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                window = window.inner_size(1280.0, 800.0).resizable(true);
            }
            window.build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running application");
}

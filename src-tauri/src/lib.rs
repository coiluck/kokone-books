use reqwest::header::USER_AGENT;
use scraper::{Html, Selector};

#[tauri::command]
async fn fetch_og_title(url: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    let response = client
        .get(&url)
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")
        .send()
        .await
        .map_err(|e| format!("HTTPリクエストエラー: {}", e))?;

    let html_text = response
        .text()
        .await
        .map_err(|e| format!("HTML取得エラー: {}", e))?;

    // HTMLをパース
    let document = Html::parse_document(&html_text);

    let og_selector = Selector::parse("meta[property='og:title']").unwrap();
    if let Some(element) = document.select(&og_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Ok(content.to_string());
        }
    }

    let title_selector = Selector::parse("title").unwrap();
    if let Some(element) = document.select(&title_selector).next() {
        let title_text = element.text().collect::<Vec<_>>().join("");
        if !title_text.is_empty() {
            return Ok(title_text);
        }
    }

    Err("タイトルが見つかりませんでした".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sharetarget::init())
        .invoke_handler(tauri::generate_handler![fetch_og_title])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

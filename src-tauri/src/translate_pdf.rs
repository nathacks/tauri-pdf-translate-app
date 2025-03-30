use genpdf::elements::{Break, Paragraph};
use genpdf::fonts::from_files;
use genpdf::Document;
use pdf_extract::extract_text;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use tauri_plugin_store::StoreExt;

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<Message>,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OpenAIResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Deserialize)]
struct MessageContent {
    content: String,
}

fn extract_pdf_text(path: &str) -> Result<String, Box<dyn Error>> {
    let text = extract_text(path)?;
    Ok(text)
}

fn prepare_text_for_openai(original_text: &str) -> String {
    original_text.to_string()
}

fn generate_pdf(output_path: &str, content: &str) -> Result<(), Box<dyn Error>> {
    let font_family = from_files("./fonts", "LiberationSans", None)
        .map_err(|e| Box::<dyn Error>::from(format!("Error loading font: {}", e)))?;
    let mut doc = Document::new(font_family);

    for line in content.lines() {
        if line.trim().is_empty() {
            doc.push(Break::new(1));
        } else {
            doc.push(Paragraph::new(line));
        }
    }

    doc.render_to_file(output_path)?;
    Ok(())
}

async fn translate_text(app: tauri::AppHandle, text: &str) -> Result<String, Box<dyn Error>> {
    let store = app
        .store("storeTradFile")
        .map_err(|e| format!("Error opening store: {}", e))?;

    let translate_language = store
        .get("TRANSLATE_TO")
        .ok_or("TRANSLATE_TO not found in store")?
        .as_str()
        .ok_or("TRANSLATE_TO is not a valid string")?
        .to_string();

    let prepared_text = prepare_text_for_openai(text);
    let prompt = format!(
        "Translate the following text to {}, preserving its original layout as closely as possible (including paragraph breaks, section titles, and lists):\n\n{}",
        translate_language,
        prepared_text
    );

    let api_key = store
        .get("OPENAI_API_KEY")
        .ok_or("OPENAI_API_KEY not found in store")?
        .as_str()
        .ok_or("OPENAI_API_KEY is not a valid string")?
        .to_string();

    let request_body = OpenAIRequest {
        model: "gpt-4o-mini-2024-07-18".to_string(),
        messages: vec![
            Message {
                role: "system".to_string(),
                content: "You are a professional translator and document formatter. Preserve the original text layout as closely as possible in the translated output.".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: prompt,
            },
        ],
    };

    let client = Client::new();
    let res = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;

    let response_body: OpenAIResponse = res.json().await?;
    let translated_text = response_body
        .choices
        .first()
        .map(|choice| choice.message.content.clone())
        .unwrap_or_else(|| {
            println!("No translation received from the OpenAI API.");
            "No translation received".to_string()
        });

    Ok(translated_text)
}

pub async fn translate_pdf(
    app: tauri::AppHandle,
    pdf_path: String,
    output_path: String,
) -> Result<String, String> {
    let extracted_text = extract_pdf_text(&pdf_path).map_err(|e| e.to_string())?;

    let translated_text = translate_text(app, &extracted_text)
        .await
        .map_err(|e| e.to_string())?;

    generate_pdf(&output_path, &translated_text).map_err(|e| e.to_string())?;

    Ok(output_path)
}

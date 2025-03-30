use crate::translate_pdf::translate_pdf;

#[tauri::command]
pub async fn translate_multiple_pdfs(
    app: tauri::AppHandle,
    pdf_paths: Vec<String>,
    output_paths: Vec<String>,
) -> Result<Vec<String>, String> {
    if pdf_paths.len() != output_paths.len() {
        return Err("Le nombre de chemins d'entrée et de sortie doit être identique.".into());
    }

    let tasks = pdf_paths
        .into_iter()
        .zip(output_paths.into_iter())
        .map(|(pdf_path, output_path)| translate_pdf(app.clone(), pdf_path, output_path));

    let results = futures::future::join_all(tasks).await;

    let mut outputs = Vec::new();
    for res in results {
        match res {
            Ok(output) => outputs.push(output),
            Err(e) => return Err(e),
        }
    }
    Ok(outputs)
}

#[tauri::command]
pub fn exit_app() {
    std::process::exit(0x0);
}

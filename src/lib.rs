use neon::prelude::*;
use std::fs::{self, File};
use std::io::{BufReader, Read, Write};
use std::path::{Path, PathBuf};
use neon::handle::Managed;
use serde::Serialize;

#[derive(Serialize)]
struct JsonpOutput {
    source: String,
    content: String,
}

fn get_files(dir: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    files.push(path);
                } else {
                    let mut sub_files = get_files(&path);
                    files.append(&mut sub_files);
                }
            }
        }
    }
    files
}

fn build_docs(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let folder = cx.argument::<JsString>(0)?.value(&mut cx);

    fs::create_dir_all(".enhancedocs");

    let output_file = Path::new(".enhancedocs/output.jsonp");

    // If the output file exists, delete it so we can start fresh
    if output_file.exists() {
        fs::remove_file(&output_file).unwrap();
    }

    // Recursively read all files in the directory
    let files = get_files(Path::new(&folder));

    // Write the file contents to the output file
    let mut output = File::create(output_file).unwrap();
    for file in files {
        let file_handle = File::open(&file).unwrap();
        let mut reader = BufReader::new(file_handle);
        let mut content = Vec::new();
        reader.read_to_end(&mut content).unwrap();
        let content = match String::from_utf8(content) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let output_data = JsonpOutput {
            source: file.to_str().unwrap().to_string(),
            content,
        };
        writeln!(output, "{}", serde_json::to_string(&output_data).unwrap()).unwrap();
    }
    Ok(cx.boolean(true))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("buildDocs", build_docs)?;
    Ok(())
}

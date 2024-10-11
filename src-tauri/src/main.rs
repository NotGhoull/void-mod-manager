// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Re-export everything here so they're in the tree

// This only exists to call void_mod_manager_lib::run()
fn main() {
    void_mod_manager_lib::run()
}

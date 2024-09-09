echo Making sure bun deps are ok...
bun i
echo Done
echo Building - Linux
bunx tauri build
echo Done
echo Building - Windows
bunx tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc


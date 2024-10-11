use core::fmt;

// Custom error type
#[derive(Debug)]
pub enum ModManagerError {
    NetworkError(String),
    FileSystemError(String),
    ParseError(String),
}

impl fmt::Display for ModManagerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModManagerError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            ModManagerError::FileSystemError(msg) => write!(f, "File system error: {}", msg),
            ModManagerError::ParseError(msg) => write!(f, "JSON Parse error: {}", msg),
        }
    }
}

impl std::error::Error for ModManagerError {}

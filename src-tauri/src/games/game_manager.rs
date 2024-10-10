use super::Game;

pub struct GameManager {
    games: Vec<Box<dyn Game>>,
}

impl GameManager {
    pub fn new() -> Self {
        GameManager { games: Vec::new() }
    }

    pub fn load_game(&mut self, game: Box<dyn Game>) {
        self.games.push(game);
    }

    pub fn execute_download(&self, game_name: &str, mod_id: String) -> Result<(), String> {
        if let Some(game) = self.get_game_by_name(game_name) {
            game.download_mod(mod_id).map_err(|e| e.to_string())
        } else {
            Err(format!("Game '{}' not found!", game_name))
        }
    }

    pub fn get_game_by_name(&self, name: &str) -> Option<&Box<dyn Game>> {
        self.games
            .iter()
            .find(|game| game.get_name().to_lowercase() == name.to_lowercase())
    }

    pub fn list_games(&self) -> Vec<String> {
        self.games.iter().map(|game| game.get_name()).collect()
    }
}

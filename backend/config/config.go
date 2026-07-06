package config

import "os"

type Config struct {
	Port    string
	DBPath  string
	DataDir string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data/codeflash.db"
	}
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "data"
	}
	return &Config{
		Port:    port,
		DBPath:  dbPath,
		DataDir: dataDir,
	}
}

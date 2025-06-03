package config

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"

	"github.com/spf13/viper"
)

type AppConfig struct {
	Server struct {
		Port string `yaml:"port"`
		Host string `yaml:"host"`
		Mode string `yaml:"mode"`
	} `yaml:"server"`
	DataBase struct {
		Type string `yaml:"type"`
		Path string `yaml:"path"`
	} `yaml:"database"`
	Auth struct {
		Jwt struct {
			Expires  int    `yaml:"expires"`
			Issuer   string `yaml:"issuer"`
			Audience string `yaml:"audience"`
		} `yaml:"jwt"`
	} `yaml:"auth"`
}

var Config AppConfig
var JWT_SECRET []byte

func InitConfig() error {
	viper.SetConfigFile("config/config.yaml")
	viper.SetConfigType("yaml")

	err := viper.ReadInConfig()
	if err != nil {
		log.Printf("Error reading config file, %s", err)
		return err
	}

	err = viper.Unmarshal(&Config)
	if err != nil {
		log.Printf("Unable to decode into struct, %v", err)
		return err
	}

	return nil
}

// 获取JWT密钥
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		b := make([]byte, 16)
		_, err := rand.Read(b)
		if err != nil {
			log.Fatal("Failed to generate JWT secret:", err)
		}
		secret = hex.EncodeToString(b)
	}

	return []byte(secret)
}

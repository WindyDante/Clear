package config

import (
	"log"

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
}

var Config AppConfig

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

package service

import (
	"path/filepath"
	"testing"

	"github.com/LuuDinhTheTai/tzone/infrastructure/configuration"
)

func TestNewAIChatServiceLoadsCatalog(t *testing.T) {
	dataPath := filepath.Clean(filepath.Join("..", "..", "phoneExample.json"))
	svc, err := NewAIChatService(configuration.AIConfig{
		PhoneDataPath: dataPath,
	})
	if err != nil {
		t.Fatalf("expected catalog load success, got error: %v", err)
	}
	if len(svc.catalog) == 0 {
		t.Fatal("expected non-empty catalog")
	}
}

func TestPickCandidatesFindsRelevantDevice(t *testing.T) {
	dataPath := filepath.Clean(filepath.Join("..", "..", "phoneExample.json"))
	svc, err := NewAIChatService(configuration.AIConfig{
		PhoneDataPath: dataPath,
	})
	if err != nil {
		t.Fatalf("failed to init service: %v", err)
	}

	candidates := svc.pickCandidates("toi can iphone", 10)
	if len(candidates) == 0 {
		t.Fatal("expected candidates for iphone query")
	}
}

func TestBuildCardsSkipsUnknownIDs(t *testing.T) {
	dataPath := filepath.Clean(filepath.Join("..", "..", "phoneExample.json"))
	svc, err := NewAIChatService(configuration.AIConfig{
		PhoneDataPath: dataPath,
	})
	if err != nil {
		t.Fatalf("failed to init service: %v", err)
	}

	firstID := svc.catalog[0].ID
	cards := svc.buildCards([]string{"not-found", firstID, firstID}, 4)
	if len(cards) != 1 {
		t.Fatalf("expected 1 card, got %d", len(cards))
	}
	if cards[0].ID != firstID {
		t.Fatalf("expected card ID %s, got %s", firstID, cards[0].ID)
	}
}

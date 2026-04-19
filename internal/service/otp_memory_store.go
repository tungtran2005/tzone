package service

import (
	"sync"
	"time"
)

type otpEntry struct {
	Code      string
	ExpiresAt time.Time
	Attempts  int
}

type otpMemoryStore struct {
	mu    sync.Mutex
	items map[string]otpEntry
}

func newOTPMemoryStore() *otpMemoryStore {
	return &otpMemoryStore{items: map[string]otpEntry{}}
}

func (s *otpMemoryStore) key(email string, purpose string) string {
	return purpose + "|" + email
}

func (s *otpMemoryStore) set(email string, purpose string, code string, expiresAt time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.items[s.key(email, purpose)] = otpEntry{
		Code:      code,
		ExpiresAt: expiresAt,
		Attempts:  0,
	}
}

func (s *otpMemoryStore) get(email string, purpose string, now time.Time) (otpEntry, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	k := s.key(email, purpose)
	entry, ok := s.items[k]
	if !ok {
		return otpEntry{}, false
	}

	if now.After(entry.ExpiresAt) {
		delete(s.items, k)
		return otpEntry{}, false
	}

	return entry, true
}

func (s *otpMemoryStore) incrementAttempts(email string, purpose string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	k := s.key(email, purpose)
	entry, ok := s.items[k]
	if !ok {
		return
	}
	entry.Attempts++
	s.items[k] = entry
}

func (s *otpMemoryStore) delete(email string, purpose string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.items, s.key(email, purpose))
}

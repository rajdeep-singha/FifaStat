package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"cardclash/config"
)

type AnakinService struct {
	client  *http.Client
	apiKey  string
	baseURL string
}

type SearchResult struct {
	Title   string `json:"title"`
	URL     string `json:"url"`
	Snippet string `json:"snippet"`
}

type anakinRequest struct {
	AppID  string            `json:"appId"`
	Stream bool              `json:"stream"`
	Inputs map[string]string `json:"inputs"`
}

type anakinResponse struct {
	Data struct {
		Contents []struct {
			Type string `json:"type"`
			Text string `json:"text"`
		} `json:"contents"`
	} `json:"data"`
}

func NewAnakinService(cfg *config.Config) *AnakinService {
	return &AnakinService{
		client:  &http.Client{Timeout: 30 * time.Second},
		apiKey:  cfg.AnakinAPIKey,
		baseURL: cfg.AnakinBaseURL,
	}
}

func (s *AnakinService) GenerateJSON(ctx context.Context, appID string, inputs map[string]string) (map[string]interface{}, error) {
	body, _ := json.Marshal(anakinRequest{AppID: appID, Stream: false, Inputs: inputs})
	req, err := http.NewRequestWithContext(ctx, "POST", s.baseURL+"/chatMessages", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("anakin error %d: %s", resp.StatusCode, string(raw))
	}

	var ar anakinResponse
	if err := json.Unmarshal(raw, &ar); err != nil {
		return nil, err
	}
	if len(ar.Data.Contents) == 0 {
		return nil, fmt.Errorf("no content in anakin response")
	}

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(ar.Data.Contents[0].Text), &result); err != nil {
		return nil, fmt.Errorf("anakin text is not JSON: %w", err)
	}
	return result, nil
}

func (s *AnakinService) SearchWeb(ctx context.Context, appID string, query string) ([]SearchResult, error) {
	body, _ := json.Marshal(anakinRequest{
		AppID:  appID,
		Stream: false,
		Inputs: map[string]string{"query": query},
	})
	req, err := http.NewRequestWithContext(ctx, "POST", s.baseURL+"/chatMessages", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("anakin search error %d: %s", resp.StatusCode, string(raw))
	}

	var ar anakinResponse
	if err := json.Unmarshal(raw, &ar); err != nil {
		return nil, err
	}
	if len(ar.Data.Contents) == 0 {
		return nil, fmt.Errorf("no search results")
	}

	var results []SearchResult
	if err := json.Unmarshal([]byte(ar.Data.Contents[0].Text), &results); err != nil {
		// fallback: treat the whole text as a single snippet
		return []SearchResult{{Snippet: ar.Data.Contents[0].Text}}, nil
	}
	return results, nil
}

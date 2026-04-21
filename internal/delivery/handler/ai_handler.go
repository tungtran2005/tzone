package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/LuuDinhTheTai/tzone/internal/dto"
	"github.com/LuuDinhTheTai/tzone/internal/service"
	"github.com/LuuDinhTheTai/tzone/util/response"
	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	aiService *service.AIChatService
}

func NewAIHandler(aiService *service.AIChatService) *AIHandler {
	return &AIHandler{aiService: aiService}
}

func (h *AIHandler) RecommendDevices(ctx *gin.Context) {
	var req dto.AIChatRecommendRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "invalid chat request", []response.ErrorResponse{{Field: "request", Error: err.Error()}})
		return
	}

	req.Normalize()

	result, err := h.aiService.Recommend(ctx.Request.Context(), req)
	if err != nil {
		log.Printf("❌ AI recommendation failed: %v", err)
		statusCode := http.StatusInternalServerError
		message := "Unable to generate recommendation"

		var geminiErr *service.GeminiAPIError
		if errors.As(err, &geminiErr) {
			statusCode = geminiErr.StatusCode
			message = geminiErr.FriendlyMessage()
		}

		response.Error(ctx, statusCode, message, []response.ErrorResponse{{Field: "ai", Error: err.Error()}})
		return
	}

	response.Success(ctx, http.StatusOK, "AI recommendations generated", result)
}

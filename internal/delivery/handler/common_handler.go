package handler

import (
	"github.com/gin-gonic/gin"
)

type CommonHandler struct {
}

func NewCommonHandler() *CommonHandler {
	return &CommonHandler{}
}

func (h *CommonHandler) IndexHandler(ctx *gin.Context) {
	ctx.File("web/frontend/pages/home.html")
}

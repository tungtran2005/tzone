package middleware

import (
	"net/http"
	"strings"

	"github.com/LuuDinhTheTai/tzone/util/jwt"
	"github.com/LuuDinhTheTai/tzone/util/response"

	"github.com/gin-gonic/gin"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		tokenString := ""

		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		if tokenString == "" {
			response.Error(c, http.StatusUnauthorized, "authorization token is required in header", nil)
			c.Abort()
			return
		}

		// Validate token
		userID, err := jwt.ValidateToken(tokenString)
		if err != nil {
			if err == jwt.ErrExpiredToken {
				response.Error(c, http.StatusUnauthorized, "token has expired", nil)
				c.Abort()
				return
			}

			response.Error(c, http.StatusUnauthorized, "invalid token", nil)
			c.Abort()
			return
		}

		// Attach user_id to context if token is valid
		c.Set("user_id", userID.String())

		// Continue processing normally
		c.Next()
	}
}

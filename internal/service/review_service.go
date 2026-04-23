package service

import (
	"fmt"
	"strings"

	"github.com/LuuDinhTheTai/tzone/internal/dto"
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/LuuDinhTheTai/tzone/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewService struct {
	reviewRepo *repository.ReviewRepository
}

func NewReviewService(reviewRepo *repository.ReviewRepository) *ReviewService {
	return &ReviewService{reviewRepo: reviewRepo}
}

func (s *ReviewService) GetByDeviceID(deviceID string, page int, limit int) (*dto.ReviewListResponse, error) {
	deviceID = strings.TrimSpace(deviceID)
	if deviceID == "" {
		return nil, fmt.Errorf("device id is required")
	}

	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 5
	}
	if limit > dto.MaxLimit {
		limit = dto.MaxLimit
	}

	reviews, total, err := s.reviewRepo.GetCommentsByDeviceID(deviceID, page, limit)
	if err != nil {
		return nil, err
	}

	avg, ratingCount, err := s.reviewRepo.GetRatingSummary(deviceID)
	if err != nil {
		return nil, err
	}

	userIDs := make([]uuid.UUID, 0, len(reviews))
	seen := map[uuid.UUID]struct{}{}
	for _, review := range reviews {
		if _, ok := seen[review.UserID]; ok {
			continue
		}
		seen[review.UserID] = struct{}{}
		userIDs = append(userIDs, review.UserID)
	}

	userEmailMap, err := s.reviewRepo.FindUserEmails(userIDs)
	if err != nil {
		return nil, err
	}

	items := make([]dto.ReviewResponse, 0, len(reviews))
	for _, review := range reviews {
		items = append(items, dto.ReviewResponse{
			ID:        review.ID.String(),
			UserID:    review.UserID.String(),
			UserEmail: userEmailMap[review.UserID],
			DeviceID:  review.DeviceID,
			Rating:    review.Rating,
			Comment:   review.Comment,
			CreatedAt: review.CreatedAt,
			UpdatedAt: review.UpdatedAt,
		})
	}

	return &dto.ReviewListResponse{
		Reviews:    items,
		Total:      int(total),
		Pagination: buildPaginationMeta(total, page, limit),
		RatingSummary: dto.RatingSummary{
			Average: avg,
			Count:   ratingCount,
		},
	}, nil
}

func (s *ReviewService) SetRating(userID string, deviceID string, req dto.SetRatingRequest) (*dto.ReviewResponse, error) {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}
	deviceID = strings.TrimSpace(deviceID)
	if deviceID == "" {
		return nil, fmt.Errorf("device id is required")
	}

	review, err := s.reviewRepo.FindRatingByUserAndDevice(parsedUserID, deviceID)
	if err != nil {
		if err != gorm.ErrRecordNotFound {
			return nil, err
		}
		review = &model.Review{ID: uuid.New(), UserID: parsedUserID, DeviceID: deviceID, Comment: ""}
	}

	review.Rating = req.Rating
	if err := s.reviewRepo.Save(review); err != nil {
		return nil, err
	}

	userEmails, err := s.reviewRepo.FindUserEmails([]uuid.UUID{review.UserID})
	if err != nil {
		return nil, err
	}

	return toReviewResponse(review, userEmails[review.UserID]), nil
}

func (s *ReviewService) SetComment(userID string, deviceID string, req dto.SetCommentRequest) (*dto.ReviewResponse, error) {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}
	deviceID = strings.TrimSpace(deviceID)
	if deviceID == "" {
		return nil, fmt.Errorf("device id is required")
	}
	req.Normalize()
	if req.Comment == "" {
		return nil, fmt.Errorf("comment is required")
	}

	// Comments are append-only by default: one account can post multiple comments per device.
	review := &model.Review{ID: uuid.New(), UserID: parsedUserID, DeviceID: deviceID, Rating: 0, Comment: req.Comment}
	if err := s.reviewRepo.Save(review); err != nil {
		return nil, err
	}

	userEmails, err := s.reviewRepo.FindUserEmails([]uuid.UUID{review.UserID})
	if err != nil {
		return nil, err
	}

	return toReviewResponse(review, userEmails[review.UserID]), nil
}

func (s *ReviewService) UpdateComment(userID string, reviewID string, req dto.UpdateCommentRequest) (*dto.ReviewResponse, error) {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}
	parsedReviewID, err := uuid.Parse(strings.TrimSpace(reviewID))
	if err != nil {
		return nil, fmt.Errorf("invalid review id")
	}

	req.Normalize()
	if req.Comment == "" {
		return nil, fmt.Errorf("comment is required")
	}

	review, err := s.reviewRepo.FindByID(parsedReviewID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("review not found")
		}
		return nil, err
	}

	isAdmin, err := s.reviewRepo.IsAdmin(parsedUserID)
	if err != nil {
		return nil, err
	}
	if review.UserID != parsedUserID && !isAdmin {
		return nil, fmt.Errorf("you can only edit your own comment")
	}

	review.Comment = req.Comment
	if err := s.reviewRepo.Save(review); err != nil {
		return nil, err
	}

	userEmails, err := s.reviewRepo.FindUserEmails([]uuid.UUID{review.UserID})
	if err != nil {
		return nil, err
	}

	return toReviewResponse(review, userEmails[review.UserID]), nil
}

func (s *ReviewService) Create(userID string, deviceID string, req dto.CreateReviewRequest) (*dto.ReviewResponse, error) {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}

	deviceID = strings.TrimSpace(deviceID)
	if deviceID == "" {
		return nil, fmt.Errorf("device id is required")
	}

	req.Normalize()
	if req.Comment == "" {
		return nil, fmt.Errorf("comment is required")
	}

	exists, err := s.reviewRepo.ExistsByUserAndDevice(parsedUserID, deviceID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("you already reviewed this device; please edit your existing review")
	}

	review := &model.Review{
		ID:       uuid.New(),
		UserID:   parsedUserID,
		DeviceID: deviceID,
		Rating:   req.Rating,
		Comment:  req.Comment,
	}

	if err := s.reviewRepo.Create(review); err != nil {
		return nil, err
	}

	userEmails, err := s.reviewRepo.FindUserEmails([]uuid.UUID{parsedUserID})
	if err != nil {
		return nil, err
	}

	return &dto.ReviewResponse{
		ID:        review.ID.String(),
		UserID:    review.UserID.String(),
		UserEmail: userEmails[parsedUserID],
		DeviceID:  review.DeviceID,
		Rating:    review.Rating,
		Comment:   review.Comment,
		CreatedAt: review.CreatedAt,
		UpdatedAt: review.UpdatedAt,
	}, nil
}

func (s *ReviewService) Update(userID string, reviewID string, req dto.UpdateReviewRequest) (*dto.ReviewResponse, error) {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return nil, fmt.Errorf("invalid user id")
	}

	parsedReviewID, err := uuid.Parse(strings.TrimSpace(reviewID))
	if err != nil {
		return nil, fmt.Errorf("invalid review id")
	}

	req.Normalize()
	if req.Comment == "" {
		return nil, fmt.Errorf("comment is required")
	}

	review, err := s.reviewRepo.FindByID(parsedReviewID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("review not found")
		}
		return nil, err
	}

	isAdmin, err := s.reviewRepo.IsAdmin(parsedUserID)
	if err != nil {
		return nil, err
	}
	if review.UserID != parsedUserID && !isAdmin {
		return nil, fmt.Errorf("you can only edit your own review")
	}

	review.Rating = req.Rating
	review.Comment = req.Comment
	if err := s.reviewRepo.Update(review); err != nil {
		return nil, err
	}

	userEmails, err := s.reviewRepo.FindUserEmails([]uuid.UUID{review.UserID})
	if err != nil {
		return nil, err
	}

	return &dto.ReviewResponse{
		ID:        review.ID.String(),
		UserID:    review.UserID.String(),
		UserEmail: userEmails[review.UserID],
		DeviceID:  review.DeviceID,
		Rating:    review.Rating,
		Comment:   review.Comment,
		CreatedAt: review.CreatedAt,
		UpdatedAt: review.UpdatedAt,
	}, nil
}

func (s *ReviewService) Delete(userID string, reviewID string) error {
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return fmt.Errorf("invalid user id")
	}
	parsedReviewID, err := uuid.Parse(strings.TrimSpace(reviewID))
	if err != nil {
		return fmt.Errorf("invalid review id")
	}

	isAdmin, err := s.reviewRepo.IsAdmin(parsedUserID)
	if err != nil {
		return err
	}
	if !isAdmin {
		return fmt.Errorf("only admin can delete reviews")
	}

	if err := s.reviewRepo.Delete(parsedReviewID); err != nil {
		return err
	}
	return nil
}

func toReviewResponse(review *model.Review, userEmail string) *dto.ReviewResponse {
	return &dto.ReviewResponse{
		ID:        review.ID.String(),
		UserID:    review.UserID.String(),
		UserEmail: userEmail,
		DeviceID:  review.DeviceID,
		Rating:    review.Rating,
		Comment:   review.Comment,
		CreatedAt: review.CreatedAt,
		UpdatedAt: review.UpdatedAt,
	}
}

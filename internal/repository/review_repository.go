package repository

import (
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) Create(review *model.Review) error {
	return r.db.Create(review).Error
}

func (r *ReviewRepository) FindByID(id uuid.UUID) (*model.Review, error) {
	var review model.Review
	if err := r.db.Where("id = ?", id).First(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) Update(review *model.Review) error {
	return r.db.Save(review).Error
}

func (r *ReviewRepository) Save(review *model.Review) error {
	return r.db.Save(review).Error
}

func (r *ReviewRepository) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&model.Review{}).Error
}

func (r *ReviewRepository) GetByDeviceID(deviceID string) ([]model.Review, error) {
	var reviews []model.Review
	err := r.db.Where("device_id = ?", deviceID).Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

func (r *ReviewRepository) GetCommentsByDeviceID(deviceID string, page int, limit int) ([]model.Review, int64, error) {
	query := r.db.Model(&model.Review{}).
		Where("device_id = ?", deviceID).
		Where("comment <> ?", "")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var reviews []model.Review
	err := query.Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&reviews).Error
	if err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

func (r *ReviewRepository) GetRatingSummary(deviceID string) (float64, int64, error) {
	type summaryRow struct {
		AvgRating float64
		Count     int64
	}

	var row summaryRow
	err := r.db.Model(&model.Review{}).
		Select("COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS count").
		Where("device_id = ?", deviceID).
		Where("rating > 0").
		Scan(&row).Error
	if err != nil {
		return 0, 0, err
	}

	return row.AvgRating, row.Count, nil
}

func (r *ReviewRepository) FindUserEmails(userIDs []uuid.UUID) (map[uuid.UUID]string, error) {
	if len(userIDs) == 0 {
		return map[uuid.UUID]string{}, nil
	}

	type userRow struct {
		ID    uuid.UUID
		Email string
	}

	rows := make([]userRow, 0, len(userIDs))
	if err := r.db.Table("users").Select("id, email").Where("id IN ?", userIDs).Find(&rows).Error; err != nil {
		return nil, err
	}

	result := make(map[uuid.UUID]string, len(rows))
	for _, row := range rows {
		result[row.ID] = row.Email
	}
	return result, nil
}

func (r *ReviewRepository) ExistsByUserAndDevice(userID uuid.UUID, deviceID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.Review{}).Where("user_id = ? AND device_id = ?", userID, deviceID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *ReviewRepository) FindByUserAndDevice(userID uuid.UUID, deviceID string) (*model.Review, error) {
	var review model.Review
	err := r.db.Where("user_id = ? AND device_id = ?", userID, deviceID).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) FindRatingByUserAndDevice(userID uuid.UUID, deviceID string) (*model.Review, error) {
	var review model.Review
	err := r.db.Where("user_id = ? AND device_id = ? AND rating > 0", userID, deviceID).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *ReviewRepository) IsAdmin(userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Table("users").Where("id = ? AND email = ?", userID, "admin@tzone.com").Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

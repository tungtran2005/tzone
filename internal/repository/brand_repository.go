package repository

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/LuuDinhTheTai/tzone/internal/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type BrandRepository struct {
	client          *mongo.Client
	database        string
	brandCollection string
}

func NewBrandRepository() *BrandRepository {
	return &BrandRepository{
		database:        "Cluster0",
		brandCollection: "brands",
	}
}

// SetClient sets the MongoDB client for the repository
func (r *BrandRepository) SetClient(client *mongo.Client) {
	r.client = client
}

// GetBrandCollection returns the brand collection
func (r *BrandRepository) GetBrandCollection() *mongo.Collection {
	return r.client.Database(r.database).Collection(r.brandCollection)
}

// CreateBrand creates a new brand in MongoDB
func (r *BrandRepository) CreateBrand(ctx context.Context, brand *model.Brand) (*model.Brand, error) {
	collection := r.GetBrandCollection()

	brand.CreatedAt = time.Now()
	brand.UpdatedAt = time.Now()

	result, err := collection.InsertOne(ctx, brand)
	if err != nil {
		log.Printf("❌ Error creating brand: %v", err)
		return nil, fmt.Errorf("failed to create brand: %w", err)
	}

	brand.Id = result.InsertedID.(bson.ObjectID)
	log.Printf("✅ Brand created successfully with ID: %s", brand.Id.Hex())
	return brand, nil
}

// GetBrandById retrieves a brand by its ID
func (r *BrandRepository) GetBrandById(ctx context.Context, id string) (*model.Brand, error) {
	collection := r.GetBrandCollection()

	objectId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid brand ID format: %w", err)
	}

	var brand model.Brand
	err = collection.FindOne(ctx, bson.M{"_id": objectId}).Decode(&brand)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("brand not found")
		}
		log.Printf("❌ Error finding brand: %v", err)
		return nil, fmt.Errorf("failed to find brand: %w", err)
	}

	log.Printf("✅ Brand found: %s", brand.Name)
	return &brand, nil
}

// GetAllBrands retrieves all brands from MongoDB
func (r *BrandRepository) GetAllBrands(ctx context.Context) ([]model.Brand, error) {
	collection := r.GetBrandCollection()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("❌ Error fetching brands: %v", err)
		return nil, fmt.Errorf("failed to fetch brands: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("⚠️ Error closing cursor: %v", err)
		}
	}()

	var brands []model.Brand
	if err = cursor.All(ctx, &brands); err != nil {
		log.Printf("❌ Error decoding brands: %v", err)
		return nil, fmt.Errorf("failed to decode brands: %w", err)
	}

	log.Printf("✅ Retrieved %d brands", len(brands))
	return brands, nil
}

// UpdateBrand updates an existing brand in MongoDB
func (r *BrandRepository) UpdateBrand(ctx context.Context, id string, brand *model.Brand) (*model.Brand, error) {
	collection := r.GetBrandCollection()

	objectId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid brand ID format: %w", err)
	}

	brand.UpdatedAt = time.Now()

	update := bson.M{
		"$set": bson.M{
			"brand_name": brand.Name,
			"updated_at": brand.UpdatedAt,
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objectId}, update)
	if err != nil {
		log.Printf("❌ Error updating brand: %v", err)
		return nil, fmt.Errorf("failed to update brand: %w", err)
	}

	if result.MatchedCount == 0 {
		return nil, fmt.Errorf("brand not found")
	}

	log.Printf("✅ Brand updated successfully: %s", id)
	return r.GetBrandById(ctx, id)
}

// DeleteBrand deletes a brand from MongoDB
func (r *BrandRepository) DeleteBrand(ctx context.Context, id string) error {
	collection := r.GetBrandCollection()

	objectId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid brand ID format: %w", err)
	}

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectId})
	if err != nil {
		log.Printf("❌ Error deleting brand: %v", err)
		return fmt.Errorf("failed to delete brand: %w", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("brand not found")
	}

	log.Printf("✅ Brand deleted successfully: %s", id)
	return nil
}

// AddDeviceToBrand pushes a new device into the brand's devices array
func (r *BrandRepository) AddDeviceToBrand(ctx context.Context, brandID bson.ObjectID, device *model.Device) error {
	collection := r.GetBrandCollection()

	update := bson.M{
		"$push": bson.M{"devices": device},
		"$set":  bson.M{"updated_at": time.Now()},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": brandID}, update)
	if err != nil {
		log.Printf("❌ Error adding device to brand: %v", err)
		return fmt.Errorf("failed to add device to brand: %w", err)
	}

	return nil
}

// UpdateDeviceInBrand updates an existing device within the brand's device array
func (r *BrandRepository) UpdateDeviceInBrand(ctx context.Context, brandID bson.ObjectID, device *model.Device) error {
	collection := r.GetBrandCollection()

	filter := bson.M{"_id": brandID, "devices._id": device.ID}
	update := bson.M{
		"$set": bson.M{
			"devices.$":  device,
			"updated_at": time.Now(),
		},
	}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Printf("❌ Error updating device in brand: %v", err)
		return fmt.Errorf("failed to update device in brand: %w", err)
	}

	return nil
}

// RemoveDeviceFromBrand removes a device from the brand's devices array
func (r *BrandRepository) RemoveDeviceFromBrand(ctx context.Context, brandID bson.ObjectID, deviceID bson.ObjectID) error {
	collection := r.GetBrandCollection()

	update := bson.M{
		"$pull": bson.M{"devices": bson.M{"_id": deviceID}},
		"$set":  bson.M{"updated_at": time.Now()},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": brandID}, update)
	if err != nil {
		log.Printf("❌ Error removing device from brand: %v", err)
		return fmt.Errorf("failed to remove device from brand: %w", err)
	}

	return nil
}

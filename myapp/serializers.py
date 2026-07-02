from rest_framework import serializers

from myapp.models import (
    User,
    Category,
    Metal,
    Purity,
    Gender,
    Occasion,
    StoneType,
    Brand,
    Collection,
    Certification,
    Tag,
    Product,
    ProductVariant,
    Inventory,
    ProductMetal,
    ProductOccasion,
    ProductStone,
    ProductImage,
    ProductTag,
    CartItem,
    WishlistItem,
    Offer,
    Order,
    OrderItem,
    Appointment,
    CustomJewelryRequest,
    Review,
    Blog,
    GiftCard,
    StorefrontBanner
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MetalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metal
        fields = '__all__'


class PuritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Purity
        fields = '__all__'


class GenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gender
        fields = '__all__'


class StorefrontBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorefrontBanner
        fields = '__all__'


class OccasionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occasion
        fields = '__all__'


class StoneTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoneType
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = '__all__'


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Category name
        rep['category'] = instance.category.name if instance.category else ""
        # Gender name
        rep['gender_name'] = instance.gender.name if instance.gender else ""
        
        # Product images
        rep['images'] = [img.image_url for img in instance.product_images.all()]
        
        # Product tags
        rep['tags'] = [pt.tag.name for pt in instance.product_tags.all().select_related('tag')]
        # Featured status
        rep['featured'] = instance.featured

        # Pull details from the first variant
        first_variant = instance.variants.first()
        if first_variant:
            rep['price'] = float(first_variant.selling_price)
            rep['weight'] = first_variant.weight
            rep['material'] = first_variant.metal.name if first_variant.metal else ""
            try:
                rep['stock'] = first_variant.inventory.quantity
            except Exception:
                rep['stock'] = 0
        else:
            rep['price'] = 0.0
            rep['weight'] = 0.0
            rep['material'] = ""
            rep['stock'] = 0
            
        return rep


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'


class ProductMetalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMetal
        fields = '__all__'


class ProductOccasionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOccasion
        fields = '__all__'


class ProductStoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStone
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'


class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = '__all__'


class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = '__all__'


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'


class CustomJewelryRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomJewelryRequest
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'


class GiftCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCard
        fields = '__all__'

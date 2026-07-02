from django.urls import path, include
from rest_framework.routers import DefaultRouter
from myapp.views import (
    UserViewSet,
    CategoryViewSet,
    MetalViewSet,
    PurityViewSet,
    GenderViewSet,
    OccasionViewSet,
    StoneTypeViewSet,
    BrandViewSet,
    CollectionViewSet,
    CertificationViewSet,
    TagViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    InventoryViewSet,
    ProductMetalViewSet,
    ProductOccasionViewSet,
    ProductStoneViewSet,
    ProductImageViewSet,
    ProductTagViewSet,
    CartItemViewSet,
    WishlistItemViewSet,
    OfferViewSet,
    OrderViewSet,
    OrderItemViewSet,
    AppointmentViewSet,
    CustomJewelryRequestViewSet,
    ReviewViewSet,
    BlogViewSet,
    GiftCardViewSet,
    RegisterView,
    LoginView,
    CartView,
    CartDetailView,
    CustomOrderView,
    ProductReviewsView,
    ImageUploadView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'metals', MetalViewSet)
router.register(r'purities', PurityViewSet)
router.register(r'genders', GenderViewSet)
router.register(r'occasions', OccasionViewSet)
router.register(r'stone_types', StoneTypeViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'collections', CollectionViewSet)
router.register(r'certifications', CertificationViewSet)
router.register(r'tags', TagViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product_variants', ProductVariantViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'product_metals', ProductMetalViewSet)
router.register(r'product_occasions', ProductOccasionViewSet)
router.register(r'product_stones', ProductStoneViewSet)
router.register(r'product_images', ProductImageViewSet)
router.register(r'product_tags', ProductTagViewSet)
router.register(r'cart_items', CartItemViewSet)
router.register(r'wishlist_items', WishlistItemViewSet)
router.register(r'offers', OfferViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order_items', OrderItemViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'custom_requests', CustomJewelryRequestViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'blogs', BlogViewSet)
router.register(r'gift_cards', GiftCardViewSet)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/<uuid:pk>/', CartDetailView.as_view(), name='cart_detail'),
    path('orders/', CustomOrderView.as_view(), name='custom_orders'),
    path('reviews/product/<uuid:product_id>/', ProductReviewsView.as_view(), name='product_reviews'),
    path('upload/', ImageUploadView.as_view(), name='image_upload'),
    path('', include(router.urls)),
]
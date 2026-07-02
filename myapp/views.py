from rest_framework import viewsets

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
    GiftCard
)

from myapp.serializers import (
    UserSerializer,
    CategorySerializer,
    MetalSerializer,
    PuritySerializer,
    GenderSerializer,
    OccasionSerializer,
    StoneTypeSerializer,
    BrandSerializer,
    CollectionSerializer,
    CertificationSerializer,
    TagSerializer,
    ProductSerializer,
    ProductVariantSerializer,
    InventorySerializer,
    ProductMetalSerializer,
    ProductOccasionSerializer,
    ProductStoneSerializer,
    ProductImageSerializer,
    ProductTagSerializer,
    CartItemSerializer,
    WishlistItemSerializer,
    OfferSerializer,
    OrderSerializer,
    OrderItemSerializer,
    AppointmentSerializer,
    CustomJewelryRequestSerializer,
    ReviewSerializer,
    BlogSerializer,
    GiftCardSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().prefetch_related('cart_items', 'wishlist_items', 'orders', 'appointments', 'custom_requests', 'reviews', 'gift_cards')
    serializer_class = UserSerializer
    search_fields = ['name', 'password', 'role']
    filterset_fields = ['role']
    ordering_fields = ['email', 'created_at', 'updated_at']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().select_related('parent').prefetch_related('children', 'products')
    serializer_class = CategorySerializer
    search_fields = ['name', 'slug', 'description', 'image']
    filterset_fields = ['parent', 'active']
    ordering_fields = ['name', 'slug', 'parent', 'sort_order', 'created_at']


class MetalViewSet(viewsets.ModelViewSet):
    queryset = Metal.objects.all().prefetch_related('variants', 'product_metals')
    serializer_class = MetalSerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class PurityViewSet(viewsets.ModelViewSet):
    queryset = Purity.objects.all().prefetch_related('variants', 'product_metals')
    serializer_class = PuritySerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class GenderViewSet(viewsets.ModelViewSet):
    queryset = Gender.objects.all().prefetch_related('products')
    serializer_class = GenderSerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class OccasionViewSet(viewsets.ModelViewSet):
    queryset = Occasion.objects.all().prefetch_related('product_occasions')
    serializer_class = OccasionSerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class StoneTypeViewSet(viewsets.ModelViewSet):
    queryset = StoneType.objects.all().prefetch_related('product_stones')
    serializer_class = StoneTypeSerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().prefetch_related('products')
    serializer_class = BrandSerializer
    search_fields = ['name']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all().prefetch_related('products')
    serializer_class = CollectionSerializer
    search_fields = ['name', 'description']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all().prefetch_related('products')
    serializer_class = CertificationSerializer
    search_fields = ['name', 'issuing_authority']
    filterset_fields = ['active']
    ordering_fields = ['name', 'created_at']


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().prefetch_related('product_tags')
    serializer_class = TagSerializer
    search_fields = ['name']
    filterset_fields = []
    ordering_fields = ['name', 'created_at']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category', 'gender', 'brand', 'collection', 'certification').prefetch_related('variants', 'product_metals', 'product_occasions', 'product_stones', 'product_images', 'product_tags', 'reviews')
    serializer_class = ProductSerializer
    search_fields = ['name', 'slug', 'description', 'short_description']
    filterset_fields = ['category', 'gender', 'brand', 'collection', 'certification', 'featured', 'active']
    ordering_fields = ['name', 'slug', 'category', 'gender', 'brand', 'collection', 'certification', 'created_at', 'updated_at']


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all().select_related('product', 'metal', 'purity').prefetch_related('cart_items', 'wishlist_items', 'order_items')
    serializer_class = ProductVariantSerializer
    search_fields = ['sku', 'barcode', 'status']
    filterset_fields = ['product', 'metal', 'purity', 'status']
    ordering_fields = ['product', 'sku', 'metal', 'purity', 'weight', 'barcode', 'status', 'selling_price', 'created_at', 'updated_at']


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().select_related('variant')
    serializer_class = InventorySerializer
    search_fields = []
    filterset_fields = ['variant']
    ordering_fields = ['variant', 'updated_at']


class ProductMetalViewSet(viewsets.ModelViewSet):
    queryset = ProductMetal.objects.all().select_related('product', 'metal', 'purity')
    serializer_class = ProductMetalSerializer
    search_fields = []
    filterset_fields = ['product', 'metal', 'purity']
    ordering_fields = ['product', 'metal', 'purity', 'weight_grams', 'created_at']


class ProductOccasionViewSet(viewsets.ModelViewSet):
    queryset = ProductOccasion.objects.all().select_related('product', 'occasion')
    serializer_class = ProductOccasionSerializer
    search_fields = []
    filterset_fields = ['product', 'occasion']
    ordering_fields = ['product', 'occasion', 'created_at']


class ProductStoneViewSet(viewsets.ModelViewSet):
    queryset = ProductStone.objects.all().select_related('product', 'stone_type')
    serializer_class = ProductStoneSerializer
    search_fields = ['cut', 'clarity', 'color', 'certificate']
    filterset_fields = ['product', 'stone_type']
    ordering_fields = ['product', 'stone_type', 'weight', 'created_at']


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all().select_related('product')
    serializer_class = ProductImageSerializer
    search_fields = ['image_url', 'alt_text']
    filterset_fields = ['product', 'is_thumbnail']
    ordering_fields = ['product', 'sort_order', 'created_at']


class ProductTagViewSet(viewsets.ModelViewSet):
    queryset = ProductTag.objects.all().select_related('product', 'tag')
    serializer_class = ProductTagSerializer
    search_fields = []
    filterset_fields = ['product', 'tag']
    ordering_fields = ['product', 'tag', 'created_at']


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all().select_related('user', 'variant')
    serializer_class = CartItemSerializer
    search_fields = ['size', 'engraving']
    filterset_fields = ['user', 'variant']
    ordering_fields = ['user', 'variant', 'created_at']


class WishlistItemViewSet(viewsets.ModelViewSet):
    queryset = WishlistItem.objects.all().select_related('user', 'variant')
    serializer_class = WishlistItemSerializer
    search_fields = []
    filterset_fields = ['user', 'variant']
    ordering_fields = ['user', 'variant', 'created_at']


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all().prefetch_related('orders')
    serializer_class = OfferSerializer
    search_fields = ['code', 'discount_type', 'description']
    filterset_fields = ['active']
    ordering_fields = ['code']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('user', 'coupon').prefetch_related('items')
    serializer_class = OrderSerializer
    search_fields = ['invoice_number', 'payment_method', 'payment_status', 'delivery_status', 'tracking_number', 'tracking_carrier']
    filterset_fields = ['user', 'coupon', 'payment_status', 'delivery_status']
    ordering_fields = ['user', 'coupon', 'invoice_number', 'created_at', 'updated_at']


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all().select_related('order', 'variant')
    serializer_class = OrderItemSerializer
    search_fields = ['size', 'engraving']
    filterset_fields = ['order', 'variant']
    ordering_fields = ['order', 'variant', 'price']


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().select_related('user')
    serializer_class = AppointmentSerializer
    search_fields = ['full_name', 'email', 'phone', 'date', 'time_slot', 'status', 'store_location', 'notes']
    filterset_fields = ['user', 'status']
    ordering_fields = ['user', 'created_at']


class CustomJewelryRequestViewSet(viewsets.ModelViewSet):
    queryset = CustomJewelryRequest.objects.all().select_related('user')
    serializer_class = CustomJewelryRequestSerializer
    search_fields = ['description', 'material', 'gemstone', 'status', 'notes']
    filterset_fields = ['user', 'status']
    ordering_fields = ['user', 'created_at']


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('user', 'product')
    serializer_class = ReviewSerializer
    search_fields = ['title', 'comment', 'admin_reply']
    filterset_fields = ['user', 'product', 'verified_purchase']
    ordering_fields = ['user', 'product', 'created_at']


class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    search_fields = ['title', 'slug', 'content', 'summary', 'cover_image', 'author']
    filterset_fields = ['active']
    ordering_fields = ['slug', 'created_at']


class GiftCardViewSet(viewsets.ModelViewSet):
    queryset = GiftCard.objects.all().select_related('user')
    serializer_class = GiftCardSerializer
    search_fields = ['code']
    filterset_fields = ['active', 'user']
    ordering_fields = ['code', 'user', 'created_at']


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import uuid
import random
import base64
import json

def resolve_user_from_request(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
        
    token = auth_header.split(' ')[1]
    # Clean any surrounding straight or curly quotes
    token = token.strip('“"”\' ')
    if not token:
        return None
        
    # Case 1: Token is UUID (Direct user ID lookup)
    try:
        uuid_obj = uuid.UUID(token)
        return User.objects.filter(id=uuid_obj).first()
    except ValueError:
        pass
        
    # Case 2: Token is JWT (Decode and lookup by email)
    try:
        parts = token.split('.')
        if len(parts) == 3:
            payload_b64 = parts[1]
            # Add padding
            payload_b64 += '=' * (4 - len(payload_b64) % 4)
            payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            email = payload.get('sub') or payload.get('email')
            if email:
                return User.objects.filter(email=email).first()
    except Exception:
        pass
        
    return None

class RegisterView(APIView):
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not name or not email or not password:
            return Response({'detail': 'Please provide name, email and password.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({'detail': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(name=name, email=email, password=password)
        return Response({'detail': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'detail': 'Please provide email and password.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(password):
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            'access_token': str(user.id),
            'name': user.name,
            'email': user.email,
            'role': user.role
        })


class CartView(APIView):
    def get_user(self, request):
        return resolve_user_from_request(request)

    def get(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        items = CartItem.objects.filter(user=user).select_related('variant__product')
        data = []
        for item in items:
            prod = item.variant.product
            images = [img.image_url for img in prod.product_images.all()] if prod else []
            data.append({
                'id': str(item.id),
                'quantity': item.quantity,
                'product': {
                    'id': str(prod.id) if prod else "",
                    'name': prod.name if prod else "",
                    'description': prod.description if prod else "",
                    'category': prod.category.name if (prod and prod.category) else "",
                    'weight': item.variant.weight,
                    'price': float(item.variant.selling_price),
                    'images': images
                }
            })
        return Response(data)

    def post(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            prod = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        variant = prod.variants.first()
        if not variant:
            return Response({'detail': 'No active variant found for this product.'}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            variant=variant,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            
        return Response({'detail': 'Added to cart successfully.', 'id': str(cart_item.id)}, status=status.HTTP_201_CREATED)


class CartDetailView(APIView):
    def get_user(self, request):
        return resolve_user_from_request(request)

    def put(self, request, pk=None):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            item = CartItem.objects.get(id=pk, user=user)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        quantity = request.data.get('quantity')
        if quantity is not None:
            item.quantity = int(quantity)
            item.save()
            
        return Response({'detail': 'Cart item updated.'})

    def delete(self, request, pk=None):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            item = CartItem.objects.get(id=pk, user=user)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        item.delete()
        return Response({'detail': 'Cart item deleted.'}, status=status.HTTP_204_NO_CONTENT)


class CustomOrderView(APIView):
    def get_user(self, request):
        return resolve_user_from_request(request)

    def post(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        shipping_address = request.data.get('shipping_address')
        payment_method = request.data.get('payment_method', 'Razorpay')
        
        cart_items = CartItem.objects.filter(user=user).select_related('variant')
        if not cart_items.exists():
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
            
        total_amount = 0
        for item in cart_items:
            total_amount += item.variant.selling_price * item.quantity
            
        invoice_number = f"INV-{random.randint(100000, 999999)}"
        order = Order.objects.create(
            user=user,
            payment_method=payment_method,
            payment_status="Success",
            total_amount=total_amount,
            shipping_address=shipping_address,
            invoice_number=invoice_number,
            delivery_status="Pending"
        )
        
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                quantity=item.quantity,
                price=item.variant.selling_price,
                size=item.size,
                engraving=item.engraving
            )
            try:
                inventory = item.variant.inventory
                inventory.quantity = max(0, inventory.quantity - item.quantity)
                inventory.available_quantity = max(0, inventory.available_quantity - item.quantity)
                inventory.save()
            except Exception:
                pass
                
        cart_items.delete()
        
        return Response({
            'id': str(order.id),
            'invoice_number': invoice_number,
            'total_amount': float(total_amount),
            'detail': 'Order placed successfully.'
        }, status=status.HTTP_201_CREATED)
        
    def get(self, request):
        user = self.get_user(request)
        if not user:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        orders = Order.objects.filter(user=user).prefetch_related('items__variant__product')
        data = []
        for order in orders:
            items_data = []
            for item in order.items.all():
                prod = item.variant.product
                items_data.append({
                    'id': str(item.id),
                    'variant_id': str(item.variant.id) if item.variant else "",
                    'quantity': item.quantity,
                    'price': float(item.price),
                    'product_name': prod.name if prod else "Unknown Product"
                })
            data.append({
                'id': str(order.id),
                'invoice_number': order.invoice_number,
                'payment_method': order.payment_method,
                'payment_status': order.payment_status,
                'total_amount': float(order.total_amount),
                'shipping_address': order.shipping_address,
                'delivery_status': order.delivery_status,
                'created_at': order.created_at.isoformat(),
                'items': items_data
            })
        return Response(data)


class ProductReviewsView(APIView):
    def get(self, request, product_id=None):
        reviews = Review.objects.filter(product_id=product_id).select_related('user')
        data = []
        for review in reviews:
            data.append({
                'id': str(review.id),
                'user_name': review.user.name if review.user else "Verified Buyer",
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'created_at': review.created_at.isoformat()
            })
        return Response(data)


from django.core.files.storage import FileSystemStorage

class ImageUploadView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
        fs = FileSystemStorage()
        filename = fs.save(file_obj.name, file_obj)
        file_url = request.build_absolute_uri(fs.url(filename))
        
        return Response({'image_url': file_url}, status=status.HTTP_201_CREATED)


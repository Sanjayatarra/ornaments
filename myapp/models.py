import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=255, db_column='hashed_password')
    role = models.CharField(max_length=50, default="customer") # "customer" or "admin"
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    @property
    def is_staff(self):
        return self.role == 'admin'

    @property
    def is_superuser(self):
        return self.role == 'admin'

    def has_perm(self, perm, obj=None):
        return self.role == 'admin'

    def has_module_perms(self, app_label):
        return self.role == 'admin'

    class Meta:
        db_table = 'users'


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    image = models.CharField(max_length=500, null=True, blank=True) # supports CDN urls or local paths
    sort_order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'categories'
        ordering = ['sort_order', 'name']


class Metal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'metals'


class Purity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    purity_percent = models.FloatField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'purities'


class Gender(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True, db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'genders'


class Occasion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'occasions'


class StoneType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'stone_types'


class Brand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'brands'


class Collection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'collections'


class Certification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    issuing_authority = models.CharField(max_length=255, null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'certifications'


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'tags'


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_column='category_id')
    gender = models.ForeignKey(Gender, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_column='gender_id')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_column='brand_id')
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_column='collection_id')
    certification = models.ForeignKey(Certification, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_column='certification_id')
    featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'products'


class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', db_column='product_id')
    sku = models.CharField(max_length=255, unique=True, db_index=True)
    metal = models.ForeignKey(Metal, on_delete=models.PROTECT, related_name='variants', db_column='metal_id')
    purity = models.ForeignKey(Purity, on_delete=models.PROTECT, related_name='variants', db_column='purity_id')
    weight = models.FloatField(db_index=True)
    barcode = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, default="Active", db_index=True)
    
    # Pricing fields in variant (normalized)
    metal_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    stone_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    making_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    gst = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, db_index=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_variants'
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'metal', 'purity', 'weight'],
                name='uq_product_variant_relation'
            )
        ]


class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name='inventory', db_column='variant_id')
    quantity = models.IntegerField(default=0)
    reserved_quantity = models.IntegerField(default=0)
    available_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Enforce data logic consistency on save
        self.available_quantity = max(0, self.quantity - self.reserved_quantity)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'inventory'


class ProductMetal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_metals', db_column='product_id')
    metal = models.ForeignKey(Metal, on_delete=models.CASCADE, related_name='product_metals', db_column='metal_id')
    purity = models.ForeignKey(Purity, on_delete=models.SET_NULL, null=True, blank=True, related_name='product_metals', db_column='purity_id')
    weight_grams = models.FloatField(default=0.0, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_metals'
        constraints = [
            models.UniqueConstraint(fields=['product', 'metal', 'purity', 'weight_grams'], name='uq_product_metal_combo')
        ]
        indexes = [
            models.Index(fields=['metal', 'purity']),
        ]


class ProductOccasion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_occasions', db_column='product_id')
    occasion = models.ForeignKey(Occasion, on_delete=models.CASCADE, related_name='product_occasions', db_column='occasion_id')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_occasions'
        constraints = [
            models.UniqueConstraint(fields=['product', 'occasion'], name='uq_product_occasion')
        ]


class ProductStone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_stones', db_column='product_id')
    stone_type = models.ForeignKey(StoneType, on_delete=models.CASCADE, related_name='product_stones', db_column='stone_id')
    weight = models.FloatField(default=0.0, db_index=True) # renamed from stone_weight
    pieces = models.IntegerField(default=0) # renamed from stone_count
    cut = models.CharField(max_length=100, null=True, blank=True)
    clarity = models.CharField(max_length=100, null=True, blank=True)
    color = models.CharField(max_length=100, null=True, blank=True) # renamed from stone_color
    certificate = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_stones'
        indexes = [
            models.Index(fields=['stone_type', 'weight']),
        ]


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_images', db_column='product_id')
    image_url = models.CharField(max_length=500)
    is_thumbnail = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)
    alt_text = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_images'
        constraints = [
            models.UniqueConstraint(fields=['product', 'image_url'], name='uq_product_image')
        ]
        indexes = [
            models.Index(fields=['product', 'sort_order']),
        ]


class ProductTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_tags', db_column='product_id')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='product_tags', db_column='tag_id')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'product_tags'
        constraints = [
            models.UniqueConstraint(fields=['product', 'tag'], name='uq_product_tag')
        ]


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items', db_column='user_id')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='cart_items', db_column='variant_id')
    quantity = models.IntegerField(default=1)
    size = models.CharField(max_length=50, null=True, blank=True)
    engraving = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'cart_items'


class WishlistItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items', db_column='user_id')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='wishlist_items', db_column='variant_id')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'wishlist_items'


class Offer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=255, unique=True, db_index=True)
    discount_type = models.CharField(max_length=50) # "percentage" or "fixed"
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    active = models.BooleanField(default=True)

    class Meta:
        db_table = 'offers'


class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', db_column='user_id')
    coupon = models.ForeignKey(Offer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', db_column='coupon_id')
    gst = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    invoice_number = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=50, default="Pending")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_address = models.JSONField() # JSON object
    delivery_status = models.CharField(max_length=50, default="Pending") # replaced status
    tracking_number = models.CharField(max_length=255, null=True, blank=True)
    tracking_carrier = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'orders'


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', db_column='order_id')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, related_name='order_items', null=True, db_column='variant_id')
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    size = models.CharField(max_length=50, null=True, blank=True)
    engraving = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'order_items'


class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True, db_column='user_id')
    full_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    date = models.CharField(max_length=50) # YYYY-MM-DD
    time_slot = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default="Pending")
    store_location = models.CharField(max_length=255)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'appointments'


class CustomJewelryRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_requests', db_column='user_id')
    description = models.TextField()
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    material = models.CharField(max_length=255)
    gemstone = models.CharField(max_length=255, null=True, blank=True)
    reference_images = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=50, default="Pending")
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'custom_requests'


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', db_column='user_id')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', db_column='product_id')
    rating = models.IntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    verified_purchase = models.BooleanField(default=False)
    review_images = models.JSONField(default=list, blank=True)
    admin_reply = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reviews'


class Blog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True, db_index=True)
    content = models.TextField()
    summary = models.TextField()
    cover_image = models.CharField(max_length=255)
    author = models.CharField(max_length=255, default="Priyanka Jewellers Editorial")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'blogs'


class GiftCard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=255, unique=True, db_index=True)
    initial_value = models.DecimalField(max_digits=12, decimal_places=2)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    expiry_date = models.DateTimeField()
    active = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='gift_cards', null=True, blank=True, db_column='user_id')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'gift_cards'

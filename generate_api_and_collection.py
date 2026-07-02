import os
import django
import json
import uuid
from django.apps import apps
from django.db import models

# 1. Boot Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def generate():
    # 2. Get all models in myapp
    myapp_config = apps.get_app_config('myapp')
    model_classes = list(myapp_config.get_models())
    
    print(f"Found {len(model_classes)} models in myapp.")

    # 3. Generate myapp/serializers.py
    serializers_content = [
        "from rest_framework import serializers",
        "from myapp.models import (\n    " + ",\n    ".join([m.__name__ for m in model_classes]) + "\n)\n"
    ]

    for m in model_classes:
        name = m.__name__
        if name == 'User':
            # Special handling for User serializer to securely handle passwords
            user_serializer = """class UserSerializer(serializers.ModelSerializer):
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
"""
            serializers_content.append(user_serializer)
        else:
            serializer_template = f"""class {name}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {name}
        fields = '__all__'
"""
            serializers_content.append(serializer_template)

    with open('myapp/serializers.py', 'w', encoding='utf-8') as f:
        f.write("\n\n".join(serializers_content))
    print("Generated myapp/serializers.py")

    # 4. Generate myapp/views.py
    views_content = [
        "from rest_framework import viewsets",
        "from myapp.models import (\n    " + ",\n    ".join([m.__name__ for m in model_classes]) + "\n)",
        "from myapp.serializers import (\n    " + ",\n    ".join([f"{m.__name__}Serializer" for m in model_classes]) + "\n)\n"
    ]

    for m in model_classes:
        name = m.__name__
        
        # Determine select_related and prefetch_related fields for N+1 query optimization
        select_relations = []
        prefetch_relations = []
        for field in m._meta.get_fields():
            if field.many_to_one and not field.auto_created:
                select_relations.append(field.name)
            elif field.one_to_one and not field.auto_created:
                select_relations.append(field.name)
            elif field.many_to_many and not field.auto_created:
                prefetch_relations.append(field.name)
            elif field.one_to_many and field.auto_created:
                if field.related_name and field.related_name != '+':
                    prefetch_relations.append(field.related_name)

        # Dynamic search, filter, and ordering fields
        search_fields = []
        filter_fields = []
        ordering_fields = []
        for field in m._meta.get_fields():
            if not field.concrete or field.auto_created:
                continue
            field_class = field.__class__.__name__
            if field_class in ['CharField', 'TextField', 'SlugField']:
                search_fields.append(field.name)
            if field.is_relation or field_class == 'BooleanField' or field.name in ['status', 'payment_status', 'delivery_status', 'role', 'active']:
                filter_fields.append(field.name)
            if field.db_index or field.name in ['created_at', 'updated_at', 'sort_order', 'price', 'selling_price', 'weight']:
                ordering_fields.append(field.name)

        queryset_str = f"{name}.objects.all()"
        if select_relations:
            s_args = ", ".join([f"'{s}'" for s in select_relations])
            queryset_str += f".select_related({s_args})"
        if prefetch_relations:
            p_args = ", ".join([f"'{p}'" for p in prefetch_relations])
            queryset_str += f".prefetch_related({p_args})"

        viewset_template = f"""class {name}ViewSet(viewsets.ModelViewSet):
    queryset = {queryset_str}
    serializer_class = {name}Serializer
    search_fields = {search_fields}
    filterset_fields = {filter_fields}
    ordering_fields = {ordering_fields}
"""
        views_content.append(viewset_template)

    with open('myapp/views.py', 'w', encoding='utf-8') as f:
        f.write("\n\n".join(views_content))
    print("Generated myapp/views.py")

    # 5. Generate myapp/urls.py
    urls_content = [
        "from django.urls import path, include",
        "from rest_framework.routers import DefaultRouter",
        "from myapp.views import (\n    " + ",\n    ".join([f"{m.__name__}ViewSet" for m in model_classes]) + "\n)\n",
        "router = DefaultRouter()",
    ]

    for m in model_classes:
        name = m.__name__
        db_table = m._meta.db_table
        urls_content.append(f"router.register(r'{db_table}', {name}ViewSet)")

    urls_content.append("\nurlpatterns = [\n    path('', include(router.urls)),\n]")

    with open('myapp/urls.py', 'w', encoding='utf-8') as f:
        f.write("\n".join(urls_content))
    print("Generated myapp/urls.py")

    # 6. Generate postman_collection.json
    collection = {
        "info": {
            "name": "Priyanka Jewellers ERP API Collection",
            "description": "Auto-generated Postman collection to test optimized Django REST Framework CRUD APIs for 29 normalized tables.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            {
                "key": "base_url",
                "value": "localhost:8000",
                "type": "string"
            }
        ]
    }

    def make_postman_request(req_name, method, path_str, body_dict=None):
        req_obj = {
            "name": req_name,
            "request": {
                "method": method,
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                    }
                ],
                "url": {
                    "raw": f"http://{{{{base_url}}}}/api/{path_str}",
                    "protocol": "http",
                    "host": ["{{base_url}}"],
                    "path": ["api"] + [p for p in path_str.split("/") if p]
                }
            },
            "response": []
        }
        if body_dict is not None:
            req_obj["request"]["body"] = {
                "mode": "raw",
                "raw": json.dumps(body_dict, indent=2)
            }
        return req_obj

    # Create a stable, reusable dummy UUID string
    dummy_uuid = "00000000-0000-0000-0000-000000000000"

    for m in model_classes:
        name = m.__name__
        db_table = m._meta.db_table
        
        # Build raw request body for POST/PUT
        body_dict = {}
        for field in m._meta.get_fields():
            if not field.concrete or field.auto_created:
                continue
            
            # Skip primary key field since UUID is auto-generated
            if field.primary_key:
                continue
                
            field_class_name = field.__class__.__name__
            if field_class_name in ['IntegerField', 'SmallIntegerField', 'PositiveIntegerField']:
                body_dict[field.name] = 1
            elif field_class_name in ['FloatField', 'DecimalField']:
                body_dict[field.name] = 10.5
            elif field_class_name == 'BooleanField':
                body_dict[field.name] = True
            elif field_class_name in ['DateTimeField', 'DateField']:
                body_dict[field.name] = "2026-07-01T12:00:00Z"
            elif field_class_name == 'JSONField':
                if field.name == 'review_images':
                    body_dict[field.name] = ["http://example.com/review1.jpg"]
                elif field.name == 'shipping_address':
                    body_dict[field.name] = {
                        "street": "123 Main St",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "zip": "400001",
                        "country": "India"
                    }
                else:
                    body_dict[field.name] = {}
            elif field.is_relation:
                body_dict[field.name] = dummy_uuid
            else:
                if field.name == 'email':
                    body_dict[field.name] = f"test_{db_table}@example.com"
                elif field.name == 'password':
                    body_dict[field.name] = "SecurePassword123"
                else:
                    body_dict[field.name] = f"sample_{field.name}"

        # Create Postman folder for the model
        folder = {
            "name": f"{name} ({db_table})",
            "item": [
                make_postman_request(f"List {name}s", "GET", f"{db_table}/"),
                make_postman_request(f"Create {name}", "POST", f"{db_table}/", body_dict),
                make_postman_request(f"Get {name} by ID", "GET", f"{db_table}/{dummy_uuid}/"),
                make_postman_request(f"Update {name}", "PUT", f"{db_table}/{dummy_uuid}/", body_dict),
                make_postman_request(f"Delete {name}", "DELETE", f"{db_table}/{dummy_uuid}/")
            ]
        }
        collection["item"].append(folder)

    with open('postman_collection.json', 'w', encoding='utf-8') as f:
        json.dump(collection, f, indent=2)
    print("Generated postman_collection.json")

if __name__ == '__main__':
    generate()

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Budget, Category, SavingsGoal, Transaction


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        defaults = [
            ("Salary", "income", "#22c55e"),
            ("Freelance", "income", "#14b8a6"),
            ("Food", "expense", "#f97316"),
            ("Transport", "expense", "#3b82f6"),
            ("Rent", "expense", "#8b5cf6"),
            ("Shopping", "expense", "#ec4899"),
            ("Entertainment", "expense", "#eab308"),
        ]

        Category.objects.bulk_create(
            [
                Category(user=user, name=name, type=kind, color=color)
                for name, kind, color in defaults
            ]
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type", "color"]
        read_only_fields = ["id"]


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "category",
            "category_name",
            "category_color",
            "type",
            "amount",
            "description",
            "date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_category(self, category):
        if category and category.user != self.context["request"].user:
            raise serializers.ValidationError("Invalid category.")
        return category


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    spent = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ["id", "category", "category_name", "month", "limit", "spent"]
        read_only_fields = ["id", "spent"]

    def get_spent(self, obj):
        from django.db.models import Sum

        total = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            type="expense",
            date__year=obj.month.year,
            date__month=obj.month.month,
        ).aggregate(total=Sum("amount"))["total"]

        return total or 0

    def validate_category(self, category):
        if category.user != self.context["request"].user:
            raise serializers.ValidationError("Invalid category.")
        return category


class SavingsGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            "id",
            "name",
            "target_amount",
            "current_amount",
            "target_date",
            "color",
            "progress_percentage",
        ]
        read_only_fields = ["id", "progress_percentage"]

    def get_progress_percentage(self, obj):
        if obj.target_amount == 0:
            return 0
        return round(float(obj.current_amount / obj.target_amount * 100), 2)
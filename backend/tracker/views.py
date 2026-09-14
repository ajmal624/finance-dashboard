import csv
import io
from datetime import date

from django.contrib.auth.models import User
from django.db.models import Sum
from django.db.models.functions import TruncMonth

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Budget, Category, SavingsGoal, Transaction
from .serializers import (
    BudgetSerializer,
    CategorySerializer,
    RegisterSerializer,
    SavingsGoalSerializer,
    TransactionSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class OwnedModelViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(OwnedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TransactionViewSet(OwnedModelViewSet):
    queryset = Transaction.objects.select_related("category").all()
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        transaction_type = self.request.query_params.get("type")
        month = self.request.query_params.get("month")

        if transaction_type:
            queryset = queryset.filter(type=transaction_type)

        if month:
            try:
                year, month_number = month.split("-")

                queryset = queryset.filter(
                    date__year=int(year),
                    date__month=int(month_number),
                )
            except (ValueError, TypeError):
                return queryset.none()

        return queryset

    @action(
        detail=False,
        methods=["post"],
        url_path="import-csv",
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_csv(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {"detail": "Please upload a CSV file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded = uploaded_file.read().decode("utf-8")
            rows = csv.DictReader(io.StringIO(decoded))
        except UnicodeDecodeError:
            return Response(
                {"detail": "CSV must use UTF-8 encoding."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_count = 0

        for row in rows:
            category_name = row.get("category", "Other").strip()
            transaction_type = (
                row.get("type", "expense").strip().lower()
            )

            if transaction_type not in ["income", "expense"]:
                continue

            try:
                category, _ = Category.objects.get_or_create(
                    user=request.user,
                    name=category_name,
                    type=transaction_type,
                    defaults={"color": "#64748b"},
                )

                Transaction.objects.create(
                    user=request.user,
                    category=category,
                    type=transaction_type,
                    amount=row["amount"],
                    description=row.get(
                        "description",
                        "Imported transaction",
                    ),
                    date=row["date"],
                )

                created_count += 1

            except (ValueError, KeyError, TypeError):
                continue

        return Response(
            {
                "message": (
                    f"{created_count} transactions imported."
                )
            }
        )


class BudgetViewSet(OwnedModelViewSet):
    queryset = Budget.objects.select_related("category").all()
    serializer_class = BudgetSerializer


class SavingsGoalViewSet(OwnedModelViewSet):
    queryset = SavingsGoal.objects.all()
    serializer_class = SavingsGoalSerializer


class DashboardViewSet(viewsets.ViewSet):
    def list(self, request):
        today = date.today()

        transactions = Transaction.objects.filter(
            user=request.user
        )

        month_transactions = transactions.filter(
            date__year=today.year,
            date__month=today.month,
        )

        income = (
            month_transactions
            .filter(type="income")
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        expenses = (
            month_transactions
            .filter(type="expense")
            .aggregate(total=Sum("amount"))["total"]
            or 0
        )

        expense_by_category = (
            month_transactions
            .filter(type="expense")
            .values(
                "category__name",
                "category__color",
            )
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        monthly_activity = (
            transactions
            .annotate(month=TruncMonth("date"))
            .values("month", "type")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        return Response(
            {
                "income": income,
                "expenses": expenses,
                "balance": income - expenses,
                "expense_by_category": list(
                    expense_by_category
                ),
                "monthly_activity": list(monthly_activity),
                "recent_transactions": TransactionSerializer(
                    transactions[:5],
                    many=True,
                    context={"request": request},
                ).data,
            }
        )
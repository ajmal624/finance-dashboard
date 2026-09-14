from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BudgetViewSet,
    CategoryViewSet,
    DashboardViewSet,
    RegisterView,
    SavingsGoalViewSet,
    TransactionViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("transactions", TransactionViewSet, basename="transaction")
router.register("budgets", BudgetViewSet, basename="budget")
router.register("goals", SavingsGoalViewSet, basename="goal")
router.register("dashboard", DashboardViewSet, basename="dashboard")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("", include(router.urls)),
]
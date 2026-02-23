from django.contrib import admin
from .models import ExamType

@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_minutes', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
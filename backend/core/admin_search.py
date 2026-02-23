from django.contrib import admin
from django.db.models import Q
from django.utils.html import format_html


class AdvancedSearchMixin:
    """Mixin pour ajouter des fonctionnalités de recherche avancée à l'admin Django"""
    
    def get_search_results(self, request, queryset, search_term):
        """Améliore la recherche avec des opérateurs spéciaux"""
        if not search_term:
            return queryset, False
        
        # Recherche par ID exact si le terme est numérique
        if search_term.isdigit():
            id_queryset = queryset.filter(id=int(search_term))
            if id_queryset.exists():
                return id_queryset, False
        
        # Recherche par plage de dates (format: YYYY-MM-DD:YYYY-MM-DD)
        if ':' in search_term and len(search_term.split(':')) == 2:
            try:
                start_date, end_date = search_term.split(':')
                date_fields = [f.name for f in self.model._meta.fields if f.get_internal_type() in ['DateField', 'DateTimeField']]
                if date_fields:
                    date_filter = Q()
                    for field in date_fields:
                        date_filter |= Q(**{f'{field}__gte': start_date, f'{field}__lte': end_date})
                    return queryset.filter(date_filter), False
            except:
                pass
        
        # Recherche par montant (format: >1000 ou <500 ou 1000-2000)
        if search_term.startswith('>') or search_term.startswith('<'):
            try:
                operator = search_term[0]
                amount = float(search_term[1:])
                amount_fields = [f.name for f in self.model._meta.fields if f.get_internal_type() == 'DecimalField']
                if amount_fields:
                    amount_filter = Q()
                    for field in amount_fields:
                        if operator == '>':
                            amount_filter |= Q(**{f'{field}__gte': amount})
                        else:
                            amount_filter |= Q(**{f'{field}__lte': amount})
                    return queryset.filter(amount_filter), False
            except:
                pass
        
        # Recherche par plage de montants (format: 1000-2000)
        if '-' in search_term and search_term.replace('-', '').replace('.', '').isdigit():
            try:
                min_amount, max_amount = search_term.split('-')
                min_amount, max_amount = float(min_amount), float(max_amount)
                amount_fields = [f.name for f in self.model._meta.fields if f.get_internal_type() == 'DecimalField']
                if amount_fields:
                    amount_filter = Q()
                    for field in amount_fields:
                        amount_filter |= Q(**{f'{field}__gte': min_amount, f'{field}__lte': max_amount})
                    return queryset.filter(amount_filter), False
            except:
                pass
        
        # Recherche normale
        return super().get_search_results(request, queryset, search_term)


class BulkActionsMixin:
    """Mixin pour ajouter des actions en lot optimisées"""
    
    def get_actions(self, request):
        actions = super().get_actions(request)
        
        # Ajouter des actions de recherche rapide
        if hasattr(self, 'bulk_activate'):
            actions['bulk_activate'] = (self.bulk_activate, 'bulk_activate', 'Activer en lot')
        if hasattr(self, 'bulk_deactivate'):
            actions['bulk_deactivate'] = (self.bulk_deactivate, 'bulk_deactivate', 'Désactiver en lot')
        if hasattr(self, 'export_to_csv'):
            actions['export_to_csv'] = (self.export_to_csv, 'export_to_csv', 'Exporter en CSV')
        
        return actions
    
    def bulk_activate(self, request, queryset):
        """Active les éléments sélectionnés"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} éléments activés.')
    
    def bulk_deactivate(self, request, queryset):
        """Désactive les éléments sélectionnés"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} éléments désactivés.')
    
    def export_to_csv(self, request, queryset):
        """Exporte les éléments sélectionnés en CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{self.model._meta.verbose_name_plural}.csv"'
        
        writer = csv.writer(response)
        
        # En-têtes
        field_names = [field.verbose_name for field in self.model._meta.fields]
        writer.writerow(field_names)
        
        # Données
        for obj in queryset:
            row = []
            for field in self.model._meta.fields:
                value = getattr(obj, field.name)
                if hasattr(value, 'strftime'):
                    value = value.strftime('%Y-%m-%d %H:%M:%S')
                row.append(str(value) if value is not None else '')
            writer.writerow(row)
        
        return response


class SearchStatsAdmin:
    """Classe pour afficher des statistiques de recherche dans l'admin"""
    
    def changelist_view(self, request, extra_context=None):
        """Ajoute des statistiques à la vue de liste"""
        extra_context = extra_context or {}
        
        # Statistiques de base
        total_count = self.get_queryset(request).count()
        active_count = self.get_queryset(request).filter(is_active=True).count() if hasattr(self.model, 'is_active') else None
        
        # Statistiques par période (30 derniers jours)
        from datetime import datetime, timedelta
        last_30_days = datetime.now() - timedelta(days=30)
        recent_count = self.get_queryset(request).filter(created_at__gte=last_30_days).count() if hasattr(self.model, 'created_at') else None
        
        extra_context.update({
            'total_count': total_count,
            'active_count': active_count,
            'recent_count': recent_count,
            'search_tips': self.get_search_tips()
        })
        
        return super().changelist_view(request, extra_context)
    
    def get_search_tips(self):
        """Retourne des conseils de recherche pour l'admin"""
        return [
            "Recherche par ID : tapez simplement le numéro",
            "Recherche par montant : >1000 ou <500 ou 1000-2000",
            "Recherche par date : 2024-01-01:2024-12-31",
            "Recherche normale : nom, téléphone, email, etc."
        ]

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Crée des index de base de données optimisés pour la recherche'

    def handle(self, *args, **options):
        """Crée des index personnalisés pour améliorer les performances de recherche"""
        
        with connection.cursor() as cursor:
            # Index composites pour recherche de patients
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_patient_fullname_search 
                    ON patients_patient (first_name, last_name);
                """)
                self.stdout.write("✓ Index nom complet patients créé")
            except Exception as e:
                self.stdout.write(f"⚠ Index nom complet: {e}")
            
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_patient_contact_search 
                    ON patients_patient (phone_number, email);
                """)
                self.stdout.write("✓ Index contact patients créé")
            except Exception as e:
                self.stdout.write(f"⚠ Index contact: {e}")
            
            # Index pour recherche de factures
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_invoice_search 
                    ON invoices_invoice (invoice_number, status, total_amount);
                """)
                self.stdout.write("✓ Index recherche factures créé")
            except Exception as e:
                self.stdout.write(f"⚠ Index factures: {e}")
            
            # Index pour recherche de paiements
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_payment_search 
                    ON payments_payment (reference_number, transaction_id, payment_method);
                """)
                self.stdout.write("✓ Index recherche paiements créé")
            except Exception as e:
                self.stdout.write(f"⚠ Index paiements: {e}")
            
            # Index pour accès patients
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_patient_access_search 
                    ON patients_patientaccess (access_key, is_active);
                """)
                self.stdout.write("✓ Index accès patients créé")
            except Exception as e:
                self.stdout.write(f"⚠ Index accès: {e}")
        
        self.stdout.write(
            self.style.SUCCESS('Index de recherche créés avec succès!')
        )

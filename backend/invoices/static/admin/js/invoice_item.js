// JavaScript pour améliorer l'interface d'ajout d'InvoiceItem dans l'admin Django
(function($) {
    $(document).ready(function() {
        // Auto-remplir le prix unitaire quand un type d'examen est sélectionné
        $('#id_exam_type').change(function() {
            var examTypeId = $(this).val();
            if (examTypeId) {
                // Faire un appel AJAX pour récupérer le prix de l'examen
                $.ajax({
                    url: '/admin/exams/examtype/' + examTypeId + '/change/',
                    type: 'GET',
                    success: function(data) {
                        // Extraire le prix de la réponse (nécessite parsing HTML)
                        // Pour simplifier, on peut aussi créer un endpoint API dédié
                        console.log('Exam type selected:', examTypeId);
                    },
                    error: function() {
                        console.log('Erreur lors de la récupération du prix');
                    }
                });
            }
        });

        // Calculer automatiquement le prix total quand quantité ou prix unitaire change
        function calculateTotal() {
            var quantity = parseFloat($('#id_quantity').val()) || 0;
            var unitPrice = parseFloat($('#id_unit_price').val()) || 0;
            var total = quantity * unitPrice;
            $('#id_total_price').val(total.toFixed(0));
        }

        $('#id_quantity, #id_unit_price').on('input change', calculateTotal);
        
        // Calculer le total au chargement de la page
        calculateTotal();
    });
})(django.jQuery);
